import React, { useState, useEffect } from 'react'
import {
  Type,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  X,
  Clock,
  Eye,
  EyeOff,
  Move,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Sun,
  Moon,
  Download,
  Upload,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react'

const SubtitleEditor = ({
  subtitles = [],
  currentTime = 0,
  onSubtitlesChange,
  onSubtitleAdd,
  onSubtitleUpdate,
  onSubtitleDelete,
  onSubtitleSelect,
  selectedSubtitle = null,
  videoDuration = 0,
  onSeek,
  isPlaying = false,
  onPlay,
  onPause,
  className = ''
}) => {
  const [editingSubtitle, setEditingSubtitle] = useState(null)
  const [editText, setEditText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('time') // time, text
  const [sortOrder, setSortOrder] = useState('asc')
  const [showTimeline, setShowTimeline] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [fontColor, setFontColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#000000')
  const [textAlign, setTextAlign] = useState('center')
  const [fontWeight, setFontWeight] = useState('normal')
  const [fontStyle, setFontStyle] = useState('normal')
  const [textDecoration, setTextDecoration] = useState('none')
  const [position, setPosition] = useState('bottom')
  const [marginBottom, setMarginBottom] = useState(20)

  // Filter and sort subtitles
  const filteredSubtitles = subtitles
    .filter(sub => 
      sub.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'time') {
        comparison = a.start - b.start
      } else if (sortBy === 'text') {
        comparison = a.text.localeCompare(b.text)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Handle edit start
  const handleEditStart = (subtitle) => {
    setEditingSubtitle(subtitle.id)
    setEditText(subtitle.text)
  }

  // Handle edit save
  const handleEditSave = (id) => {
    onSubtitleUpdate?.(id, { text: editText })
    setEditingSubtitle(null)
  }

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingSubtitle(null)
    setEditText('')
  }

  // Handle time format
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

  // Parse time from string
  const parseTime = (timeStr) => {
    const [hms, ms] = timeStr.split(',')
    const [h, m, s] = hms.split(':').map(Number)
    return h * 3600 + m * 60 + s + parseInt(ms) / 1000
  }

  // Handle new subtitle
  const handleNewSubtitle = () => {
    const newSub = {
      id: Date.now().toString(),
      start: currentTime,
      end: Math.min(currentTime + 5, videoDuration),
      text: 'New subtitle',
      style: {
        fontSize,
        fontColor,
        bgColor,
        textAlign,
        fontWeight,
        fontStyle,
        textDecoration,
        position,
        marginBottom
      }
    }
    onSubtitleAdd?.(newSub)
  }

  // Render timeline
  const renderTimeline = () => {
    const marks = []
    const totalWidth = 800
    const startPadding = 50
    const endPadding = 50
    const timelineWidth = totalWidth - startPadding - endPadding

    // Time markers
    for (let t = 0; t <= videoDuration; t += 30) {
      const x = startPadding + (t / videoDuration) * timelineWidth
      marks.push(
        <div
          key={t}
          className="absolute bottom-0"
          style={{ left: x }}
        >
          <div className="w-px h-2 bg-gray-600" />
          <span className="absolute top-3 left-1 text-xs text-gray-500">
            {Math.floor(t / 60)}:{String(t % 60).padStart(2, '0')}
          </span>
        </div>
      )
    }

    return marks
  }

  return (
    <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Type className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Subtitle Editor</h2>
            <span className="text-sm text-gray-500">
              {subtitles.length} subtitles
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition ${
                showSettings ? 'bg-purple-600 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Import SRT */}}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Export SRT */}}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search subtitles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Sort controls */}
        <div className="flex items-center space-x-2 mt-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg"
          >
            <option value="time">Sort by Time</option>
            <option value="text">Sort by Text</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Style Settings</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full px-3 py-1 bg-gray-700 text-white text-sm rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-1 bg-gray-700 text-white text-sm rounded-lg"
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Font Color</label>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-full h-8 bg-gray-700 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-8 bg-gray-700 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => setTextAlign('left')}
              className={`p-2 rounded transition ${
                textAlign === 'left' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`p-2 rounded transition ${
                textAlign === 'center' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`p-2 rounded transition ${
                textAlign === 'right' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-700 mx-2" />
            <button
              onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
              className={`p-2 rounded transition ${
                fontWeight === 'bold' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`p-2 rounded transition ${
                fontStyle === 'italic' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline')}
              className={`p-2 rounded transition ${
                textDecoration === 'underline' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
              Apply to All
            </button>
            <button className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {showTimeline && (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="relative h-16 bg-gray-900 rounded-lg overflow-hidden">
            {/* Time markers */}
            {renderTimeline()}

            {/* Current time indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: 50 + (currentTime / videoDuration) * 700 }}
            />

            {/* Subtitle blocks */}
            {filteredSubtitles.map((sub, index) => {
              const left = 50 + (sub.start / videoDuration) * 700
              const width = ((sub.end - sub.start) / videoDuration) * 700
              
              return (
                <div
                  key={sub.id}
                  onClick={() => onSubtitleSelect?.(sub)}
                  className={`absolute top-1 bottom-1 bg-purple-600 bg-opacity-50 rounded cursor-pointer hover:bg-opacity-75 transition ${
                    selectedSubtitle?.id === sub.id ? 'ring-2 ring-white' : ''
                  }`}
                  style={{ left, width }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-white truncate px-1">
                    {index + 1}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time display */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{formatTime(0)}</span>
            <span>{formatTime(videoDuration / 2)}</span>
            <span>{formatTime(videoDuration)}</span>
          </div>
        </div>
      )}

      {/* Subtitle list */}
      <div className="max-h-96 overflow-y-auto">
        {filteredSubtitles.map((subtitle, index) => (
          <div
            key={subtitle.id}
            className={`p-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition ${
              selectedSubtitle?.id === subtitle.id ? 'bg-gray-800' : ''
            }`}
          >
            {editingSubtitle === subtitle.id ? (
              // Edit mode
              <div className="space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleEditCancel}
                    className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditSave(subtitle.id)}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(subtitle.start)} → {formatTime(subtitle.end)}</span>
                    <span className="text-gray-600">
                      ({(subtitle.end - subtitle.start).toFixed(2)}s)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onSeek?.(subtitle.start)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                      title="Go to start"
                    >
                      <SkipBack className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => onSeek?.(subtitle.end)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                      title="Go to end"
                    >
                      <SkipForward className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleEditStart(subtitle)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => onSubtitleDelete?.(subtitle.id)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <p className="text-white" style={{
                  fontSize: subtitle.style?.fontSize || fontSize,
                  color: subtitle.style?.fontColor || fontColor,
                  backgroundColor: subtitle.style?.bgColor || bgColor,
                  textAlign: subtitle.style?.textAlign || textAlign,
                  fontWeight: subtitle.style?.fontWeight || fontWeight,
                  fontStyle: subtitle.style?.fontStyle || fontStyle,
                  textDecoration: subtitle.style?.textDecoration || textDecoration
                }}>
                  {subtitle.text}
                </p>
              </>
            )}
          </div>
        ))}

        {filteredSubtitles.length === 0 && (
          <div className="text-center py-12">
            <Type className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No subtitles</p>
            <button
              onClick={handleNewSubtitle}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Subtitle
            </button>
          </div>
        )}
      </div>

      {/* Add button */}
      {filteredSubtitles.length > 0 && (
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <button
            onClick={handleNewSubtitle}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subtitle at {formatTime(currentTime)}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default SubtitleEditor