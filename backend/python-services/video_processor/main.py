"""
Video Processor Microservice
─────────────────────────────
FastAPI service that receives video processing requests from the Go backend,
runs FFmpeg via the VideoEditor pipeline, and streams progress back.
"""

import asyncio
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from editor import VideoEditor, probe, ProbeInfo

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("video-processor")

# ─── Paths ────────────────────────────────────────────────────────────────────

TEMP_DIR = os.environ.get("TEMP_DIR", "/app/temp")
UPLOAD_DIR = os.path.join(TEMP_DIR, "uploads")
PROCESSED_DIR = os.path.join(TEMP_DIR, "processed")

for d in (UPLOAD_DIR, PROCESSED_DIR):
    os.makedirs(d, exist_ok=True)

# ─── In-memory task store ─────────────────────────────────────────────────────

tasks: Dict[str, Dict] = {}

# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Video Processor starting  (GPU=%s)", VideoEditor and "checking...")
    from editor import HAS_GPU
    logger.info("GPU acceleration: %s", "NVENC available" if HAS_GPU else "CPU only")
    yield
    logger.info("Video Processor shutting down")

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Video Processor Service",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Models ────────────────────────────────────────────────

class Operation(BaseModel):
    type: str
    params: dict = Field(default_factory=dict)

class ProcessRequest(BaseModel):
    video_path: str
    task_id: str = ""
    operations: List[Operation] = []
    codec: str = "h264"
    quality: str = "high"
    output_format: str = "mp4"

class VideoInfoResponse(BaseModel):
    duration: float
    width: int
    height: int
    fps: float
    bitrate: int
    codec: str
    audio_codec: str
    has_audio: bool
    file_size: int

# ─── Health ───────────────────────────────────────────────────────────────────

_start = time.time()

@app.get("/health")
async def health():
    from editor import HAS_GPU
    return {
        "status": "healthy",
        "service": "video-processor",
        "version": "2.0.0",
        "gpu": HAS_GPU,
        "uptime": round(time.time() - _start, 1),
    }

# ─── Probe ────────────────────────────────────────────────────────────────────

@app.post("/probe")
async def probe_video(request: Request):
    body = await request.json()
    path = body.get("video_path", "")
    if not path or not os.path.isfile(path):
        raise HTTPException(400, "video_path not found")
    try:
        info = probe(path)
        return {
            "duration": info.duration,
            "width": info.width,
            "height": info.height,
            "fps": info.fps,
            "bitrate": info.bitrate,
            "codec": info.codec,
            "audio_codec": info.audio_codec,
            "has_audio": info.has_audio,
            "file_size": info.file_size,
        }
    except Exception as e:
        raise HTTPException(500, str(e))

# ─── Process Video ────────────────────────────────────────────────────────────

@app.post("/process_video")
async def process_video(request: ProcessRequest):
    task_id = request.task_id or str(uuid.uuid4())

    if not os.path.isfile(request.video_path):
        raise HTTPException(400, f"Input file not found: {request.video_path}")

    # Register task
    tasks[task_id] = {
        "status": "processing",
        "progress": 0,
        "message": "Starting...",
        "speed": "0x",
        "started_at": time.time(),
    }

    ext = f".{request.output_format}" if request.output_format else ".mp4"
    output_path = os.path.join(PROCESSED_DIR, f"{task_id}{ext}")

    # Build editor pipeline
    editor = VideoEditor()
    editor.load_video(request.video_path)

    if request.operations:
        editor.apply_operations([op.model_dump() for op in request.operations])

    # Progress callback
    async def on_progress(pct: int, speed: str):
        tasks[task_id].update({
            "progress": pct,
            "speed": speed,
            "message": f"Encoding {pct}% ({speed})",
        })

    # Run async
    try:
        await editor.save(
            output_path,
            codec=request.codec,
            quality=request.quality,
            on_progress=on_progress,
        )
        elapsed = round(time.time() - tasks[task_id]["started_at"], 2)
        tasks[task_id].update({
            "status": "completed",
            "progress": 100,
            "message": f"Done in {elapsed}s",
            "output_path": output_path,
            "elapsed": elapsed,
        })
        logger.info("Task %s completed in %.2fs → %s", task_id, elapsed, output_path)
        return {
            "task_id": task_id,
            "output_path": output_path,
            "status": "completed",
            "elapsed": elapsed,
        }
    except Exception as e:
        logger.exception("Task %s failed", task_id)
        tasks[task_id].update({
            "status": "failed",
            "progress": 0,
            "message": str(e),
        })
        raise HTTPException(500, f"Processing failed: {e}")

# ─── Task Status ──────────────────────────────────────────────────────────────

@app.get("/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(404, "Task not found")
    return tasks[task_id]

# ─── Download ─────────────────────────────────────────────────────────────────

@app.get("/download/{task_id}")
async def download(task_id: str):
    task = tasks.get(task_id)
    if not task or task["status"] != "completed":
        raise HTTPException(404, "File not ready")
    path = task.get("output_path", "")
    if not os.path.isfile(path):
        raise HTTPException(404, "Output file missing")
    return FileResponse(
        path,
        media_type="video/mp4",
        filename=f"{task_id}{os.path.splitext(path)[1]}",
    )

# ─── Cleanup ──────────────────────────────────────────────────────────────────

@app.post("/cleanup")
async def cleanup(request: Request):
    """Remove old processed files older than max_age_hours (default 24)."""
    body = await request.json()
    max_age = body.get("max_age_hours", 24) * 3600
    cutoff = time.time() - max_age
    removed = 0
    for f in os.listdir(PROCESSED_DIR):
        fp = os.path.join(PROCESSED_DIR, f)
        if os.path.isfile(fp) and os.path.getmtime(fp) < cutoff:
            os.remove(fp)
            removed += 1
    return {"removed": removed}

# ─── Entry ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=int(os.environ.get("WORKERS", "2")),
        log_level="info",
    )
