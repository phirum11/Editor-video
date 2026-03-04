import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, ZoomIn, ZoomOut, Move, Maximize2 } from 'lucide-react'

const Waveform = ({ 
  data = [],
  currentTime = 0,
  duration = 0,
  peaks = [],
  width = 800,
  height = 200,
  color = '#3b82f6',
  progressColor = '#8b5cf6',
  backgroundColor = '#1f2937',
  showTimeline = true,
  showCursor = true,
  enableZoom = true,
  enableSelection = true,
  onSeek,
  onSelect,
  onZoom,
  className = ''
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState(0)
  const [selection, setSelection] = useState({ start: null, end: null })
  const [hoverTime, setHoverTime] = useState(null)

  // Generate waveform data if not provided
  const generateWaveformData = () => {
    if (data.length > 0) return data
    if (peaks.length > 0) return peaks
    
    // Generate random waveform for demo
    return Array.from({ length: 1000 }, () => Math.random())
  }

  const waveformData = generateWaveformData()

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Draw background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Calculate visible data range
    const visibleSamples = Math.floor(waveformData.length / zoom)
    const startSample = Math.floor(offset * (waveformData.length - visibleSamples))
    const endSample = Math.min(startSample + visibleSamples, waveformData.length)

    // Draw waveform bars
    const barWidth = canvasWidth / visibleSamples
    const middleY = canvasHeight / 2

    for (let i = startSample; i < endSample; i++) {
      const x = (i - startSample) * barWidth
      const amplitude = waveformData[i] || 0
      const barHeight = amplitude * canvasHeight * 0.8
      
      // Determine if this bar is in the selected region
      const time = (i / waveformData.length) * duration
      const isSelected = selection.start !== null && 
                        selection.end !== null &&
                        time >= selection.start && 
                        time <= selection.end

      // Determine if this bar is before current time
      const isPlayed = time <= currentTime

      // Set color
      if (isSelected) {
        ctx.fillStyle = '#f59e0b'
      } else if (isPlayed) {
        ctx.fillStyle = progressColor
      } else {
        ctx.fillStyle = color
      }

      // Draw bar (positive and negative)
      ctx.fillRect(x, middleY - barHeight/2, Math.max(1, barWidth - 1), barHeight)
    }

    // Draw cursor
    if (showCursor && currentTime > 0) {
      const cursorX = (currentTime / duration) * canvasWidth
      
      ctx.beginPath()
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.moveTo(cursorX, 0)
      ctx.lineTo(cursorX, canvasHeight)
      ctx.stroke()
    }

    // Draw hover indicator
    if (hoverTime !== null) {
      const hoverX = (hoverTime / duration) * canvasWidth
      
      ctx.beginPath()
      ctx.strokeStyle = '#9ca3af'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.moveTo(hoverX, 0)
      ctx.lineTo(hoverX, canvasHeight)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw selection overlay
    if (selection.start !== null && selection.end !== null) {
      const startX = (selection.start / duration) * canvasWidth
      const endX = (selection.end / duration) * canvasWidth
      
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'
      ctx.fillRect(startX, 0, endX - startX, canvasHeight)
    }

  }, [waveformData, currentTime, duration, zoom, offset, selection, hoverTime, color, progressColor, backgroundColor])

  // Handle mouse events
  const handleMouseDown = (e) => {
    if (!enableSelection) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = (x / rect.width) * duration

    setIsDragging(true)
    setSelection({ start: time, end: null })
  }

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = (x / rect.width) * duration

    setHoverTime(time)

    if (isDragging && enableSelection) {
      setSelection(prev => ({ ...prev, end: time }))
    }
  }

  const handleMouseUp = () => {
    if (isDragging && enableSelection) {
      setIsDragging(false)
      if (selection.start !== null && selection.end !== null) {
        const start = Math.min(selection.start, selection.end)
        const end = Math.max(selection.start, selection.end)
        onSelect?.({ start, end })
      }
    }
  }

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const time = (x / rect.width) * duration
    onSeek?.(time)
  }

  // Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.5, 10)
    setZoom(newZoom)
    onZoom?.({ zoom: newZoom, offset })
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.5, 1)
    setZoom(newZoom)
    onZoom?.({ zoom: newZoom, offset })
  }

  const handleResetZoom = () => {
    setZoom(1)
    setOffset(0)
    onZoom?.({ zoom: 1, offset: 0 })
  }

  // Timeline markers
  const renderTimeline = () => {
    if (!showTimeline) return null

    const markers = []
    const interval = duration > 60 ? 60 : 10 // Show minute or 10-second intervals

    for (let time = 0; time <= duration; time += interval) {
      const position = (time / duration) * 100
      markers.push(
        <div
          key={time}
          className="absolute bottom-0 transform -translate-x-1/2"
          style={{ left: `${position}%` }}
        >
          <div className="w-px h-2 bg-gray-600 mb-1" />
          <span className="text-xs text-gray-500">
            {Math.floor(time / 60)}:{String(Math.floor(time % 60)).padStart(2, '0')}
          </span>
        </div>
      )
    }

    return markers
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Controls */}
      {enableZoom && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-700 rounded transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-700 rounded transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-gray-700 rounded transition"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {zoom.toFixed(1)}x
          </div>
        </div>
      )}

      {/* Waveform Container */}
      <div 
        ref={containerRef}
        className="relative bg-gray-800 rounded-lg overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="w-full h-full"
        />

        {/* Timeline */}
        {showTimeline && (
          <div className="absolute bottom-0 left-0 right-0 h-6 px-4">
            {renderTimeline()}
          </div>
        )}

        {/* Time Display */}
        {hoverTime !== null && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formatTime(hoverTime)}
          </div>
        )}

        {/* Selection Info */}
        {selection.start !== null && selection.end !== null && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            Selected: {formatTime(selection.end - selection.start)}
          </div>
        )}
      </div>

      {/* Time Labels */}
      <div className="flex justify-between text-xs text-gray-500 px-2">
        <span>{formatTime(0)}</span>
        <span>{formatTime(duration / 2)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

// Helper function
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default Waveform