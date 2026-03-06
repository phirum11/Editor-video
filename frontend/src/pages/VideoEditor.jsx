import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Film,
  Scissors,
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Download,
  Save,
  Plus,
  Trash2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Wand2,
  Sparkles,
  Sliders,
  Palette,
  Music,
  Type,
  Upload,
  Zap,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Repeat,
  Image,
  Sun,
  Contrast,
  Droplets,
  Thermometer,
  Blend,
  Eraser,
  Copy,
  Undo2,
  Redo2,
  ZoomIn,
  X,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Square as SquareIcon,
  CircleOff,
  Move,
  AudioLines
} from 'lucide-react';
import VideoPreview from '../components/editor/VideoPreview';
import Timeline from '../components/editor/Timeline';
import { useToast } from '../hooks/useToast';

// Pure helper — outside component to avoid re-creation
const formatTime = (seconds) => {
  if (!seconds || !isFinite(seconds)) return '00:00.00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * 30);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${f.toString().padStart(2, '0')}`;
};

const VideoEditor = () => {
  // ─── Video State ─────────────────────────────────────────
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoFileName, setVideoFileName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);

  // ─── Editor State ────────────────────────────────────────
  const [activePanel, setActivePanel] = useState('tools');
  const [tracks, setTracks] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [effects, setEffects] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    blur: 0,
    sharpen: 0,
    hue: 0,
    opacity: 100
  });
  const [selectedClip, setSelectedClip] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedSection, setExpandedSection] = useState('edit');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [newSubtitleText, setNewSubtitleText] = useState('');
  const [exportSettings, setExportSettings] = useState({
    format: 'mp4',
    resolution: '1080p',
    quality: 'high',
    codec: 'h264',
    fps: '30',
    bitrate: 'auto'
  });
  const [exportProgress, setExportProgress] = useState(null);

  // ─── Folder Selection State ──────────────────────────────
  const [exportFolderHandle, setExportFolderHandle] = useState(null);
  const [exportFolderName, setExportFolderName] = useState('');

  // ─── Region Blur State ───────────────────────────────────
  const [blurRegions, setBlurRegions] = useState([]);
  const [isDrawingBlur, setIsDrawingBlur] = useState(false);
  const [blurDrawStart, setBlurDrawStart] = useState(null);
  const [tempBlurRegion, setTempBlurRegion] = useState(null);
  const [selectedBlurRegion, setSelectedBlurRegion] = useState(null);
  const [blurMode, setBlurMode] = useState(null); // 'draw', 'move', 'resize', null
  const [blurStrength, setBlurStrength] = useState(20);

  // ─── Audio Enhancement State ─────────────────────────────
  const [audioEnhancement, setAudioEnhancement] = useState({
    normalize: false,
    denoise: false,
    denoiseStrength: 0.3,
    bassBoost: 0,
    trebleBoost: 0,
    compression: false,
    volume: 100,
    // Slow + Reverb effect
    slowReverb: false,
    slowAmount: 0.85, // 0.5 to 1.0 (playback speed)
    reverbMix: 30, // 0 to 100 (wet/dry mix percentage)
    reverbDecay: 50 // 0 to 100 (reverb tail length)
  });

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const currentTimeRef = useRef(0);
  const rafUpdateRef = useRef(null);
  const scrubberFillRef = useRef(null);
  const scrubberThumbRef = useRef(null);
  const timeDisplayRef = useRef(null);
  const { success, error: toastError } = useToast();

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafUpdateRef.current) cancelAnimationFrame(rafUpdateRef.current);
    };
  }, []);

  // ─── Keyboard Shortcuts ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT'
      )
        return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            setCurrentTime((prev) => Math.max(0, prev - 5));
          } else {
            setCurrentTime((prev) => Math.max(0, prev - 1 / 30));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            setCurrentTime((prev) => Math.min(duration, prev + 5));
          } else {
            setCurrentTime((prev) => Math.min(duration, prev + 1 / 30));
          }
          break;
        case 'Home':
          e.preventDefault();
          setCurrentTime(0);
          setIsPlaying(false);
          break;
        case 'End':
          e.preventDefault();
          setCurrentTime(duration);
          setIsPlaying(false);
          break;
        case 'j':
          setCurrentTime((prev) => Math.max(0, prev - 10));
          break;
        case 'k':
          setIsPlaying((prev) => !prev);
          break;
        case 'l':
          setCurrentTime((prev) => Math.min(duration, prev + 10));
          break;
        case 'm':
          setIsMuted((prev) => !prev);
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSave();
          } else {
            handleSplit();
          }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) handleRedo();
            else handleUndo();
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedClip) handleDeleteClip();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'r':
          setIsLooping((prev) => !prev);
          break;
        case ',':
          setPlaybackRate((prev) => Math.max(0.25, prev - 0.25));
          break;
        case '.':
          setPlaybackRate((prev) => Math.min(4, prev + 0.25));
          break;
        case '+':
        case '=':
          setZoom((prev) => Math.min(prev * 1.2, 10));
          break;
        case '-':
          setZoom((prev) => Math.max(prev / 1.2, 0.1));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, selectedClip]);

  // ─── Initialize Tracks ───────────────────────────────────
  const initializeTracks = useCallback((videoDuration, fileName) => {
    setTracks([
      {
        id: 'v1',
        name: 'Video Track 1',
        type: 'video',
        locked: false,
        visible: true,
        muted: false,
        clips: [
          {
            id: 'c1',
            name: fileName || 'Main Video',
            start: 0,
            end: videoDuration,
            duration: videoDuration,
            type: 'video'
          }
        ]
      },
      {
        id: 'a1',
        name: 'Audio Track 1',
        type: 'audio',
        locked: false,
        visible: true,
        muted: false,
        clips: [
          {
            id: 'a1c1',
            name: 'Original Audio',
            start: 0,
            end: videoDuration,
            duration: videoDuration,
            type: 'audio'
          }
        ]
      },
      {
        id: 't1',
        name: 'Text Track',
        type: 'text',
        locked: false,
        visible: true,
        muted: false,
        clips: []
      }
    ]);
    setMarkers([]);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // ─── File Handling ───────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toastError('Please select a video file');
      return;
    }
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoFileName(file.name);
    setCurrentTime(0);
    setIsPlaying(false);
    setEffects({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      blur: 0,
      sharpen: 0,
      hue: 0,
      opacity: 100
    });
    success('Video loaded: ' + file.name);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toastError('Only video files are supported');
      return;
    }
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoFileName(file.name);
    setCurrentTime(0);
    setIsPlaying(false);
    success('Video loaded: ' + file.name);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);

  // ─── Folder Selection ────────────────────────────────────
  const handleSelectFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        toastError('Your browser does not support folder selection');
        return;
      }
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setExportFolderHandle(dirHandle);
      setExportFolderName(dirHandle.name);
      success(`Export folder set: ${dirHandle.name}`);
    } catch (err) {
      if (err.name !== 'AbortError') {
        toastError('Failed to select folder');
      }
    }
  };

  // ─── Blur Region Handlers ────────────────────────────────
  const handleBlurMouseDown = (e, previewRect) => {
    if (blurMode !== 'draw') return;
    const x = ((e.clientX - previewRect.left) / previewRect.width) * 100;
    const y = ((e.clientY - previewRect.top) / previewRect.height) * 100;
    setIsDrawingBlur(true);
    setBlurDrawStart({ x, y });
    setTempBlurRegion({ x, y, width: 0, height: 0, strength: blurStrength });
  };

  const handleBlurMouseMove = (e, previewRect) => {
    if (!isDrawingBlur || !blurDrawStart) return;
    const currentX = ((e.clientX - previewRect.left) / previewRect.width) * 100;
    const currentY = ((e.clientY - previewRect.top) / previewRect.height) * 100;
    const x = Math.min(blurDrawStart.x, currentX);
    const y = Math.min(blurDrawStart.y, currentY);
    const width = Math.abs(currentX - blurDrawStart.x);
    const height = Math.abs(currentY - blurDrawStart.y);
    setTempBlurRegion({ x, y, width, height, strength: blurStrength });
  };

  const handleBlurMouseUp = () => {
    if (
      isDrawingBlur &&
      tempBlurRegion &&
      tempBlurRegion.width > 1 &&
      tempBlurRegion.height > 1
    ) {
      setBlurRegions((prev) => [
        ...prev,
        { ...tempBlurRegion, id: Date.now() }
      ]);
      success('Blur region added');
    }
    setIsDrawingBlur(false);
    setBlurDrawStart(null);
    setTempBlurRegion(null);
  };

  const handleDeleteBlurRegion = (id) => {
    setBlurRegions((prev) => prev.filter((r) => r.id !== id));
    setSelectedBlurRegion(null);
    success('Blur region removed');
  };

  const handleClearAllBlurRegions = () => {
    setBlurRegions([]);
    setSelectedBlurRegion(null);
    success('All blur regions cleared');
  };

  const handleUpdateBlurRegion = (id, updates) => {
    setBlurRegions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  // ─── Callbacks from VideoPreview ─────────────────────────
  const handleDurationChange = useCallback(
    (newDuration) => {
      setDuration(newDuration);
      initializeTracks(newDuration, videoFileName);
    },
    [initializeTracks, videoFileName]
  );

  const handleTimeUpdate = useCallback(
    (time) => {
      currentTimeRef.current = time;

      // Direct DOM updates for scrubber + time display (skip React render)
      if (scrubberFillRef.current && duration > 0) {
        const pct = (time / duration) * 100;
        scrubberFillRef.current.style.width = pct + '%';
        if (scrubberThumbRef.current) {
          scrubberThumbRef.current.style.left = `calc(${pct}% - 7px)`;
        }
      }
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = formatTime(time);
      }

      // Throttled React state update (for Timeline and other dependents)
      if (!rafUpdateRef.current) {
        rafUpdateRef.current = requestAnimationFrame(() => {
          setCurrentTime(currentTimeRef.current);
          rafUpdateRef.current = null;
        });
      }
    },
    [duration]
  );

  // ─── Playback Controls ──────────────────────────────────
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  const handleSeek = (time) =>
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  const handleSkipForward = () =>
    setCurrentTime((prev) => Math.min(duration, prev + 5));
  const handleSkipBack = () => setCurrentTime((prev) => Math.max(0, prev - 5));
  const handleFrameForward = () =>
    setCurrentTime((prev) => Math.min(duration, prev + 1 / 30));
  const handleFrameBack = () =>
    setCurrentTime((prev) => Math.max(0, prev - 1 / 30));

  // ─── Undo / Redo ────────────────────────────────────────
  const pushUndo = (label) => {
    setUndoStack((prev) => [
      ...prev.slice(-50),
      { tracks: JSON.parse(JSON.stringify(tracks)), label }
    ]);
    setRedoStack([]);
  };
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    setRedoStack((prev) => [
      ...prev,
      { tracks: JSON.parse(JSON.stringify(tracks)), label: 'redo' }
    ]);
    const last = undoStack[undoStack.length - 1];
    setTracks(last.tracks);
    setUndoStack((prev) => prev.slice(0, -1));
    success('Undo');
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    setUndoStack((prev) => [
      ...prev,
      { tracks: JSON.parse(JSON.stringify(tracks)), label: 'undo' }
    ]);
    const last = redoStack[redoStack.length - 1];
    setTracks(last.tracks);
    setRedoStack((prev) => prev.slice(0, -1));
    success('Redo');
  };

  // ─── Editing Actions ────────────────────────────────────
  const handleSplit = () => {
    if (!tracks[selectedTrack]) return;
    const track = tracks[selectedTrack];
    const clip = track.clips.find(
      (c) => currentTime > c.start && currentTime < c.end
    );
    if (!clip) return;
    pushUndo('Split');
    const left = {
      ...clip,
      end: currentTime,
      duration: currentTime - clip.start
    };
    const right = {
      ...clip,
      id: `${clip.id}_split_${Date.now()}`,
      start: currentTime,
      duration: clip.end - currentTime
    };
    setTracks(
      tracks.map((t, i) =>
        i !== selectedTrack
          ? t
          : {
              ...t,
              clips: [
                ...t.clips.filter((c) => c.id !== clip.id),
                left,
                right
              ].sort((a, b) => a.start - b.start)
            }
      )
    );
    success('Split at ' + formatTime(currentTime));
  };

  const handleDeleteClip = () => {
    if (!selectedClip) return;
    pushUndo('Delete clip');
    setTracks(
      tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== selectedClip)
      }))
    );
    setSelectedClip(null);
    success('Clip deleted');
  };

  const handleDuplicateClip = () => {
    if (!selectedClip) return;
    pushUndo('Duplicate clip');
    setTracks(
      tracks.map((t) => {
        const clip = t.clips.find((c) => c.id === selectedClip);
        if (!clip) return t;
        const newClip = {
          ...clip,
          id: `${clip.id}_dup_${Date.now()}`,
          start: clip.end,
          end: clip.end + clip.duration
        };
        return {
          ...t,
          clips: [...t.clips, newClip].sort((a, b) => a.start - b.start)
        };
      })
    );
    success('Clip duplicated');
  };

  const handleAddText = () => {
    const textTrack = tracks.find((t) => t.type === 'text');
    if (!textTrack) return;
    pushUndo('Add text');
    const subtitleDuration = 5;
    const newClip = {
      id: `text_${Date.now()}`,
      name: newSubtitleText || 'Text Overlay',
      start: currentTime,
      end: Math.min(currentTime + subtitleDuration, duration),
      duration: subtitleDuration,
      type: 'text',
      text: newSubtitleText || 'New Text'
    };
    setTracks(
      tracks.map((t) =>
        t.id === textTrack.id ? { ...t, clips: [...t.clips, newClip] } : t
      )
    );
    setSubtitles((prev) => [
      ...prev,
      {
        id: newClip.id,
        text: newClip.name,
        start: newClip.start,
        end: newClip.end
      }
    ]);
    setNewSubtitleText('');
    success('Text overlay added');
  };

  const handleAddMarker = () => {
    setMarkers((prev) => [
      ...prev,
      {
        time: currentTime,
        label: `Marker ${prev.length + 1}`,
        color: '#f59e0b'
      }
    ]);
    success('Marker added at ' + formatTime(currentTime));
  };

  const handleExport = useCallback(async () => {
    if (!videoSrc) return;
    setExportProgress(0);

    try {
      // Create an offscreen video element for export
      const exportVideo = document.createElement('video');
      exportVideo.src = videoSrc;
      exportVideo.muted = true;
      exportVideo.playsInline = true;
      exportVideo.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        exportVideo.onloadedmetadata = resolve;
        exportVideo.onerror = reject;
        setTimeout(reject, 10000);
      });

      // Determine export resolution
      const resMap = {
        '4k': { w: 3840, h: 2160 },
        '1080p': { w: 1920, h: 1080 },
        '720p': { w: 1280, h: 720 },
        '480p': { w: 854, h: 480 },
        '360p': { w: 640, h: 360 }
      };
      const res = resMap[exportSettings.resolution] || resMap['1080p'];

      // Scale to fit while keeping aspect ratio
      const videoAspect = exportVideo.videoWidth / exportVideo.videoHeight;
      let canvasW = res.w;
      let canvasH = res.h;
      if (videoAspect > canvasW / canvasH) {
        canvasH = Math.round(canvasW / videoAspect);
      } else {
        canvasW = Math.round(canvasH * videoAspect);
      }

      // Create main canvas
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');

      // Create blur canvas for region blur
      const blurCanvas = document.createElement('canvas');
      blurCanvas.width = canvasW;
      blurCanvas.height = canvasH;
      const blurCtx = blurCanvas.getContext('2d');

      // Build CSS filter string for canvas
      const buildFilter = () => {
        const parts = [];
        if (effects.brightness !== 0)
          parts.push(`brightness(${1 + effects.brightness / 100})`);
        if (effects.contrast !== 0)
          parts.push(`contrast(${1 + effects.contrast / 100})`);
        if (effects.saturation !== 0)
          parts.push(`saturate(${1 + effects.saturation / 100})`);
        if (effects.hue !== 0)
          parts.push(`hue-rotate(${effects.hue * 1.8}deg)`);
        if (effects.temperature !== 0)
          parts.push(`sepia(${Math.abs(effects.temperature) / 100})`);
        if (effects.blur > 0) parts.push(`blur(${effects.blur}px)`);
        return parts.join(' ') || 'none';
      };

      // Apply blur regions to canvas
      const applyBlurRegions = () => {
        if (blurRegions.length === 0) return;

        for (const region of blurRegions) {
          // Calculate pixel coordinates from percentage
          const rx = (region.x / 100) * canvasW;
          const ry = (region.y / 100) * canvasH;
          const rw = (region.width / 100) * canvasW;
          const rh = (region.height / 100) * canvasH;

          // Draw the region to blur canvas with blur filter
          blurCtx.filter = `blur(${region.strength}px)`;
          blurCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, rw, rh);
          blurCtx.filter = 'none';

          // Draw blurred region back to main canvas
          ctx.drawImage(blurCanvas, 0, 0, rw, rh, rx, ry, rw, rh);
        }
      };

      // Determine MIME type and codec
      const mimeMap = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        mov: 'video/mp4',
        avi: 'video/mp4',
        mkv: 'video/webm'
      };
      const codecMap = {
        h264: 'avc1.42E01E',
        h265: 'hvc1',
        vp9: 'vp09.00.10.08',
        av1: 'av01.0.01M.08'
      };

      const baseMime = mimeMap[exportSettings.format] || 'video/webm';
      const codec = codecMap[exportSettings.codec] || '';
      const exportFps = parseInt(exportSettings.fps) || 30;

      // Choose best supported MIME type
      let mimeType = `${baseMime};codecs=${codec}`;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }
        }
      }

      // Bitrate based on quality
      const bitrateMap = {
        lossless: 20_000_000,
        high: 8_000_000,
        medium: 4_000_000,
        low: 1_500_000
      };
      const videoBitsPerSecond =
        bitrateMap[exportSettings.quality] || 8_000_000;

      // Capture stream from canvas
      const stream = canvas.captureStream(exportFps);

      // Add audio track from the video if not muted
      if (!isMuted) {
        try {
          const audioCtx = new AudioContext();
          const source = audioCtx.createMediaElementSource(exportVideo);
          const dest = audioCtx.createMediaStreamDestination();
          const gain = audioCtx.createGain();
          gain.gain.value = volume * (audioEnhancement.volume / 100);
          source.connect(gain);
          gain.connect(dest);
          gain.connect(audioCtx.destination);
          dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
        } catch {
          // Audio capture may fail on some browsers, continue without audio
          console.warn('Audio capture unavailable, exporting video only');
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const exportDone = new Promise((resolve) => {
        recorder.onstop = resolve;
      });

      // Start recording
      recorder.start(100); // collect data every 100ms

      // Seek to beginning and play
      exportVideo.currentTime = 0;
      await new Promise((r) => {
        exportVideo.onseeked = r;
      });
      await exportVideo.play();

      const totalDuration = exportVideo.duration;

      // Render loop — draw frames to canvas with effects + blur regions
      const drawFrame = () => {
        if (exportVideo.ended || exportVideo.paused) return;

        ctx.filter = buildFilter();
        ctx.globalAlpha = effects.opacity / 100;
        ctx.drawImage(exportVideo, 0, 0, canvasW, canvasH);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;

        // Apply selective blur regions
        applyBlurRegions();

        // Update progress
        const pct = Math.min(
          99,
          Math.round((exportVideo.currentTime / totalDuration) * 100)
        );
        setExportProgress(pct);

        requestAnimationFrame(drawFrame);
      };

      drawFrame();

      // Wait for video to finish playing
      await new Promise((resolve) => {
        exportVideo.onended = resolve;
        exportVideo.onpause = resolve;
      });

      // Draw final frame
      ctx.filter = buildFilter();
      ctx.globalAlpha = effects.opacity / 100;
      ctx.drawImage(exportVideo, 0, 0, canvasW, canvasH);
      applyBlurRegions();

      // Stop recording
      recorder.stop();
      await exportDone;

      // Create downloadable file
      const ext = baseMime.includes('webm') ? 'webm' : 'mp4';
      const blob = new Blob(chunks, { type: mimeType });
      const baseName = videoFileName
        ? videoFileName.replace(/\.[^/.]+$/, '')
        : 'exported_video';
      const fileName = `${baseName}_export.${ext}`;

      // Save to selected folder if available, otherwise download
      if (exportFolderHandle) {
        try {
          const fileHandle = await exportFolderHandle.getFileHandle(fileName, {
            create: true
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          setExportProgress(100);
          success(
            `Saved to ${exportFolderName}/${fileName} (${(blob.size / 1024 / 1024).toFixed(1)} MB)`
          );
        } catch (err) {
          console.warn('Folder save failed, falling back to download:', err);
          // Fallback to download
          const downloadUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
          setExportProgress(100);
          success(
            `Export completed! (${(blob.size / 1024 / 1024).toFixed(1)} MB)`
          );
        }
      } else {
        // Default download behavior
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        setExportProgress(100);
        success(
          `Export completed! (${(blob.size / 1024 / 1024).toFixed(1)} MB)`
        );
      }

      exportVideo.remove();
      setTimeout(() => setExportProgress(null), 2000);
    } catch (err) {
      console.error('Export failed:', err);
      toastError('Export failed: ' + (err.message || 'Unknown error'));
      setExportProgress(null);
    }
  }, [
    videoSrc,
    videoFileName,
    effects,
    exportSettings,
    isMuted,
    volume,
    blurRegions,
    audioEnhancement,
    exportFolderHandle,
    exportFolderName,
    success,
    toastError
  ]);

  const handleSave = () => success('Project saved');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────

  const toggleSection = (section) =>
    setExpandedSection(expandedSection === section ? null : section);

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // ─── Render ──────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="flex flex-col h-[calc(100vh-5rem)] bg-gray-950 rounded-xl overflow-hidden border border-gray-800"
    >
      {/* ═══ Top Toolbar ═══════════════════════════════════ */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900/80 border-b border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Film className="w-5 h-5 text-blue-400" />
          <h1 className="text-sm font-semibold text-white">Video Editor</h1>
          {videoFileName && (
            <span
              className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md max-w-[300px] truncate"
              title={videoFileName}
            >
              {videoFileName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition disabled:opacity-30"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            onClick={handleExport}
            disabled={!videoSrc}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ═══ Main Content ══════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Left Panel ───────────────────────────────── */}
        <div className="w-72 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-800">
            {[
              { id: 'tools', icon: Sliders, label: 'Tools' },
              { id: 'effects', icon: Sparkles, label: 'Effects' },
              { id: 'blur', icon: CircleOff, label: 'Blur' },
              { id: 'audio', icon: AudioLines, label: 'Audio' },
              { id: 'subtitles', icon: Type, label: 'Text' },
              { id: 'export', icon: Download, label: 'Export' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex-1 flex flex-col items-center py-2 text-[10px] transition ${
                  activePanel === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800/50'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mb-0.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Tools Panel */}
            {activePanel === 'tools' && (
              <div className="p-2.5 space-y-1">
                <SectionHeader
                  title="Edit Tools"
                  section="edit"
                  expanded={expandedSection}
                  onToggle={toggleSection}
                />
                {expandedSection === 'edit' && (
                  <div className="grid grid-cols-3 gap-1 px-0.5 pb-2">
                    {[
                      {
                        icon: Scissors,
                        label: 'Split',
                        color: 'text-blue-400',
                        action: handleSplit,
                        shortcut: 'S'
                      },
                      {
                        icon: Crop,
                        label: 'Trim',
                        color: 'text-green-400',
                        action: () => success('Trim mode active')
                      },
                      {
                        icon: RotateCw,
                        label: 'Rotate R',
                        color: 'text-purple-400',
                        action: () => success('Rotated 90° CW')
                      },
                      {
                        icon: RotateCcw,
                        label: 'Rotate L',
                        color: 'text-purple-400',
                        action: () => success('Rotated 90° CCW')
                      },
                      {
                        icon: FlipHorizontal,
                        label: 'Flip H',
                        color: 'text-yellow-400',
                        action: () => success('Flipped horizontally')
                      },
                      {
                        icon: FlipVertical,
                        label: 'Flip V',
                        color: 'text-yellow-400',
                        action: () => success('Flipped vertically')
                      },
                      {
                        icon: Zap,
                        label: 'Speed',
                        color: 'text-orange-400',
                        action: () => toggleSection('speed')
                      },
                      {
                        icon: Target,
                        label: 'Stabilize',
                        color: 'text-red-400',
                        action: () => success('Stabilizing...')
                      },
                      {
                        icon: Wand2,
                        label: 'Denoise',
                        color: 'text-pink-400',
                        action: () => success('Denoising...')
                      },
                      {
                        icon: Copy,
                        label: 'Duplicate',
                        color: 'text-cyan-400',
                        action: handleDuplicateClip
                      },
                      {
                        icon: Trash2,
                        label: 'Delete',
                        color: 'text-gray-400',
                        action: handleDeleteClip
                      },
                      {
                        icon: Type,
                        label: 'Text',
                        color: 'text-indigo-400',
                        action: handleAddText
                      }
                    ].map((tool) => (
                      <button
                        key={tool.label}
                        onClick={tool.action}
                        disabled={!videoSrc}
                        title={
                          tool.shortcut
                            ? `${tool.label} (${tool.shortcut})`
                            : tool.label
                        }
                        className="flex flex-col items-center p-2 bg-gray-800/70 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition group"
                      >
                        <tool.icon
                          className={`w-4 h-4 ${tool.color} mb-0.5 group-hover:scale-110 transition-transform`}
                        />
                        <span className="text-[9px] text-gray-400">
                          {tool.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <SectionHeader
                  title="Adjustments"
                  section="adjust"
                  expanded={expandedSection}
                  onToggle={toggleSection}
                />
                {expandedSection === 'adjust' && (
                  <div className="px-2 pb-2 space-y-2.5">
                    {[
                      {
                        label: 'Brightness',
                        key: 'brightness',
                        icon: Sun,
                        min: -100,
                        max: 100
                      },
                      {
                        label: 'Contrast',
                        key: 'contrast',
                        icon: Contrast,
                        min: -100,
                        max: 100
                      },
                      {
                        label: 'Saturation',
                        key: 'saturation',
                        icon: Droplets,
                        min: -100,
                        max: 100
                      },
                      {
                        label: 'Temperature',
                        key: 'temperature',
                        icon: Thermometer,
                        min: -100,
                        max: 100
                      },
                      {
                        label: 'Blur',
                        key: 'blur',
                        icon: Blend,
                        min: 0,
                        max: 20
                      },
                      {
                        label: 'Sharpen',
                        key: 'sharpen',
                        icon: ZoomIn,
                        min: 0,
                        max: 10
                      },
                      {
                        label: 'Opacity',
                        key: 'opacity',
                        icon: Layers,
                        min: 0,
                        max: 100
                      }
                    ].map((adj) => (
                      <div key={adj.key}>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                          <span className="flex items-center gap-1">
                            <adj.icon className="w-3 h-3" />
                            {adj.label}
                          </span>
                          <span className="font-mono">{effects[adj.key]}</span>
                        </div>
                        <input
                          type="range"
                          min={adj.min}
                          max={adj.max}
                          value={effects[adj.key]}
                          onChange={(e) =>
                            setEffects((prev) => ({
                              ...prev,
                              [adj.key]: parseInt(e.target.value)
                            }))
                          }
                          className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setEffects({
                          brightness: 0,
                          contrast: 0,
                          saturation: 0,
                          temperature: 0,
                          blur: 0,
                          sharpen: 0,
                          hue: 0,
                          opacity: 100
                        })
                      }
                      className="w-full text-xs text-gray-500 hover:text-white py-1 transition flex items-center justify-center gap-1"
                    >
                      <Eraser className="w-3 h-3" />
                      Reset All
                    </button>
                  </div>
                )}

                <SectionHeader
                  title="Audio"
                  section="audio"
                  expanded={expandedSection}
                  onToggle={toggleSection}
                />
                {expandedSection === 'audio' && (
                  <div className="px-2 pb-2 space-y-2.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>Volume</span>
                        <span>{Math.round(volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          if (parseFloat(e.target.value) > 0) setIsMuted(false);
                        }}
                        className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { label: 'Fade In', icon: ArrowRight },
                        { label: 'Fade Out', icon: ArrowLeft },
                        { label: 'Normalize', icon: Volume2 },
                        {
                          label: isMuted ? 'Unmute' : 'Mute',
                          icon: isMuted ? Volume2 : VolumeX,
                          action: () => setIsMuted(!isMuted)
                        }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.action || (() => success(item.label))}
                          className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-800/70 hover:bg-gray-700 rounded-lg transition text-[10px] text-gray-400"
                        >
                          <item.icon className="w-3 h-3" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <SectionHeader
                  title="Markers"
                  section="markers"
                  expanded={expandedSection}
                  onToggle={toggleSection}
                />
                {expandedSection === 'markers' && (
                  <div className="px-2 pb-2 space-y-1.5">
                    <button
                      onClick={handleAddMarker}
                      disabled={!videoSrc}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-amber-600/20 text-amber-400 text-xs rounded-lg hover:bg-amber-600/30 transition disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Marker
                    </button>
                    {markers.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2 py-1 bg-gray-800 rounded text-xs"
                      >
                        <button
                          onClick={() => handleSeek(m.time)}
                          className="text-amber-400 hover:text-amber-300"
                        >
                          {m.label}
                        </button>
                        <span className="text-gray-500 font-mono text-[10px]">
                          {formatTime(m.time)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Effects Panel */}
            {activePanel === 'effects' && (
              <div className="p-2.5 space-y-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider px-1">
                  Filter Presets
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    {
                      name: 'Vintage',
                      values: {
                        brightness: -10,
                        contrast: 15,
                        saturation: -30,
                        temperature: 20,
                        blur: 0,
                        sharpen: 0,
                        hue: 15,
                        opacity: 95
                      }
                    },
                    {
                      name: 'Cinematic',
                      values: {
                        brightness: -5,
                        contrast: 25,
                        saturation: 10,
                        temperature: -10,
                        blur: 0,
                        sharpen: 2,
                        hue: 0,
                        opacity: 100
                      }
                    },
                    {
                      name: 'B&W',
                      values: {
                        brightness: 5,
                        contrast: 20,
                        saturation: -100,
                        temperature: 0,
                        blur: 0,
                        sharpen: 1,
                        hue: 0,
                        opacity: 100
                      }
                    },
                    {
                      name: 'Warm',
                      values: {
                        brightness: 5,
                        contrast: 5,
                        saturation: 15,
                        temperature: 40,
                        blur: 0,
                        sharpen: 0,
                        hue: 0,
                        opacity: 100
                      }
                    },
                    {
                      name: 'Cool',
                      values: {
                        brightness: 0,
                        contrast: 10,
                        saturation: -10,
                        temperature: -40,
                        blur: 0,
                        sharpen: 0,
                        hue: -15,
                        opacity: 100
                      }
                    },
                    {
                      name: 'Drama',
                      values: {
                        brightness: -15,
                        contrast: 40,
                        saturation: 20,
                        temperature: 0,
                        blur: 0,
                        sharpen: 3,
                        hue: 0,
                        opacity: 100
                      }
                    },
                    {
                      name: 'Vivid',
                      values: {
                        brightness: 10,
                        contrast: 15,
                        saturation: 50,
                        temperature: 10,
                        blur: 0,
                        sharpen: 2,
                        hue: 0,
                        opacity: 100
                      }
                    },
                    {
                      name: 'Matte',
                      values: {
                        brightness: 10,
                        contrast: -20,
                        saturation: -15,
                        temperature: 5,
                        blur: 0,
                        sharpen: 0,
                        hue: 0,
                        opacity: 90
                      }
                    },
                    {
                      name: 'Sepia',
                      values: {
                        brightness: 0,
                        contrast: 10,
                        saturation: -50,
                        temperature: 50,
                        blur: 0,
                        sharpen: 0,
                        hue: 30,
                        opacity: 95
                      }
                    },
                    {
                      name: 'Noir',
                      values: {
                        brightness: -20,
                        contrast: 35,
                        saturation: -100,
                        temperature: 0,
                        blur: 0,
                        sharpen: 4,
                        hue: 0,
                        opacity: 100
                      }
                    }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setEffects(preset.values);
                        success(`Applied: ${preset.name}`);
                      }}
                      className="px-2.5 py-2.5 bg-gray-800 text-[10px] text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition border border-gray-700/30"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider px-1 pt-1">
                  Color Grading
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    {
                      icon: Palette,
                      label: 'Color',
                      color: 'text-blue-400',
                      action: () => {
                        setEffects((prev) => ({
                          ...prev,
                          saturation: Math.min(100, prev.saturation + 20),
                          hue: prev.hue + 15
                        }));
                        success('Color grading: boosted color');
                      }
                    },
                    {
                      icon: Sliders,
                      label: 'Levels',
                      color: 'text-green-400',
                      action: () => {
                        setEffects((prev) => ({
                          ...prev,
                          brightness: 0,
                          contrast: Math.min(100, prev.contrast + 15)
                        }));
                        success('Levels: auto-adjusted');
                      }
                    },
                    {
                      icon: Layers,
                      label: 'Curves',
                      color: 'text-purple-400',
                      action: () => {
                        setEffects((prev) => ({
                          ...prev,
                          contrast: Math.min(100, prev.contrast + 10),
                          brightness: Math.min(100, prev.brightness + 5),
                          saturation: Math.min(100, prev.saturation + 10)
                        }));
                        success('Curves: S-curve applied');
                      }
                    }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex flex-col items-center p-2 bg-gray-800/70 hover:bg-gray-700 rounded-lg transition"
                    >
                      <item.icon className={`w-4 h-4 ${item.color} mb-0.5`} />
                      <span className="text-[9px] text-gray-400">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider px-1 pt-1">
                  Transitions
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {['Fade', 'Dissolve', 'Wipe', 'Slide', 'Zoom', 'Spin'].map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => success(`Transition: ${t}`)}
                        className="px-2.5 py-2 bg-gray-800 text-[10px] text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition border border-gray-700/30"
                      >
                        {t}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Blur Panel - Selective Region Blur */}
            {activePanel === 'blur' && (
              <div className="p-2.5 space-y-2.5">
                <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-[10px] text-gray-400 mb-2">
                    Draw regions to blur specific areas (like subtitles, faces,
                    etc.)
                  </p>
                  <div className="flex gap-1.5 mb-2">
                    <button
                      onClick={() =>
                        setBlurMode(blurMode === 'draw' ? null : 'draw')
                      }
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg transition ${
                        blurMode === 'draw'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <SquareIcon className="w-3 h-3" />
                      Draw Blur
                    </button>
                    <button
                      onClick={handleClearAllBlurRegions}
                      disabled={blurRegions.length === 0}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600/20 text-red-400 text-xs rounded-lg hover:bg-red-600/30 transition disabled:opacity-30"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">
                      Blur Strength: {blurStrength}px
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={blurStrength}
                      onChange={(e) => setBlurStrength(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                  </div>
                </div>

                {blurMode === 'draw' && (
                  <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
                    <p className="text-[10px] text-blue-300">
                      🎯 Click and drag on the video preview to draw a blur
                      region
                    </p>
                  </div>
                )}

                {/* Full Video Blur */}
                <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  <label className="block text-[10px] text-gray-400 mb-1">
                    Full Video Blur: {effects.blur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={effects.blur}
                    onChange={(e) =>
                      setEffects((prev) => ({
                        ...prev,
                        blur: Number(e.target.value)
                      }))
                    }
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                </div>

                {/* Blur Regions List */}
                {blurRegions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400">
                      Blur Regions ({blurRegions.length})
                    </p>
                    {blurRegions.map((region, index) => (
                      <div
                        key={region.id}
                        className={`flex items-center justify-between p-2 bg-gray-800 rounded-lg border ${
                          selectedBlurRegion === region.id
                            ? 'border-blue-500'
                            : 'border-gray-700'
                        }`}
                        onClick={() => setSelectedBlurRegion(region.id)}
                      >
                        <div className="flex items-center gap-2">
                          <CircleOff className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-[10px] text-gray-300">
                            Region {index + 1}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            {region.strength}px blur
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlurRegion(region.id);
                          }}
                          className="p-1 text-red-400 hover:bg-red-600/20 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {blurRegions.length === 0 && blurMode !== 'draw' && (
                  <div className="text-center py-6">
                    <CircleOff className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-500">No blur regions</p>
                    <p className="text-[9px] text-gray-600">
                      Click "Draw Blur" to add regions
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Audio Panel - Audio Enhancement */}
            {activePanel === 'audio' && (
              <div className="p-2.5 space-y-2.5">
                <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700 space-y-2">
                  <p className="text-[10px] text-gray-300 font-medium">
                    Audio Enhancement
                  </p>

                  {/* Normalize */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[10px] text-gray-400">
                      Normalize Volume
                    </span>
                    <input
                      type="checkbox"
                      checked={audioEnhancement.normalize}
                      onChange={(e) =>
                        setAudioEnhancement((prev) => ({
                          ...prev,
                          normalize: e.target.checked
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  {/* Denoise */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[10px] text-gray-400">
                      Noise Reduction
                    </span>
                    <input
                      type="checkbox"
                      checked={audioEnhancement.denoise}
                      onChange={(e) =>
                        setAudioEnhancement((prev) => ({
                          ...prev,
                          denoise: e.target.checked
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  {audioEnhancement.denoise && (
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">
                        Denoise Strength:{' '}
                        {Math.round(audioEnhancement.denoiseStrength * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={audioEnhancement.denoiseStrength}
                        onChange={(e) =>
                          setAudioEnhancement((prev) => ({
                            ...prev,
                            denoiseStrength: Number(e.target.value)
                          }))
                        }
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                      />
                    </div>
                  )}

                  {/* Compression */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[10px] text-gray-400">
                      Dynamic Compression
                    </span>
                    <input
                      type="checkbox"
                      checked={audioEnhancement.compression}
                      onChange={(e) =>
                        setAudioEnhancement((prev) => ({
                          ...prev,
                          compression: e.target.checked
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                {/* Equalizer */}
                <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700 space-y-2">
                  <p className="text-[10px] text-gray-300 font-medium">
                    Equalizer
                  </p>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">
                      Bass Boost: {audioEnhancement.bassBoost > 0 ? '+' : ''}
                      {audioEnhancement.bassBoost}dB
                    </label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={audioEnhancement.bassBoost}
                      onChange={(e) =>
                        setAudioEnhancement((prev) => ({
                          ...prev,
                          bassBoost: Number(e.target.value)
                        }))
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">
                      Treble Boost:{' '}
                      {audioEnhancement.trebleBoost > 0 ? '+' : ''}
                      {audioEnhancement.trebleBoost}dB
                    </label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={audioEnhancement.trebleBoost}
                      onChange={(e) =>
                        setAudioEnhancement((prev) => ({
                          ...prev,
                          trebleBoost: Number(e.target.value)
                        }))
                      }
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                    />
                  </div>
                </div>

                {/* Volume */}
                <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  <label className="block text-[10px] text-gray-400 mb-1">
                    Output Volume: {audioEnhancement.volume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={audioEnhancement.volume}
                    onChange={(e) =>
                      setAudioEnhancement((prev) => ({
                        ...prev,
                        volume: Number(e.target.value)
                      }))
                    }
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                </div>

                {/* Slow + Reverb Effect */}
                <div className="p-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-purple-300 font-medium">
                      🎵 Slow + Reverb
                    </p>
                    <input
                      type="checkbox"
                      checked={audioEnhancement.slowReverb}
                      onChange={(e) =>
                        setAudioEnhancement((prev) => ({
                          ...prev,
                          slowReverb: e.target.checked
                        }))
                      }
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                  </div>

                  {audioEnhancement.slowReverb && (
                    <>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">
                          Slow Amount:{' '}
                          {Math.round(audioEnhancement.slowAmount * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="1"
                          step="0.05"
                          value={audioEnhancement.slowAmount}
                          onChange={(e) =>
                            setAudioEnhancement((prev) => ({
                              ...prev,
                              slowAmount: Number(e.target.value)
                            }))
                          }
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                        />
                        <p className="text-[9px] text-gray-500 mt-0.5">
                          Lower = slower playback
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">
                          Reverb Mix: {audioEnhancement.reverbMix}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={audioEnhancement.reverbMix}
                          onChange={(e) =>
                            setAudioEnhancement((prev) => ({
                              ...prev,
                              reverbMix: Number(e.target.value)
                            }))
                          }
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">
                          Reverb Decay: {audioEnhancement.reverbDecay}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={audioEnhancement.reverbDecay}
                          onChange={(e) =>
                            setAudioEnhancement((prev) => ({
                              ...prev,
                              reverbDecay: Number(e.target.value)
                            }))
                          }
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-500/20">
                  <p className="text-[9px] text-blue-300">
                    💡 For advanced FFmpeg audio processing (loudnorm, anlmdn,
                    EQ filters), export via the backend server.
                  </p>
                </div>
              </div>
            )}

            {/* Subtitles Panel */}
            {activePanel === 'subtitles' && (
              <div className="p-2.5 space-y-2.5">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter subtitle text..."
                    value={newSubtitleText}
                    onChange={(e) => setNewSubtitleText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
                    className="flex-1 px-2.5 py-2 bg-gray-800 text-sm text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none placeholder-gray-600"
                  />
                  <button
                    onClick={handleAddText}
                    disabled={!videoSrc}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {subtitles.length > 0 ? (
                  <div className="space-y-1">
                    {subtitles.map((sub, i) => (
                      <div
                        key={sub.id || i}
                        className="p-2 bg-gray-800 rounded-lg group"
                      >
                        <p className="text-xs text-gray-300 truncate">
                          {sub.text}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-gray-500 font-mono">
                            {formatTime(sub.start)} → {formatTime(sub.end)}
                          </p>
                          <button
                            onClick={() => {
                              setSubtitles((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              );
                              success('Subtitle removed');
                            }}
                            className="text-red-400 opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Type className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-500">
                      No subtitles yet
                    </p>
                    <p className="text-[9px] text-gray-600">
                      Type text and press Enter
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Export Panel */}
            {activePanel === 'export' && (
              <div className="p-2.5 space-y-2.5">
                {/* Folder Selection */}
                <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  <label className="block text-[10px] text-gray-400 mb-1">
                    Save Location
                  </label>
                  <button
                    onClick={handleSelectFolder}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    {exportFolderName || 'Select Folder'}
                  </button>
                  {exportFolderName && (
                    <p className="text-[9px] text-green-400 mt-1 truncate">
                      📁 {exportFolderName}
                    </p>
                  )}
                </div>

                {[
                  {
                    label: 'Format',
                    key: 'format',
                    options: [
                      { value: 'mp4', label: 'MP4' },
                      { value: 'mov', label: 'MOV' },
                      { value: 'webm', label: 'WebM' },
                      { value: 'avi', label: 'AVI' },
                      { value: 'mkv', label: 'MKV' }
                    ]
                  },
                  {
                    label: 'Resolution',
                    key: 'resolution',
                    options: [
                      { value: '4k', label: '4K (3840×2160)' },
                      { value: '1080p', label: '1080p (1920×1080)' },
                      { value: '720p', label: '720p (1280×720)' },
                      { value: '480p', label: '480p (854×480)' },
                      { value: '360p', label: '360p (640×360)' }
                    ]
                  },
                  {
                    label: 'Quality',
                    key: 'quality',
                    options: [
                      { value: 'lossless', label: 'Lossless' },
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' }
                    ]
                  },
                  {
                    label: 'Codec',
                    key: 'codec',
                    options: [
                      { value: 'h264', label: 'H.264' },
                      { value: 'h265', label: 'H.265 / HEVC' },
                      { value: 'vp9', label: 'VP9' },
                      { value: 'av1', label: 'AV1' }
                    ]
                  },
                  {
                    label: 'FPS',
                    key: 'fps',
                    options: [
                      { value: '24', label: '24 fps' },
                      { value: '25', label: '25 fps' },
                      { value: '30', label: '30 fps' },
                      { value: '60', label: '60 fps' },
                      { value: '120', label: '120 fps' }
                    ]
                  }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] text-gray-400 mb-0.5">
                      {field.label}
                    </label>
                    <select
                      value={exportSettings[field.key]}
                      onChange={(e) =>
                        setExportSettings((prev) => ({
                          ...prev,
                          [field.key]: e.target.value
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-gray-800 text-xs text-gray-300 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {exportProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>
                        {exportProgress >= 100
                          ? '✅ Export completed!'
                          : 'Exporting...'}
                      </span>
                      <span>{Math.min(exportProgress, 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${exportProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{
                          width: `${Math.min(exportProgress, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleExport}
                  disabled={!videoSrc || exportProgress !== null}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white text-xs rounded-lg transition mt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Start Export
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Center: Preview + Transport ──────────────── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Video Preview */}
          <div
            className={`flex-1 relative bg-black flex items-center justify-center min-h-0 overflow-hidden ${isDragOver ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {videoSrc ? (
              <div
                className="relative w-full h-full flex items-center justify-center"
                onMouseDown={(e) => {
                  if (blurMode === 'draw') {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleBlurMouseDown(e, rect);
                  }
                }}
                onMouseMove={(e) => {
                  if (blurMode === 'draw' && isDrawingBlur) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleBlurMouseMove(e, rect);
                  }
                }}
                onMouseUp={handleBlurMouseUp}
                onMouseLeave={handleBlurMouseUp}
                style={{
                  cursor: blurMode === 'draw' ? 'crosshair' : 'default'
                }}
              >
                <VideoPreview
                  videoSrc={videoSrc}
                  currentTime={currentTime}
                  duration={duration}
                  isPlaying={isPlaying}
                  volume={volume}
                  isMuted={isMuted}
                  playbackRate={playbackRate}
                  isLooping={isLooping}
                  effects={effects}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onSeek={handleSeek}
                  onTimeUpdate={handleTimeUpdate}
                  onDurationChange={handleDurationChange}
                  onVolumeChange={(v) => {
                    setVolume(v);
                    if (v > 0) setIsMuted(false);
                  }}
                  onMute={(m) => setIsMuted(m)}
                  onFullscreen={toggleFullscreen}
                  markers={markers}
                  subtitles={subtitles}
                  showControls
                  showTimeline={false}
                  showMarkers
                  showSubtitles
                />

                {/* Blur Region Overlay */}
                {(blurRegions.length > 0 || tempBlurRegion) && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 10 }}
                  >
                    {/* Existing blur regions */}
                    {blurRegions.map((region) => (
                      <div
                        key={region.id}
                        className={`absolute border-2 ${
                          selectedBlurRegion === region.id
                            ? 'border-blue-500'
                            : 'border-red-500/70'
                        }`}
                        style={{
                          left: `${region.x}%`,
                          top: `${region.y}%`,
                          width: `${region.width}%`,
                          height: `${region.height}%`,
                          backdropFilter: `blur(${region.strength}px)`,
                          backgroundColor: 'rgba(0,0,0,0.1)'
                        }}
                      >
                        <span className="absolute -top-5 left-0 text-[9px] bg-red-600 text-white px-1 rounded">
                          Blur {region.strength}px
                        </span>
                      </div>
                    ))}

                    {/* Temp region while drawing */}
                    {tempBlurRegion && (
                      <div
                        className="absolute border-2 border-dashed border-blue-400"
                        style={{
                          left: `${tempBlurRegion.x}%`,
                          top: `${tempBlurRegion.y}%`,
                          width: `${tempBlurRegion.width}%`,
                          height: `${tempBlurRegion.height}%`,
                          backdropFilter: `blur(${tempBlurRegion.strength}px)`,
                          backgroundColor: 'rgba(59, 130, 246, 0.2)'
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Draw mode indicator */}
                {blurMode === 'draw' && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded z-20">
                    🎯 Drawing blur region...
                  </div>
                )}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center text-gray-500 cursor-pointer p-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition ${isDragOver ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-800/50 border-gray-700'} border-2 border-dashed`}
                >
                  <Upload
                    className={`w-8 h-8 ${isDragOver ? 'text-blue-400' : 'text-gray-600'}`}
                  />
                </div>
                <p className="text-base font-medium text-gray-400 mb-1">
                  {isDragOver
                    ? 'Drop video here'
                    : 'Import a video to start editing'}
                </p>
                <p className="text-xs text-gray-600">
                  Drag & drop or click to browse
                </p>
                <p className="text-[10px] text-gray-700 mt-3">
                  Keyboard: Space = Play/Pause | S = Split | M = Mute | J/K/L =
                  Seek
                </p>
              </div>
            )}
          </div>

          {/* ═══ Transport Controls Bar ═══════════════════ */}
          {videoSrc && (
            <div className="bg-gray-900 border-t border-gray-800">
              {/* Scrubber */}
              <div className="px-3 pt-1.5">
                <div
                  className="relative h-1.5 bg-gray-800 rounded-full cursor-pointer group hover:h-2.5 transition-[height]"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleSeek(
                      ((e.clientX - rect.left) / rect.width) * duration
                    );
                  }}
                >
                  <div
                    ref={scrubberFillRef}
                    className="absolute h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                      willChange: 'width'
                    }}
                  />
                  <div
                    ref={scrubberThumbRef}
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 7px)`
                    }}
                  />
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between px-3 py-2">
                {/* Left: Playback */}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={handleFrameBack}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition"
                    title="Previous frame (←)"
                  >
                    <Rewind className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSkipBack}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition"
                    title="Back 5s (J)"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  {/* Play / Pause */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 mx-1 bg-blue-600 text-white rounded-full hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>

                  {/* Stop */}
                  <button
                    onClick={handleStop}
                    className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition"
                    title="Stop (Home)"
                  >
                    <Square className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSkipForward}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition"
                    title="Forward 5s (L)"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleFrameForward}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition"
                    title="Next frame (→)"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-1.5 rounded-md transition ml-1 ${isLooping ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                    title="Loop (R)"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center: Time */}
                <div className="text-xs font-mono select-none">
                  <span
                    ref={timeDisplayRef}
                    className="text-white font-semibold"
                  >
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-gray-600 mx-1.5">/</span>
                  <span className="text-gray-400">{formatTime(duration)}</span>
                </div>

                {/* Right: Volume + Speed + Fullscreen */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition"
                    title="Mute (M)"
                  >
                    <VolumeIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (parseFloat(e.target.value) > 0) setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="w-px h-4 bg-gray-700 mx-1" />
                  <select
                    value={playbackRate}
                    onChange={(e) =>
                      setPlaybackRate(parseFloat(e.target.value))
                    }
                    className="bg-gray-800 text-[10px] text-gray-300 border border-gray-700 rounded px-1.5 py-1 focus:outline-none cursor-pointer"
                  >
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4].map((r) => (
                      <option key={r} value={r}>
                        {r}×
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition"
                    title="Fullscreen (F)"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Bottom Timeline ═══════════════════════════════ */}
      {videoSrc && duration > 0 && (
        <div className="border-t border-gray-800 bg-gray-900">
          <Timeline
            duration={duration}
            currentTime={currentTime}
            onSeek={handleSeek}
            onPlay={handlePlay}
            onPause={handlePause}
            isPlaying={isPlaying}
            tracks={tracks}
            onTrackUpdate={setTracks}
            onTrackAdd={() => {
              setTracks((prev) => [
                ...prev,
                {
                  id: `track_${Date.now()}`,
                  name: `Track ${prev.length + 1}`,
                  type: 'video',
                  locked: false,
                  visible: true,
                  muted: false,
                  clips: []
                }
              ]);
            }}
            onTrackRemove={(index) =>
              setTracks((prev) => prev.filter((_, i) => i !== index))
            }
            onClipUpdate={(id, updates) => {
              setTracks((prev) =>
                prev.map((track) => ({
                  ...track,
                  clips: track.clips.map((clip) =>
                    clip.id === id ? { ...clip, ...updates } : clip
                  )
                }))
              );
            }}
            markers={markers}
            zoom={zoom}
            onZoomChange={setZoom}
            showWaveform
            showThumbnails
            snapToMarkers
            snapToClips
          />
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ title, section, expanded, onToggle }) => (
  <button
    onClick={() => onToggle(section)}
    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800 rounded-lg transition"
  >
    <span>{title}</span>
    {expanded === section ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    )}
  </button>
);

export default VideoEditor;
