import React, { useState, useEffect, useRef } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Move,
  Scissors,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Film,
  Music,
  Type,
  Image,
  Layers,
  Grid,
  Ruler,
  Scissors as Cut,
  CornerUpLeft,
  CornerUpRight,
  Maximize,
  Minimize,
  Plus,
  Minus
} from 'lucide-react'

const Timeline = ({
  duration = 0,
  currentTime = 0,
  onSeek,
  onPlay,
  onPause,
  isPlaying = false,
  tracks = [],
  onTrackUpdate,
  onTrackAdd,
  onTrackRemove,
  onClipUpdate,
  markers = [],
  zoom = 1,
  onZoomChange,
  showWaveform = true,
  showThumbnails = true,
  snapToMarkers = true,
  snapToClips = true,
  rulerHeight = 30,
  trackHeight = 60,
  className = ''
}) => {
  const [timeScale, setTimeScale] = useState(100) // pixels per second
  const [scrollX, setScrollX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [selectedClip, setSelectedClip] = useState(null)
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState(null)
  const [showRuler, setShowRuler] = useState(true)
  const [showWaveforms, setShowWaveforms] = useState(true)
  const [snapEnabled, setSnapEnabled] = useState(true)
  
  const timelineRef = useRef(null)
  const rulerRef = useRef(null)
  const tracksRef = useRef(null)

  // Calculate total width
  const totalWidth = duration * timeScale * zoom

  // Format time
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  // Handle timeline click
  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left + scrollX
    const time = x / (timeScale * zoom)
    onSeek?.(Math.max(0, Math.min(time, duration)))
  }

  // Handle drag start
  const handleDragStart = (e, clip) => {
    setIsDragging(true)
    setSelectedClip(clip)
    setDragStartX(e.clientX)
    setDragStartTime(clip.start)
  }

  // Handle drag move
  const handleDragMove = (e) => {
    if (!isDragging || !selectedClip) return

    const deltaX = e.clientX - dragStartX
    const deltaTime = deltaX / (timeScale * zoom)
    
    let newStart = dragStartTime + deltaTime
    
    // Snap to markers
    if (snapEnabled && snapToMarkers) {
      const snapThreshold = 0.5 / timeScale // 0.5 pixels threshold
      for (const marker of markers) {
        if (Math.abs(newStart - marker.time) < snapThreshold) {
          newStart = marker.time
          break
        }
      }
    }

    // Snap to other clips
    if (snapEnabled && snapToClips && selectedTrack) {
      const otherClips = tracks[selectedTrack].clips.filter(c => c.id !== selectedClip.id)
      for (const clip of otherClips) {
        if (Math.abs(newStart - clip.end) < 0.5 / timeScale) {
          newStart = clip.end
          break
        }
        if (Math.abs(newStart + selectedClip.duration - clip.start) < 0.5 / timeScale) {
          newStart = clip.start - selectedClip.duration
          break
        }
      }
    }

    // Clamp to bounds
    newStart = Math.max(0, Math.min(newStart, duration - selectedClip.duration))
    
    onClipUpdate?.(selectedClip.id, { start: newStart })
  }

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false)
    setSelectedClip(null)
  }

  // Handle resize start
  const handleResizeStart = (e, clip, direction) => {
    e.stopPropagation()
    setIsResizing(true)
    setSelectedClip(clip)
    setResizeDirection(direction)
    setDragStartX(e.clientX)
    setDragStartTime(direction === 'left' ? clip.start : clip.end)
  }

  // Handle resize move
  const handleResizeMove = (e) => {
    if (!isResizing || !selectedClip) return

    const deltaX = e.clientX - dragStartX
    const deltaTime = deltaX / (timeScale * zoom)
    
    if (resizeDirection === 'left') {
      let newStart = dragStartTime + deltaTime
      newStart = Math.max(0, Math.min(newStart, selectedClip.end - 0.1))
      onClipUpdate?.(selectedClip.id, { start: newStart })
    } else {
      let newEnd = dragStartTime + deltaTime
      newEnd = Math.max(selectedClip.start + 0.1, Math.min(newEnd, duration))
      onClipUpdate?.(selectedClip.id, { end: newEnd })
    }
  }

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false)
    setSelectedClip(null)
    setResizeDirection(null)
  }

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleDragMove(e)
      } else if (isResizing) {
        handleResizeMove(e)
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd()
      }
      if (isResizing) {
        handleResizeEnd()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, selectedClip, selectedTrack, dragStartX, dragStartTime])

  // Render ruler
  const renderRuler = () => {
    const marks = []
    const step = 1 / timeScale // 1 pixel step
    const majorStep = 5 // seconds between major marks

    for (let t = 0; t <= duration; t += step) {
      const x = t * timeScale * zoom - scrollX
      if (x >= 0 && x <= timelineRef.current?.clientWidth) {
        const isMajor = Math.abs(t % majorStep) < 0.001
        marks.push(
          <div
            key={t}
            className="absolute bottom-0"
            style={{ left: x }}
          >
            <div className={`w-px ${isMajor ? 'h-3' : 'h-1'} bg-gray-600`} />
            {isMajor && (
              <span className="absolute top-4 left-1 text-xs text-gray-500 whitespace-nowrap">
                {formatTime(t)}
              </span>
            )}
          </div>
        )
      }
    }

    return marks
  }

  // Render waveform (simplified)
  const renderWaveform = (clip) => {
    const bars = []
    const barCount = 50
    for (let i = 0; i < barCount; i++) {
      const height = Math.random() * 30 + 10 // Random height for demo
      bars.push(
        <div
          key={i}
          className="w-1 bg-blue-400"
          style={{ height, marginRight: 2 }}
        />
      )
    }
    return bars
  }

  // Get clip color based on type
  const getClipColor = (type) => {
    switch (type) {
      case 'video': return 'bg-blue-600 hover:bg-blue-700'
      case 'audio': return 'bg-green-600 hover:bg-green-700'
      case 'text': return 'bg-purple-600 hover:bg-purple-700'
      case 'image': return 'bg-yellow-600 hover:bg-yellow-700'
      default: return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  // Get clip icon
  const getClipIcon = (type) => {
    switch (type) {
      case 'video': return Film
      case 'audio': return Music
      case 'text': return Type
      case 'image': return Image
      default: return Layers
    }
  }

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-800 p-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onZoomChange?.(zoom * 1.2)}
            className="p-1 hover:bg-gray-700 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => onZoomChange?.(zoom / 1.2)}
            className="p-1 hover:bg-gray-700 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-sm text-gray-400 ml-2">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`p-1 rounded transition ${
              showRuler ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="Toggle Ruler"
          >
            <Ruler className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowWaveforms(!showWaveforms)}
            className={`p-1 rounded transition ${
              showWaveforms ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="Toggle Waveforms"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSnapEnabled(!snapEnabled)}
            className={`p-1 rounded transition ${
              snapEnabled ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="Toggle Snap"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTrackAdd?.()}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
          >
            Add Track
          </button>
        </div>
      </div>

      {/* Timeline container */}
      <div
        ref={timelineRef}
        className="relative overflow-x-auto overflow-y-hidden"
        style={{ height: tracks.length * trackHeight + (showRuler ? rulerHeight : 0) }}
        onClick={handleTimelineClick}
      >
        {/* Ruler */}
        {showRuler && (
          <div
            ref={rulerRef}
            className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700"
            style={{ height: rulerHeight }}
          >
            <div className="relative h-full" style={{ width: totalWidth }}>
              {renderRuler()}
              
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                style={{ left: currentTime * timeScale * zoom - scrollX }}
              >
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full" />
              </div>

              {/* Markers */}
              {markers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-500"
                  style={{ left: marker.time * timeScale * zoom - scrollX }}
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-500 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracks */}
        <div ref={tracksRef} style={{ width: totalWidth }}>
          {tracks.map((track, trackIndex) => (
            <div
              key={track.id}
              className={`relative border-b border-gray-700 ${
                selectedTrack === trackIndex ? 'bg-gray-800/50' : ''
              }`}
              style={{ height: trackHeight }}
              onClick={() => setSelectedTrack(trackIndex)}
            >
              {/* Track background grid */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-r border-gray-800"
                    style={{ width: timeScale * zoom }}
                  />
                ))}
              </div>

              {/* Clips */}
              {track.clips.map((clip) => {
                const ClipIcon = getClipIcon(clip.type)
                const left = clip.start * timeScale * zoom
                const width = (clip.end - clip.start) * timeScale * zoom

                return (
                  <div
                    key={clip.id}
                    className={`absolute rounded cursor-move ${getClipColor(clip.type)} ${
                      selectedClip?.id === clip.id ? 'ring-2 ring-white' : ''
                }`}
                    style={{
                      left,
                      width,
                      top: 2,
                      bottom: 2
                    }}
                    onMouseDown={(e) => handleDragStart(e, clip)}
                  >
                    {/* Resize handles */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l"
                      onMouseDown={(e) => handleResizeStart(e, clip, 'left')}
                    />
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r"
                      onMouseDown={(e) => handleResizeStart(e, clip, 'right')}
                    />

                    {/* Clip content */}
                    <div className="flex items-center h-full px-2 space-x-2 overflow-hidden">
                      <ClipIcon className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {clip.name}
                        </div>
                        {showWaveforms && showWaveforms && clip.type === 'audio' && (
                          <div className="flex items-center h-4 opacity-50">
                            {renderWaveform(clip)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs opacity-75">
                        {formatTime(clip.end - clip.start)}
                      </span>
                    </div>

                    {/* Clip menu */}
                    <div className="absolute top-0 right-0 hidden group-hover:flex bg-black bg-opacity-75 rounded-bl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Copy clip
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Split clip
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Cut className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Delete clip
                        }}
                        className="p-1 hover:bg-white/10 rounded text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-gray-800 p-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>{tracks.length} tracks</span>
          <span>{duration.toFixed(2)}s duration</span>
          <span>{timeScale * zoom} px/s</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition">
            Fit to Screen
          </button>
        </div>
      </div>
    </div>
  )
}

export default Timeline