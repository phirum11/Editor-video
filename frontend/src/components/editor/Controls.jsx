import React, { useState } from 'react'
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Scissors,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
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
  Save,
  Upload,
  Download,
  Share2,
  Edit,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Zap,
  Target,
  Crosshair,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Paintbrush,
  Eraser,
  Wand2,
  Sparkles,
  Sliders,
  Palette,
  Brush,
  Type as TypeIcon
} from 'lucide-react'

const Controls = ({
  isPlaying = false,
  onPlay,
  onPause,
  onStop,
  onSkipBack,
  onSkipForward,
  volume = 1,
  isMuted = false,
  onVolumeChange,
  onMute,
  playbackRate = 1,
  onPlaybackRateChange,
  currentTime = 0,
  duration = 0,
  onSeek,
  onSplit,
  onCopy,
  onDelete,
  onCut,
  onTrim,
  onSpeed,
  onReverse,
  onStabilize,
  onDenoise,
  onColorGrading,
  onFilters,
  onTransitions,
  onText,
  onStickers,
  onOverlays,
  onExport,
  onSave,
  onSettings,
  className = ''
}) => {
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showEffectsMenu, setShowEffectsMenu] = useState(false)
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false)
  const [selectedTool, setSelectedTool] = useState('select')

  // Format time
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Handle seek
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const time = percentage * duration
    onSeek?.(time)
  }

  return (
    <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Main controls */}
      <div className="p-4 space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div
            className="relative h-2 bg-gray-700 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="absolute h-full bg-blue-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onSkipBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400"
              title="Previous frame"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {isPlaying ? (
              <button
                onClick={onPause}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
              >
                <Pause className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onPlay}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
              >
                <Play className="w-5 h-5 ml-0.5" />
              </button>
            )}

            <button
              onClick={onStop}
              className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400"
              title="Stop"
            >
              <Square className="w-5 h-5" />
            </button>

            <button
              onClick={onSkipForward}
              className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400"
              title="Next frame"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Volume control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onMute}
                className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Playback rate */}
            <div className="relative">
              <button
                onClick={() => setShowPlaybackMenu(!showPlaybackMenu)}
                className="px-3 py-1 bg-gray-800 text-sm text-white rounded-lg hover:bg-gray-700 transition flex items-center space-x-1"
              >
                <span>{playbackRate}x</span>
                {showPlaybackMenu ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {showPlaybackMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-32 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        onPlaybackRateChange?.(rate)
                        setShowPlaybackMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition ${
                        playbackRate === rate ? 'text-blue-400' : 'text-gray-300'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-1 p-1 bg-gray-800 rounded-lg">
          <button
            onClick={() => setSelectedTool('select')}
            className={`p-2 rounded transition ${
              selectedTool === 'select'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="Select (V)"
          >
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool('cut')}
            className={`p-2 rounded transition ${
              selectedTool === 'cut'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="Cut (C)"
          >
            <Cut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedTool('trim')}
            className={`p-2 rounded transition ${
              selectedTool === 'trim'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="Trim (T)"
          >
            <Scissors className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-700 mx-1" />
          <button
            onClick={onSplit}
            className="p-2 text-gray-400 hover:bg-gray-700 rounded transition"
            title="Split at playhead (S)"
          >
            <Scissors className="w-4 h-4" />
          </button>
          <button
            onClick={onCopy}
            className="p-2 text-gray-400 hover:bg-gray-700 rounded transition"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:bg-gray-700 rounded transition"
            title="Delete (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit controls */}
      <div className="border-t border-gray-800">
        <button
          onClick={() => setShowEditMenu(!showEditMenu)}
          className="w-full px-4 py-2 bg-gray-800 text-left text-sm font-medium text-gray-300 hover:bg-gray-750 transition flex items-center justify-between"
        >
          <span>Edit Tools</span>
          {showEditMenu ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showEditMenu && (
          <div className="p-4 grid grid-cols-4 gap-2">
            <button
              onClick={onTrim}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1"
            >
              <Scissors className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-gray-400">Trim</span>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
              <RotateCw className="w-5 h-5 text-green-400" />
              <span className="text-xs text-gray-400">Rotate</span>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
              <FlipHorizontal className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-400">Flip</span>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
              <Crop className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-gray-400">Crop</span>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-gray-400">Speed</span>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
              <CornerUpLeft className="w-5 h-5 text-red-400" />
              <span className="text-xs text-gray-400">Reverse</span>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
              <Target className="w-5 h-5 text-indigo-400" />
              <span className="text-xs text-gray-400">Stabilize</span>
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
              <Wand2 className="w-5 h-5 text-pink-400" />
              <span className="text-xs text-gray-400">Denoise</span>
            </button>
          </div>
        )}
      </div>

      {/* Effects controls */}
      <div className="border-t border-gray-800">
        <button
          onClick={() => setShowEffectsMenu(!showEffectsMenu)}
          className="w-full px-4 py-2 bg-gray-800 text-left text-sm font-medium text-gray-300 hover:bg-gray-750 transition flex items-center justify-between"
        >
          <span>Effects & Filters</span>
          {showEffectsMenu ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showEffectsMenu && (
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
                <Palette className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-gray-400">Color</span>
              </button>
              <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
                <Sliders className="w-5 h-5 text-green-400" />
                <span className="text-xs text-gray-400">Adjust</span>
              </button>
              <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
                <Brush className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-gray-400">Blur</span>
              </button>
              <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex flex-col items-center space-y-1">
                <Eraser className="w-5 h-5 text-yellow-400" />
                <span className="text-xs text-gray-400">Sharpen</span>
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 mb-2">Presets</h4>
              <div className="grid grid-cols-3 gap-2">
                {['Vintage', 'Cinematic', 'B&W', 'Warm', 'Cool', 'Drama'].map((preset) => (
                  <button
                    key={preset}
                    className="px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced controls */}
      <div className="border-t border-gray-800">
        <button
          onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
          className="w-full px-4 py-2 bg-gray-800 text-left text-sm font-medium text-gray-300 hover:bg-gray-750 transition flex items-center justify-between"
        >
          <span>Advanced</span>
          {showAdvancedMenu ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showAdvancedMenu && (
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Keyframes</h4>
                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700 transition">
                    Add Keyframe
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700 transition">
                    Remove
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Motion Tracking</h4>
                <button className="w-full px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700 transition flex items-center justify-center space-x-2">
                  <Crosshair className="w-4 h-4" />
                  <span>Track Object</span>
                </button>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Export Settings</h4>
                <div className="space-y-2">
                  <select className="w-full px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded border border-gray-700">
                    <option>H.264 (MP4)</option>
                    <option>H.265 (HEVC)</option>
                    <option>ProRes</option>
                    <option>Animation</option>
                  </select>
                  <select className="w-full px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded border border-gray-700">
                    <option>1080p</option>
                    <option>4K</option>
                    <option>720p</option>
                    <option>480p</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button
            onClick={onExport}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Controls