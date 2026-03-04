"""
Speech-to-Text Microservice
────────────────────────────
FastAPI service using OpenAI Whisper for transcription.
Supports multiple models, languages, and streaming progress.
"""

import asyncio
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("speech-to-text")

# ─── Config ───────────────────────────────────────────────────────────────────

MODEL_SIZE = os.environ.get("MODEL_SIZE", "base")
DEVICE = os.environ.get("DEVICE", "cpu")
COMPUTE_TYPE = os.environ.get("COMPUTE_TYPE", "int8" if DEVICE == "cpu" else "float16")
TEMP_DIR = os.environ.get("TEMP_DIR", "/app/temp")
UPLOAD_DIR = os.path.join(TEMP_DIR, "uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)

# ─── Global model holder ─────────────────────────────────────────────────────

whisper_model = None

AVAILABLE_MODELS = ["tiny", "base", "small", "medium", "large-v2", "large-v3"]

SUPPORTED_LANGUAGES = {
    "auto": "Auto-detect",
    "en": "English",
    "zh": "Chinese",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "ja": "Japanese",
    "ko": "Korean",
    "pt": "Portuguese",
    "it": "Italian",
    "ru": "Russian",
    "ar": "Arabic",
    "hi": "Hindi",
    "th": "Thai",
    "vi": "Vietnamese",
    "km": "Khmer",
    "id": "Indonesian",
    "tr": "Turkish",
    "nl": "Dutch",
    "pl": "Polish",
}

# ─── In-memory task store ─────────────────────────────────────────────────────

tasks: Dict[str, Dict] = {}

# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global whisper_model
    logger.info("Loading Whisper model '%s' on %s (%s)...", MODEL_SIZE, DEVICE, COMPUTE_TYPE)
    t0 = time.time()
    try:
        from faster_whisper import WhisperModel
        whisper_model = WhisperModel(
            MODEL_SIZE,
            device=DEVICE,
            compute_type=COMPUTE_TYPE,
        )
        logger.info("Model loaded in %.1fs", time.time() - t0)
    except ImportError:
        logger.warning("faster-whisper not installed — running in STUB mode")
        whisper_model = None
    except Exception as e:
        logger.error("Failed to load model: %s", e)
        whisper_model = None
    yield
    logger.info("Speech-to-Text shutting down")

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Speech-to-Text Service",
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

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "speech-to-text",
        "version": "2.0.0",
        "model": MODEL_SIZE,
        "device": DEVICE,
        "model_loaded": whisper_model is not None,
        "uptime": round(time.time() - _start, 1),
    }

# ─── Languages & Models ──────────────────────────────────────────────────────

@app.get("/languages")
async def list_languages():
    return {"languages": SUPPORTED_LANGUAGES}

@app.get("/models")
async def list_models():
    return {
        "models": AVAILABLE_MODELS,
        "current": MODEL_SIZE,
    }

# ─── Transcribe ───────────────────────────────────────────────────────────────

@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form("auto"),
    model: str = Form("base"),
    task_id: Optional[str] = Form(None),
):
    task_id = task_id or str(uuid.uuid4())

    # Validate language
    if language not in SUPPORTED_LANGUAGES:
        raise HTTPException(400, f"Unsupported language: {language}")

    # Save uploaded file
    safe_name = file.filename.replace("/", "_").replace("\\", "_") if file.filename else "audio"
    file_path = os.path.join(UPLOAD_DIR, f"{task_id}_{safe_name}")

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(400, "Empty file")
        if len(content) > 500 * 1024 * 1024:
            raise HTTPException(413, "File too large (max 500 MB)")
        with open(file_path, "wb") as f:
            f.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to save file: {e}")

    # Register task
    tasks[task_id] = {
        "status": "processing",
        "progress": 10,
        "message": "Transcribing...",
    }

    # Run transcription
    try:
        result = await _do_transcription(task_id, file_path, language)
        return JSONResponse(result)
    except Exception as e:
        logger.exception("Transcription failed for task %s", task_id)
        tasks[task_id] = {"status": "failed", "message": str(e)}
        raise HTTPException(500, f"Transcription failed: {e}")
    finally:
        # Cleanup uploaded file
        try:
            os.remove(file_path)
        except OSError:
            pass


async def _do_transcription(task_id: str, file_path: str, language: str) -> dict:
    """Run whisper in a thread pool to avoid blocking the event loop."""
    if whisper_model is None:
        # Stub mode — return placeholder
        logger.warning("Running in STUB mode (no whisper model)")
        tasks[task_id] = {"status": "completed", "progress": 100, "message": "Done (stub)"}
        return {
            "task_id": task_id,
            "status": "completed",
            "segments": [],
            "text": "[Whisper model not loaded — install faster-whisper]",
            "language": language,
            "duration": 0,
        }

    loop = asyncio.get_running_loop()

    def _transcribe():
        lang = None if language == "auto" else language
        segments_gen, info = whisper_model.transcribe(
            file_path,
            language=lang,
            beam_size=5,
            best_of=5,
            vad_filter=True,
            vad_parameters=dict(
                min_silence_duration_ms=500,
                threshold=0.5,
            ),
        )

        segments = []
        full_text_parts = []
        total_duration = info.duration if info.duration else 1

        for seg in segments_gen:
            segments.append({
                "id": seg.id,
                "start": round(seg.start, 3),
                "end": round(seg.end, 3),
                "text": seg.text.strip(),
                "confidence": round(seg.avg_log_prob, 4) if seg.avg_log_prob else 0,
                "no_speech_prob": round(seg.no_speech_prob, 4) if seg.no_speech_prob else 0,
            })
            full_text_parts.append(seg.text.strip())

            # Update progress
            pct = min(int((seg.end / total_duration) * 90) + 10, 99)
            tasks[task_id].update({
                "progress": pct,
                "message": f"Transcribing {pct}%...",
            })

        detected = info.language if info.language else language
        return segments, " ".join(full_text_parts), detected, total_duration

    segments, full_text, detected_lang, dur = await loop.run_in_executor(None, _transcribe)

    tasks[task_id] = {
        "status": "completed",
        "progress": 100,
        "message": f"Done — {len(segments)} segments",
    }

    return {
        "task_id": task_id,
        "status": "completed",
        "segments": segments,
        "text": full_text,
        "language": detected_lang,
        "duration": round(dur, 2),
        "segment_count": len(segments),
    }

# ─── Task Status ──────────────────────────────────────────────────────────────

@app.get("/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(404, "Task not found")
    return tasks[task_id]

# ─── Result ───────────────────────────────────────────────────────────────────

@app.get("/result/{task_id}")
async def get_result(task_id: str):
    if task_id not in tasks:
        raise HTTPException(404, "Task not found")
    return tasks[task_id]

# ─── Entry ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=1,  # Whisper model is not fork-safe
        log_level="info",
    )
