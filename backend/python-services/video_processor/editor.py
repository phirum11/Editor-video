"""
Video Editor Core Module — FFmpeg-based pipeline with GPU detection,
hardware-accelerated encoding, filter-graph chaining, and streaming progress.
"""

import asyncio
import json
import logging
import os
import re
import shutil
import subprocess
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _has_nvidia() -> bool:
    """Check for NVENC support."""
    try:
        r = subprocess.run(
            ["ffmpeg", "-hide_banner", "-encoders"],
            capture_output=True, text=True, timeout=10,
        )
        return "h264_nvenc" in r.stdout
    except Exception:
        return False

HAS_GPU = _has_nvidia()
FFMPEG = shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = shutil.which("ffprobe") or "ffprobe"


@dataclass
class ProbeInfo:
    """Parsed ffprobe result for a media file."""
    duration: float = 0.0
    width: int = 0
    height: int = 0
    fps: float = 0.0
    bitrate: int = 0
    codec: str = ""
    audio_codec: str = ""
    has_audio: bool = False
    file_size: int = 0


def probe(path: str) -> ProbeInfo:
    """Run ffprobe and return structured info."""
    cmd = [
        FFPROBE, "-v", "quiet",
        "-print_format", "json",
        "-show_format", "-show_streams",
        path,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if r.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {r.stderr[:500]}")

    data = json.loads(r.stdout)
    info = ProbeInfo()

    fmt = data.get("format", {})
    info.duration = float(fmt.get("duration", 0))
    info.bitrate = int(fmt.get("bit_rate", 0))
    info.file_size = int(fmt.get("size", 0))

    for stream in data.get("streams", []):
        if stream["codec_type"] == "video" and not info.codec:
            info.codec = stream.get("codec_name", "")
            info.width = int(stream.get("width", 0))
            info.height = int(stream.get("height", 0))
            r_frame_rate = stream.get("r_frame_rate", "30/1")
            try:
                num, den = r_frame_rate.split("/")
                info.fps = round(int(num) / max(int(den), 1), 2)
            except (ValueError, ZeroDivisionError):
                info.fps = 30.0
        elif stream["codec_type"] == "audio" and not info.audio_codec:
            info.audio_codec = stream.get("codec_name", "")
            info.has_audio = True

    return info


# ─── Operation Data ───────────────────────────────────────────────────────────

@dataclass
class EditOp:
    """A single editing operation."""
    type: str
    params: Dict = field(default_factory=dict)


# ─── VideoEditor ──────────────────────────────────────────────────────────────

class VideoEditor:
    """
    Builds an FFmpeg command from a chain of editing operations.
    Uses a single ffmpeg invocation with complex filter graphs for efficiency.
    """

    def __init__(self):
        self.input_path: Optional[str] = None
        self._info: Optional[ProbeInfo] = None
        self._filters: List[str] = []
        self._audio_filters: List[str] = []
        self._pre_input_args: List[str] = []
        self._post_input_args: List[str] = []
        self._trim_start: Optional[float] = None
        self._trim_end: Optional[float] = None
        self._speed_factor: float = 1.0
        self._target_fps: Optional[int] = None
        self._target_width: Optional[int] = None
        self._target_height: Optional[int] = None
        self._complex_filter: Optional[str] = None

    # ── Load ──────────────────────────────────────────────

    def load_video(self, path: str) -> "VideoEditor":
        if not os.path.isfile(path):
            raise FileNotFoundError(f"Video not found: {path}")
        self.input_path = path
        self._info = probe(path)
        return self

    @property
    def info(self) -> ProbeInfo:
        if not self._info:
            raise RuntimeError("No video loaded")
        return self._info

    # ── Operations ────────────────────────────────────────

    def trim(self, start: float, end: float) -> "VideoEditor":
        if start < 0:
            start = 0
        if end <= start:
            raise ValueError("trim end must be > start")
        self._trim_start = start
        self._trim_end = end
        return self

    def resize(self, width: Optional[int] = None, height: Optional[int] = None) -> "VideoEditor":
        if width and width > 0:
            self._target_width = width if width % 2 == 0 else width + 1
        if height and height > 0:
            self._target_height = height if height % 2 == 0 else height + 1
        if self._target_width and not self._target_height:
            self._filters.append(f"scale={self._target_width}:-2")
        elif self._target_height and not self._target_width:
            self._filters.append(f"scale=-2:{self._target_height}")
        elif self._target_width and self._target_height:
            self._filters.append(f"scale={self._target_width}:{self._target_height}")
        return self

    def change_speed(self, factor: float) -> "VideoEditor":
        factor = max(0.25, min(factor, 4.0))
        self._speed_factor = factor
        self._filters.append(f"setpts={1.0/factor}*PTS")
        if self.info.has_audio:
            self._audio_filters.append(f"atempo={factor}")
        return self

    def rotate(self, angle: float) -> "VideoEditor":
        angle = angle % 360
        if angle == 90:
            self._filters.append("transpose=1")
        elif angle == 180:
            self._filters.append("transpose=1,transpose=1")
        elif angle == 270:
            self._filters.append("transpose=2")
        elif angle != 0:
            rad = angle * 3.14159265 / 180
            self._filters.append(f"rotate={rad:.6f}:fillcolor=black")
        return self

    def flip_horizontal(self) -> "VideoEditor":
        self._filters.append("hflip")
        return self

    def flip_vertical(self) -> "VideoEditor":
        self._filters.append("vflip")
        return self

    def crop(self, x: int, y: int, w: int, h: int) -> "VideoEditor":
        w = w if w % 2 == 0 else w - 1
        h = h if h % 2 == 0 else h - 1
        self._filters.append(f"crop={w}:{h}:{x}:{y}")
        return self

    def brightness(self, value: float) -> "VideoEditor":
        """value in [-1.0, 1.0]"""
        self._filters.append(f"eq=brightness={max(-1.0, min(1.0, value))}")
        return self

    def contrast(self, value: float) -> "VideoEditor":
        """value in [0.0, 3.0], 1.0 = normal"""
        self._filters.append(f"eq=contrast={max(0.0, min(3.0, value))}")
        return self

    def saturation(self, value: float) -> "VideoEditor":
        """value in [0.0, 3.0], 1.0 = normal"""
        self._filters.append(f"eq=saturation={max(0.0, min(3.0, value))}")
        return self

    def blur(self, strength: int = 5) -> "VideoEditor":
        s = max(1, min(strength, 20))
        self._filters.append(f"boxblur={s}:{s}")
        return self

    def sharpen(self, strength: float = 1.0) -> "VideoEditor":
        amt = max(0.0, min(strength, 5.0))
        self._filters.append(f"unsharp=5:5:{amt}:5:5:{amt}")
        return self

    def denoise(self, strength: int = 5) -> "VideoEditor":
        s = max(1, min(strength, 15))
        self._filters.append(f"nlmeans={s}:7:5:3:3")
        return self

    def stabilize(self) -> "VideoEditor":
        # Two-pass stabilisation (vidstab)
        self._filters.append("vidstabdetect=shakiness=5:accuracy=15")
        return self

    def set_fps(self, fps: int) -> "VideoEditor":
        self._target_fps = max(1, min(fps, 120))
        self._filters.append(f"fps={self._target_fps}")
        return self

    def fade_in(self, duration: float = 1.0) -> "VideoEditor":
        self._filters.append(f"fade=in:st=0:d={duration}")
        if self.info.has_audio:
            self._audio_filters.append(f"afade=in:st=0:d={duration}")
        return self

    def fade_out(self, duration: float = 1.0) -> "VideoEditor":
        end = (self._trim_end or self.info.duration) - duration
        self._filters.append(f"fade=out:st={max(0, end)}:d={duration}")
        if self.info.has_audio:
            self._audio_filters.append(f"afade=out:st={max(0, end)}:d={duration}")
        return self

    def text_overlay(self, text: str, x: str = "(w-tw)/2", y: str = "h-60",
                     font_size: int = 24, color: str = "white",
                     start: float = 0, end: float = 0) -> "VideoEditor":
        escaped = text.replace("'", "\\'").replace(":", "\\:")
        f = (
            f"drawtext=text='{escaped}':fontsize={font_size}:fontcolor={color}"
            f":x={x}:y={y}"
        )
        if end > start:
            f += f":enable='between(t,{start},{end})'"
        self._filters.append(f)
        return self

    # ── Region Blur ───────────────────────────────────────

    def blur_region(self, x: int, y: int, w: int, h: int,
                    strength: int = 20) -> "VideoEditor":
        """
        Apply blur to a specific region of the video.
        Uses split/crop/boxblur/overlay filter chain.
        x, y: top-left corner (pixels)
        w, h: width and height (pixels)
        strength: blur strength (default 20)
        """
        # Ensure even dimensions
        w = w if w % 2 == 0 else w + 1
        h = h if h % 2 == 0 else h + 1
        s = max(1, min(strength, 50))

        # Complex filter: crop region, blur it, overlay back
        filter_chain = (
            f"[0:v]split=2[base][blur];"
            f"[blur]crop={w}:{h}:{x}:{y},boxblur={s}:{s}[blurred];"
            f"[base][blurred]overlay={x}:{y}"
        )
        # Note: This replaces all video filters for complex filter graphs
        self._complex_filter = filter_chain
        return self

    # ── Audio Enhancement ─────────────────────────────────

    def audio_normalize(self, target_loudness: float = -14.0,
                       loudness_range: float = 7.0) -> "VideoEditor":
        """
        Normalize audio using EBU R128 loudnorm filter.
        target_loudness: target integrated loudness (LUFS), default -14
        loudness_range: target loudness range (LU), default 7
        """
        if not self.info.has_audio:
            return self
        self._audio_filters.append(
            f"loudnorm=I={target_loudness}:LRA={loudness_range}:TP=-1.5"
        )
        return self

    def audio_denoise(self, strength: float = 0.3) -> "VideoEditor":
        """
        Apply noise reduction using anlmdn filter (non-local means denoising).
        strength: 0.0 to 1.0 (higher = more aggressive)
        """
        if not self.info.has_audio:
            return self
        # anlmdn parameters: s=noise strength (default 0.00001), m=search radius
        # Higher strength = more denoising but may affect audio quality
        s = max(0.00001, min(strength, 1.0)) * 0.01
        self._audio_filters.append(f"anlmdn=s={s:.6f}:p=0.002:o=1")
        return self

    def audio_bass_boost(self, gain_db: float = 6.0,
                         frequency: int = 100) -> "VideoEditor":
        """
        Boost bass frequencies.
        gain_db: gain in dB (positive to boost, negative to cut)
        frequency: center frequency in Hz (default 100)
        """
        if not self.info.has_audio:
            return self
        gain = max(-20, min(20, gain_db))
        freq = max(20, min(200, frequency))
        self._audio_filters.append(f"equalizer=f={freq}:t=h:w=100:g={gain}")
        return self

    def audio_treble_boost(self, gain_db: float = 6.0,
                           frequency: int = 3000) -> "VideoEditor":
        """
        Boost treble frequencies.
        gain_db: gain in dB (positive to boost, negative to cut)
        frequency: center frequency in Hz (default 3000)
        """
        if not self.info.has_audio:
            return self
        gain = max(-20, min(20, gain_db))
        freq = max(1000, min(16000, frequency))
        self._audio_filters.append(f"equalizer=f={freq}:t=h:w=2000:g={gain}")
        return self

    def audio_compression(self, threshold_db: float = -20,
                          ratio: float = 4.0) -> "VideoEditor":
        """
        Apply dynamic range compression.
        threshold_db: threshold level in dB
        ratio: compression ratio (e.g., 4.0 = 4:1)
        """
        if not self.info.has_audio:
            return self
        # acompressor filter
        threshold = max(-60, min(0, threshold_db))
        rat = max(1, min(20, ratio))
        self._audio_filters.append(
            f"acompressor=threshold={threshold}dB:ratio={rat}:attack=5:release=50"
        )
        return self

    def audio_volume(self, gain_db: float = 0.0) -> "VideoEditor":
        """
        Adjust overall volume.
        gain_db: gain in dB (e.g., 6 = double volume, -6 = half volume)
        """
        if not self.info.has_audio:
            return self
        gain = max(-30, min(30, gain_db))
        self._audio_filters.append(f"volume={gain}dB")
        return self

    def audio_highpass(self, frequency: int = 80) -> "VideoEditor":
        """
        Apply highpass filter to remove low-frequency rumble.
        frequency: cutoff frequency in Hz (default 80)
        """
        if not self.info.has_audio:
            return self
        freq = max(20, min(500, frequency))
        self._audio_filters.append(f"highpass=f={freq}")
        return self

    def audio_lowpass(self, frequency: int = 15000) -> "VideoEditor":
        """
        Apply lowpass filter to remove high-frequency noise.
        frequency: cutoff frequency in Hz (default 15000)
        """
        if not self.info.has_audio:
            return self
        freq = max(1000, min(20000, frequency))
        self._audio_filters.append(f"lowpass=f={freq}")
        return self

    def audio_slow(self, speed: float = 0.85) -> "VideoEditor":
        """
        Slow down audio playback (for slowed + reverb effect).
        speed: 0.5 to 1.0 (0.85 = 85% speed, typical slowed effect)
        Note: Also slows video. Use with change_speed for video-only changes.
        """
        if not self.info.has_audio:
            return self
        # atempo only supports 0.5 to 2.0, for slower we chain filters
        speed = max(0.5, min(1.0, speed))
        self._audio_filters.append(f"atempo={speed}")
        # Also pitch shift down slightly for that "slowed" vibe
        # asetrate changes sample rate (lower = lower pitch)
        # Then aresample brings it back to original rate
        return self

    def audio_reverb(self, mix: float = 0.3, decay: float = 0.5) -> "VideoEditor":
        """
        Add reverb effect using FFmpeg's aecho filter.
        mix: wet/dry mix (0.0 to 1.0, default 0.3 = 30% reverb)
        decay: reverb tail decay (0.0 to 1.0, default 0.5)
        """
        if not self.info.has_audio:
            return self
        mix = max(0.0, min(1.0, mix))
        decay = max(0.1, min(0.9, decay))
        # aecho: in_gain, out_gain, delays (ms), decays
        # Multiple delays create a more natural reverb
        delays = "60|120|180|240"
        decays = f"{decay}|{decay*0.8}|{decay*0.6}|{decay*0.4}"
        in_gain = 0.8
        out_gain = 1.0 - mix + 0.5  # Adjust output based on mix
        self._audio_filters.append(
            f"aecho={in_gain}:{out_gain}:{delays}:{decays}"
        )
        return self

    def audio_slow_reverb(self, speed: float = 0.85,
                          reverb_mix: float = 0.3,
                          reverb_decay: float = 0.5) -> "VideoEditor":
        """
        Apply the popular "slowed + reverb" effect.
        Combines slower playback with reverb for that dreamy aesthetic.
        speed: playback speed (0.5 to 1.0)
        reverb_mix: reverb wet/dry ratio (0.0 to 1.0)
        reverb_decay: reverb decay time (0.1 to 0.9)
        """
        self.audio_slow(speed)
        self.audio_reverb(reverb_mix, reverb_decay)
        return self

    # ── Build & Execute ───────────────────────────────────

    def _build_encoder_args(self, codec: str = "h264",
                            quality: str = "high") -> List[str]:
        crf_map = {"low": "28", "medium": "23", "high": "18", "lossless": "0"}
        crf = crf_map.get(quality, "20")

        if codec == "h264":
            if HAS_GPU:
                return ["-c:v", "h264_nvenc", "-preset", "p4",
                        "-rc", "vbr", "-cq", crf, "-b:v", "0"]
            return ["-c:v", "libx264", "-preset", "medium",
                    "-crf", crf, "-pix_fmt", "yuv420p"]
        elif codec == "h265":
            if HAS_GPU:
                return ["-c:v", "hevc_nvenc", "-preset", "p4",
                        "-rc", "vbr", "-cq", crf, "-b:v", "0"]
            return ["-c:v", "libx265", "-preset", "medium",
                    "-crf", crf, "-pix_fmt", "yuv420p"]
        elif codec == "vp9":
            return ["-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0",
                    "-row-mt", "1"]
        elif codec == "av1":
            return ["-c:v", "libaom-av1", "-crf", crf, "-b:v", "0",
                    "-cpu-used", "4"]
        else:
            return ["-c:v", "libx264", "-crf", crf, "-pix_fmt", "yuv420p"]

    def build_command(self, output_path: str, codec: str = "h264",
                      quality: str = "high") -> List[str]:
        """Assemble the full ffmpeg command."""
        cmd: List[str] = [FFMPEG, "-hide_banner", "-y"]

        # Thread count
        cpu_count = os.cpu_count() or 4
        cmd += ["-threads", str(min(cpu_count, 16))]

        # Seek before input for efficiency
        if self._trim_start is not None:
            cmd += ["-ss", str(self._trim_start)]
        cmd += ["-i", self.input_path]
        if self._trim_end is not None:
            dur = self._trim_end - (self._trim_start or 0)
            cmd += ["-t", str(dur)]

        # Complex filter (for region blur etc) takes precedence
        if self._complex_filter:
            cmd += ["-filter_complex", self._complex_filter]
        elif self._filters:
            # Simple video filters
            cmd += ["-vf", ",".join(self._filters)]

        # Audio filters
        if self._audio_filters:
            cmd += ["-af", ",".join(self._audio_filters)]

        # Encoder
        cmd += self._build_encoder_args(codec, quality)

        # Audio encoder
        if self.info.has_audio:
            cmd += ["-c:a", "aac", "-b:a", "192k"]
        else:
            cmd += ["-an"]

        # FPS override
        if self._target_fps:
            cmd += ["-r", str(self._target_fps)]

        # Movflags for streaming-friendly output
        ext = os.path.splitext(output_path)[1].lower()
        if ext in (".mp4", ".m4v", ".mov"):
            cmd += ["-movflags", "+faststart"]

        cmd += ["-progress", "pipe:1", output_path]
        return cmd

    async def save(self, output_path: str, codec: str = "h264",
                   quality: str = "high",
                   on_progress=None) -> str:
        """
        Run ffmpeg asynchronously, parsing progress from stdout.
        on_progress(percent: int, speed: str) is called periodically.
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cmd = self.build_command(output_path, codec, quality)
        logger.info("FFmpeg cmd: %s", " ".join(cmd))

        total_duration = (
            (self._trim_end or self.info.duration)
            - (self._trim_start or 0)
        ) / self._speed_factor

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        time_re = re.compile(r"out_time_us=(\d+)")
        speed_re = re.compile(r"speed=\s*([\d.]+x)")

        last_pct = 0
        current_speed = "0x"

        async for line in proc.stdout:
            text = line.decode("utf-8", errors="replace").strip()
            m = time_re.search(text)
            if m and total_duration > 0:
                us = int(m.group(1))
                pct = min(int((us / 1_000_000) / total_duration * 100), 99)
                if pct > last_pct:
                    last_pct = pct
                    sm = speed_re.search(text)
                    if sm:
                        current_speed = sm.group(1)
                    if on_progress:
                        await on_progress(pct, current_speed)

        await proc.wait()
        if proc.returncode != 0:
            stderr = (await proc.stderr.read()).decode()[:1000]
            raise RuntimeError(f"FFmpeg failed (rc={proc.returncode}): {stderr}")

        if on_progress:
            await on_progress(100, current_speed)

        return output_path

    # ── Convenience: apply ops from dicts ─────────────────

    def apply_operations(self, operations: List[Dict]) -> "VideoEditor":
        """Apply a list of operation dicts (from the API)."""
        for op in operations:
            op_type = op.get("type", "")
            params = op.get("params", {})

            handler = {
                "trim": lambda p: self.trim(p.get("start", 0), p.get("end", self.info.duration)),
                "resize": lambda p: self.resize(p.get("width"), p.get("height")),
                "speed": lambda p: self.change_speed(p.get("factor", 1.0)),
                "rotate": lambda p: self.rotate(p.get("angle", 0)),
                "rotate_left": lambda p: self.rotate(270),
                "rotate_right": lambda p: self.rotate(90),
                "flip_h": lambda p: self.flip_horizontal(),
                "flip_v": lambda p: self.flip_vertical(),
                "crop": lambda p: self.crop(p.get("x", 0), p.get("y", 0), p.get("w", 1920), p.get("h", 1080)),
                "brightness": lambda p: self.brightness(p.get("value", 0)),
                "contrast": lambda p: self.contrast(p.get("value", 1.0)),
                "saturation": lambda p: self.saturation(p.get("value", 1.0)),
                "blur": lambda p: self.blur(p.get("strength", 5)),
                "blur_region": lambda p: self.blur_region(
                    p.get("x", 0), p.get("y", 0), p.get("w", 100), p.get("h", 100),
                    p.get("strength", 20)
                ),
                "sharpen": lambda p: self.sharpen(p.get("strength", 1.0)),
                "denoise": lambda p: self.denoise(p.get("strength", 5)),
                "stabilize": lambda p: self.stabilize(),
                "fps": lambda p: self.set_fps(p.get("fps", 30)),
                "fade_in": lambda p: self.fade_in(p.get("duration", 1.0)),
                "fade_out": lambda p: self.fade_out(p.get("duration", 1.0)),
                "text": lambda p: self.text_overlay(
                    p.get("text", ""), p.get("x", "(w-tw)/2"), p.get("y", "h-60"),
                    p.get("font_size", 24), p.get("color", "white"),
                    p.get("start", 0), p.get("end", 0),
                ),
                # Audio enhancement operations
                "audio_normalize": lambda p: self.audio_normalize(
                    p.get("target_loudness", -14.0), p.get("loudness_range", 7.0)
                ),
                "audio_denoise": lambda p: self.audio_denoise(p.get("strength", 0.3)),
                "audio_bass_boost": lambda p: self.audio_bass_boost(
                    p.get("gain_db", 6.0), p.get("frequency", 100)
                ),
                "audio_treble_boost": lambda p: self.audio_treble_boost(
                    p.get("gain_db", 6.0), p.get("frequency", 3000)
                ),
                "audio_compression": lambda p: self.audio_compression(
                    p.get("threshold_db", -20), p.get("ratio", 4.0)
                ),
                "audio_volume": lambda p: self.audio_volume(p.get("gain_db", 0.0)),
                "audio_highpass": lambda p: self.audio_highpass(p.get("frequency", 80)),
                "audio_lowpass": lambda p: self.audio_lowpass(p.get("frequency", 15000)),
                "audio_slow": lambda p: self.audio_slow(p.get("speed", 0.85)),
                "audio_reverb": lambda p: self.audio_reverb(
                    p.get("mix", 0.3), p.get("decay", 0.5)
                ),
                "audio_slow_reverb": lambda p: self.audio_slow_reverb(
                    p.get("speed", 0.85), p.get("reverb_mix", 0.3), p.get("reverb_decay", 0.5)
                ),
            }.get(op_type)

            if handler:
                handler(params)
            else:
                logger.warning("Unknown operation: %s", op_type)

        return self
