"""
Text-to-Speech Microservice
────────────────────────────
FastAPI service using edge-tts for high-quality, free TTS.
Supports 400+ voices, SSML, concurrent batch processing, caching.
"""

import asyncio
import hashlib
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, List, Optional

import edge_tts
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("text-to-speech")

# ─── Config ───────────────────────────────────────────────────────────────────

TEMP_DIR = os.environ.get("TEMP_DIR", "/app/temp")
OUTPUT_DIR = os.path.join(TEMP_DIR, "tts_output")
CACHE_DIR = os.path.join(TEMP_DIR, "tts_cache")
MAX_TEXT_LENGTH = int(os.environ.get("MAX_TEXT_LENGTH", "50000"))
MAX_CONCURRENT = int(os.environ.get("MAX_CONCURRENT", "5"))

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

# ─── Semaphore for concurrency control ────────────────────────────────────────

_sem = asyncio.Semaphore(MAX_CONCURRENT)

# ─── Voice registry (cached) ─────────────────────────────────────────────────

_voices_cache: Optional[List[dict]] = None

POPULAR_VOICES = {
    "en-US-GuyNeural": {"name": "Guy", "lang": "en-US", "gender": "Male"},
    "en-US-JennyNeural": {"name": "Jenny", "lang": "en-US", "gender": "Female"},
    "en-US-AriaNeural": {"name": "Aria", "lang": "en-US", "gender": "Female"},
    "en-GB-SoniaNeural": {"name": "Sonia", "lang": "en-GB", "gender": "Female"},
    "en-GB-RyanNeural": {"name": "Ryan", "lang": "en-GB", "gender": "Male"},
    "ja-JP-NanamiNeural": {"name": "Nanami", "lang": "ja-JP", "gender": "Female"},
    "ko-KR-SunHiNeural": {"name": "SunHi", "lang": "ko-KR", "gender": "Female"},
    "zh-CN-XiaoxiaoNeural": {"name": "Xiaoxiao", "lang": "zh-CN", "gender": "Female"},
    "zh-CN-YunxiNeural": {"name": "Yunxi", "lang": "zh-CN", "gender": "Male"},
    "fr-FR-DeniseNeural": {"name": "Denise", "lang": "fr-FR", "gender": "Female"},
    "de-DE-KatjaNeural": {"name": "Katja", "lang": "de-DE", "gender": "Female"},
    "es-ES-ElviraNeural": {"name": "Elvira", "lang": "es-ES", "gender": "Female"},
    "pt-BR-FranciscaNeural": {"name": "Francisca", "lang": "pt-BR", "gender": "Female"},
    "hi-IN-SwaraNeural": {"name": "Swara", "lang": "hi-IN", "gender": "Female"},
    "ar-SA-ZariyahNeural": {"name": "Zariyah", "lang": "ar-SA", "gender": "Female"},
    "km-KH-SreymomNeural": {"name": "Sreymom", "lang": "km-KH", "gender": "Female"},
    "th-TH-PremwadeeNeural": {"name": "Premwadee", "lang": "th-TH", "gender": "Female"},
    "vi-VN-HoaiMyNeural": {"name": "HoaiMy", "lang": "vi-VN", "gender": "Female"},
    "id-ID-GadisNeural": {"name": "Gadis", "lang": "id-ID", "gender": "Female"},
}

# ─── Task store ───────────────────────────────────────────────────────────────

tasks: Dict[str, Dict] = {}

# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _voices_cache
    logger.info("Text-to-Speech starting up...")
    try:
        raw = await edge_tts.list_voices()
        _voices_cache = [
            {
                "id": v["ShortName"],
                "name": v["FriendlyName"],
                "locale": v["Locale"],
                "gender": v["Gender"],
            }
            for v in raw
        ]
        logger.info("Loaded %d voices from edge-tts", len(_voices_cache))
    except Exception as e:
        logger.error("Failed to fetch voice list: %s", e)
        _voices_cache = []
    yield
    logger.info("Text-to-Speech shutting down")

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Text-to-Speech Service",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_start = time.time()

# ─── Models ───────────────────────────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str = Field(..., max_length=MAX_TEXT_LENGTH)
    voice: str = Field(default="en-US-GuyNeural")
    rate: str = Field(default="+0%")
    volume: str = Field(default="+0%")
    pitch: str = Field(default="+0Hz")

class BatchItem(BaseModel):
    text: str = Field(..., max_length=MAX_TEXT_LENGTH)
    voice: str = Field(default="en-US-GuyNeural")
    rate: str = Field(default="+0%")
    volume: str = Field(default="+0%")
    pitch: str = Field(default="+0Hz")
    filename: Optional[str] = None

class BatchRequest(BaseModel):
    items: List[BatchItem] = Field(..., min_length=1, max_length=50)

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "text-to-speech",
        "version": "2.0.0",
        "voices_loaded": len(_voices_cache) if _voices_cache else 0,
        "uptime": round(time.time() - _start, 1),
    }

# ─── Voices ───────────────────────────────────────────────────────────────────

@app.get("/voices")
async def list_voices(locale: Optional[str] = None, gender: Optional[str] = None):
    voices = _voices_cache or []
    if locale:
        voices = [v for v in voices if v["locale"].startswith(locale)]
    if gender:
        voices = [v for v in voices if v["gender"].lower() == gender.lower()]
    return {"voices": voices, "total": len(voices)}

@app.get("/voices/popular")
async def popular_voices():
    return {"voices": POPULAR_VOICES}

# ─── Cache helpers ────────────────────────────────────────────────────────────

def _cache_key(text: str, voice: str, rate: str, volume: str, pitch: str) -> str:
    h = hashlib.sha256(f"{text}|{voice}|{rate}|{volume}|{pitch}".encode()).hexdigest()[:16]
    return h

def _cached_path(key: str) -> Optional[str]:
    p = os.path.join(CACHE_DIR, f"{key}.mp3")
    return p if os.path.exists(p) else None

# ─── Synthesize (single) ─────────────────────────────────────────────────────

@app.post("/synthesize")
async def synthesize(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(400, "Text is empty")

    # Check cache
    ck = _cache_key(req.text, req.voice, req.rate, req.volume, req.pitch)
    cached = _cached_path(ck)
    if cached:
        logger.info("Cache hit: %s", ck)
        return FileResponse(cached, media_type="audio/mpeg", filename="tts_output.mp3")

    task_id = str(uuid.uuid4())
    out_path = os.path.join(OUTPUT_DIR, f"{task_id}.mp3")
    cache_path = os.path.join(CACHE_DIR, f"{ck}.mp3")

    try:
        async with _sem:
            communicate = edge_tts.Communicate(
                req.text,
                req.voice,
                rate=req.rate,
                volume=req.volume,
                pitch=req.pitch,
            )
            await communicate.save(out_path)

        # Copy to cache
        _copy_file(out_path, cache_path)

        return FileResponse(out_path, media_type="audio/mpeg", filename="tts_output.mp3")

    except Exception as e:
        logger.exception("Synthesis failed")
        raise HTTPException(500, f"Synthesis failed: {e}")

# ─── Synthesize async (returns task ID) ──────────────────────────────────────

@app.post("/synthesize_async")
async def synthesize_async(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(400, "Text is empty")

    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "status": "processing",
        "progress": 0,
        "message": "Starting synthesis...",
    }

    asyncio.create_task(_run_synthesis(task_id, req))
    return {"task_id": task_id, "status": "processing"}


async def _run_synthesis(task_id: str, req: TTSRequest):
    out_path = os.path.join(OUTPUT_DIR, f"{task_id}.mp3")
    try:
        tasks[task_id]["progress"] = 30
        tasks[task_id]["message"] = "Generating audio..."

        async with _sem:
            communicate = edge_tts.Communicate(
                req.text,
                req.voice,
                rate=req.rate,
                volume=req.volume,
                pitch=req.pitch,
            )
            await communicate.save(out_path)

        tasks[task_id] = {
            "status": "completed",
            "progress": 100,
            "message": "Done",
            "file": out_path,
        }
    except Exception as e:
        logger.exception("Async synthesis failed for %s", task_id)
        tasks[task_id] = {
            "status": "failed",
            "progress": 0,
            "message": str(e),
        }

# ─── Batch synthesis (concurrent) ────────────────────────────────────────────

@app.post("/batch")
async def batch_synthesize(req: BatchRequest):
    task_id = str(uuid.uuid4())
    count = len(req.items)

    tasks[task_id] = {
        "status": "processing",
        "progress": 0,
        "message": f"Processing 0/{count} items...",
        "results": [],
    }

    asyncio.create_task(_run_batch(task_id, req.items))
    return {"task_id": task_id, "total": count, "status": "processing"}


async def _run_batch(task_id: str, items: List[BatchItem]):
    results = []
    total = len(items)
    completed = 0

    async def _process_one(idx: int, item: BatchItem):
        nonlocal completed
        iid = str(uuid.uuid4())
        out = os.path.join(OUTPUT_DIR, f"{iid}.mp3")
        try:
            async with _sem:
                comm = edge_tts.Communicate(
                    item.text,
                    item.voice,
                    rate=item.rate,
                    volume=item.volume,
                    pitch=item.pitch,
                )
                await comm.save(out)
            completed += 1
            return {
                "index": idx,
                "status": "completed",
                "file_id": iid,
                "filename": item.filename or f"item_{idx}.mp3",
            }
        except Exception as e:
            completed += 1
            return {
                "index": idx,
                "status": "failed",
                "error": str(e),
            }

    # Run concurrently with semaphore limiting parallelism
    coros = [_process_one(i, item) for i, item in enumerate(items)]
    gathered = await asyncio.gather(*coros, return_exceptions=True)

    for r in gathered:
        if isinstance(r, Exception):
            results.append({"status": "failed", "error": str(r)})
        else:
            results.append(r)

    ok = sum(1 for r in results if r.get("status") == "completed")
    tasks[task_id] = {
        "status": "completed",
        "progress": 100,
        "message": f"Done — {ok}/{total} succeeded",
        "results": results,
    }

# ─── Status / Download ───────────────────────────────────────────────────────

@app.get("/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(404, "Task not found")
    return tasks[task_id]

@app.get("/download/{file_id}")
async def download(file_id: str):
    # Sanitize
    safe = file_id.replace("/", "").replace("\\", "").replace("..", "")
    path = os.path.join(OUTPUT_DIR, f"{safe}.mp3")
    if not os.path.isfile(path):
        raise HTTPException(404, "File not found")
    return FileResponse(path, media_type="audio/mpeg", filename=f"{safe}.mp3")

# ─── Cleanup ──────────────────────────────────────────────────────────────────

@app.post("/cleanup")
async def cleanup(max_age_hours: int = 24):
    now = time.time()
    removed = 0
    for d in [OUTPUT_DIR, CACHE_DIR]:
        for f in os.listdir(d):
            fp = os.path.join(d, f)
            if os.path.isfile(fp) and (now - os.path.getmtime(fp)) > max_age_hours * 3600:
                os.remove(fp)
                removed += 1
    return {"removed": removed}

# ─── Utils ────────────────────────────────────────────────────────────────────

def _copy_file(src: str, dst: str):
    try:
        import shutil
        shutil.copy2(src, dst)
    except Exception:
        pass

# ─── Entry ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=1,
        log_level="info",
    )
