import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Grid,
  Type,
  ZoomIn,
  ZoomOut,
  SkipBack,
  SkipForward
} from 'lucide-react';

const VideoPreview = ({
  videoSrc,
  currentTime = 0,
  duration = 0,
  isPlaying = false,
  volume = 1,
  isMuted = false,
  playbackRate = 1,
  isLooping = false,
  effects = null,
  onPlay,
  onPause,
  onSeek,
  onTimeUpdate,
  onDurationChange,
  onVolumeChange,
  onMute,
  onFullscreen,
  markers = [],
  subtitles = [],
  showControls = true,
  showTimeline = true,
  showMarkers = true,
  showSubtitles = true,
  className = ''
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0
  });
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const isSeekingRef = useRef(false);

  // Handle loaded metadata - report real duration
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setVideoDimensions({
      width: video.videoWidth,
      height: video.videoHeight
    });
    if (video.duration && isFinite(video.duration)) {
      onDurationChange?.(video.duration);
    }
  }, [onDurationChange]);

  // Sync playing state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.src) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented, notify parent
          onPause?.();
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying, onPause]);

  // Sync seek from parent (only when not playing or explicit seek)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isSeekingRef.current) return;
    // During playback use a wide threshold to avoid fighting the native clock
    const threshold = isPlaying ? 0.5 : 0.05;
    if (Math.abs(video.currentTime - currentTime) > threshold) {
      video.currentTime = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Sync volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Fullscreen change detection
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => {
      setShowControlsOverlay(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControlsOverlay(false);
      }, 3000);
    };

    const handleMouseLeave = () => setShowControlsOverlay(true);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // RAF-based time update for smooth 60fps playback reporting
  const rafIdRef = useRef(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  useEffect(() => {
    if (!isPlaying) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      return;
    }

    const tick = () => {
      const video = videoRef.current;
      if (video && !isSeekingRef.current) {
        onTimeUpdateRef.current?.(video.currentTime);

        // Subtitle detection
        if (subtitles.length > 0) {
          const active = subtitles.find(
            (sub) =>
              video.currentTime >= sub.start && video.currentTime <= sub.end
          );
          setActiveSubtitle(active || null);
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isPlaying, subtitles]);

  // Fallback for paused scrub-seeks via native event
  const handleTimeUpdate = useCallback(() => {
    if (isPlaying) return; // RAF handles it during playback
    const video = videoRef.current;
    if (!video || isSeekingRef.current) return;
    onTimeUpdate?.(video.currentTime);
  }, [onTimeUpdate, isPlaying]);

  // Sync loop attribute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // Handle video ended
  const handleEnded = useCallback(() => {
    if (isLooping) return; // browser handles loop natively
    onPause?.();
  }, [onPause, isLooping]);

  // Handle seeking via progress bar
  const handleProgressBarSeek = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const actualDuration = videoRef.current?.duration || duration;
      const time = percentage * actualDuration;

      isSeekingRef.current = true;
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
      onSeek?.(time);
      // Reset seeking flag after a short delay
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 100);
    },
    [duration, onSeek]
  );

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    onFullscreen?.(!isFullscreen);
  };

  // Zoom/Pan
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const handlePanStart = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handlePanMove = (e) => {
    if (isDragging)
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handlePanEnd = () => setIsDragging(false);

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const actualDuration = videoRef.current?.duration || duration;
  const progress =
    actualDuration > 0 ? (currentTime / actualDuration) * 100 : 0;

  // Build CSS filter string from effects
  const cssFilter = effects
    ? [
        effects.brightness !== 0 &&
          `brightness(${1 + effects.brightness / 100})`,
        effects.contrast !== 0 && `contrast(${1 + effects.contrast / 100})`,
        effects.saturation !== 0 && `saturate(${1 + effects.saturation / 100})`,
        effects.hue !== 0 && `hue-rotate(${effects.hue * 1.8}deg)`,
        effects.temperature !== 0 &&
          `sepia(${Math.abs(effects.temperature) / 100})`,
        effects.blur > 0 && `blur(${effects.blur}px)`,
        effects.sharpen > 0 && `contrast(${1 + effects.sharpen / 50})`
      ]
        .filter(Boolean)
        .join(' ') || 'none'
    : 'none';
  const cssOpacity = effects ? effects.opacity / 100 : 1;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black w-full h-full ${className}`}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        onClick={() => (isPlaying ? onPause?.() : onPlay?.())}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onCanPlay={() => {
          // Ensure we have duration after source change
          const video = videoRef.current;
          if (
            video &&
            video.duration &&
            isFinite(video.duration) &&
            duration === 0
          ) {
            onDurationChange?.(video.duration);
          }
        }}
        playsInline
        preload="auto"
        style={{
          transform:
            zoom !== 1
              ? `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`
              : 'translateZ(0)',
          filter: cssFilter,
          opacity: cssOpacity,
          willChange: 'transform, filter, opacity',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
        }}
        onMouseDown={handlePanStart}
      />

      {/* Subtitles */}
      {showSubtitles && activeSubtitle && (
        <div className="absolute bottom-24 left-0 right-0 text-center px-4 pointer-events-none">
          <div className="inline-block bg-black/75 text-white px-4 py-2 rounded-lg text-lg max-w-2xl">
            {activeSubtitle.text}
          </div>
        </div>
      )}

      {/* Markers */}
      {showMarkers && markers.length > 0 && (
        <div className="absolute top-3 left-0 right-0 px-4 pointer-events-none">
          <div className="flex justify-center space-x-2">
            {markers.map((marker, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current)
                    videoRef.current.currentTime = marker.time;
                  onSeek?.(marker.time);
                }}
                className="px-2 py-0.5 bg-blue-600/80 text-white text-xs rounded hover:bg-blue-700 transition pointer-events-auto"
              >
                {marker.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {showControls && showControlsOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center pointer-events-auto">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGrid(!showGrid);
                }}
                className={`p-1.5 rounded transition ${showGrid ? 'bg-blue-600 text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'}`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
            {zoom !== 1 && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  className="p-1.5 bg-black/40 text-white/80 rounded hover:bg-black/60 transition"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-white/80 text-xs bg-black/40 px-1.5 py-0.5 rounded">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  className="p-1.5 bg-black/40 text-white/80 rounded hover:bg-black/60 transition"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Center play button */}
          {!isPlaying && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.();
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-blue-600/90 rounded-full flex items-center justify-center hover:bg-blue-700 transition pointer-events-auto shadow-lg"
            >
              <Play className="w-7 h-7 text-white ml-0.5" />
            </button>
          )}

          {/* Bottom controls */}
          {showTimeline && (
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5 pointer-events-auto">
              {/* Progress bar */}
              <div
                className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group hover:h-2.5 transition-all"
                onClick={handleProgressBarSeek}
              >
                <div
                  className="absolute h-full bg-blue-500 rounded-full transition-none"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
                {/* Markers on progress */}
                {markers.map((marker, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-400"
                    style={{ left: `${(marker.time / actualDuration) * 100}%` }}
                  />
                ))}
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition"
                  style={{ left: `calc(${Math.min(progress, 100)}% - 6px)` }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isPlaying ? onPause?.() : onPlay?.();
                    }}
                    className="p-1.5 bg-white/10 text-white rounded hover:bg-white/20 transition"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <span className="text-xs text-white/80 font-mono min-w-[5rem]">
                    {formatTime(currentTime)} / {formatTime(actualDuration)}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMute?.(!isMuted);
                    }}
                    className="p-1.5 text-white/80 hover:text-white transition"
                  >
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="p-1.5 text-white/80 hover:text-white transition"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dimension badge */}
      {videoDimensions.width > 0 && (
        <div className="absolute top-2 left-2 bg-black/50 text-white/70 text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
          {videoDimensions.width}×{videoDimensions.height}
        </div>
      )}

      {/* Grid overlay (canvas-free, CSS-based) */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
            backgroundSize: '50px 50px, 50px 50px, 33.33% 33.33%, 33.33% 33.33%'
          }}
        />
      )}
    </div>
  );
};

export default VideoPreview;
