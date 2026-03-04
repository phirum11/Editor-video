import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  Download,
  Copy,
  Edit2,
  Save,
  X,
  Check,
  Clock,
  User,
  Mic,
  Type,
  Languages,
  Volume2,
  Play,
  Pause,
  Settings,
  FileText,
  List,
  Grid,
  AlignLeft,
  DownloadCloud
} from 'lucide-react'

const TranscriptionDisplay = ({
  segments = [],
  currentTime = 0,
  onSegmentClick,
  onSegmentEdit,
  onExport,
  language = 'en',
  speakerCount = 2,
  showSpeaker = true,
  showTimestamps = true,
  highlightCurrent = true,
  editable = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingSegment, setEditingSegment] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [viewMode, setViewMode] = useState('list') // list, grid, compact
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [showTranslations, setShowTranslations] = useState(false)
  const [translations, setTranslations] = useState({})
  const [filteredSegments, setFilteredSegments] = useState(segments)
  const [selectedSegments, setSelectedSegments] = useState(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [sortBy, setSortBy] = useState('time') // time, speaker, duration
  const [groupBySpeaker, setGroupBySpeaker] = useState(false)

  const containerRef = useRef(null)
  const activeSegmentRef = useRef(null)

  // Filter segments based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSegments(segments)
      return
    }

    const filtered = segments.filter(seg =>
      seg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seg.speaker?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSegments(filtered)
  }, [segments, searchTerm])

  // Scroll to current segment
  useEffect(() => {
    if (highlightCurrent && activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentTime, highlightCurrent])

  // Format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  // Handle segment click
  const handleSegmentClick = (segment) => {
    onSegmentClick?.(segment.start)
  }

  // Handle edit start
  const handleEditStart = (segment) => {
    setEditingSegment(segment)
    setEditedText(segment.text)
  }

  // Handle edit save
  const handleEditSave = () => {
    if (editingSegment) {
      onSegmentEdit?.(editingSegment, editedText)
      setEditingSegment(null)
      setEditedText('')
    }
  }

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingSegment(null)
    setEditedText('')
  }

  // Handle segment selection
  const toggleSegmentSelection = (index) => {
    const newSelection = new Set(selectedSegments)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedSegments(newSelection)
  }

  // Select all segments
  const selectAll = () => {
    const all = new Set(segments.map((_, i) => i))
    setSelectedSegments(all)
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedSegments(new Set())
  }

  // Export selected
  const exportSelected = () => {
    const selected = Array.from(selectedSegments)
      .map(i => segments[i])
      .sort((a, b) => a.start - b.start)
    
    onExport?.({
      format: 'txt',
      segments: selected,
      includeSpeakers: showSpeaker,
      includeTimestamps: showTimestamps
    })
  }

  // Speaker colors
  const speakerColors = {
    1: 'bg-blue-500',
    2: 'bg-green-500',
    3: 'bg-purple-500',
    4: 'bg-orange-500',
    5: 'bg-pink-500'
  }

  // Group segments by speaker
  const groupedSegments = groupBySpeaker
    ? filteredSegments.reduce((acc, seg) => {
        const speaker = seg.speaker || 'Unknown'
        if (!acc[speaker]) acc[speaker] = []
        acc[speaker].push(seg)
        return acc
      }, {})
    : { all: filteredSegments }

  // Sort grouped segments
  const sortedGroups = Object.entries(groupedSegments).sort(([a], [b]) => {
    if (sortBy === 'speaker') return a.localeCompare(b)
    return 0
  })

  return (
    <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Transcription</h2>
            <span className="text-sm text-gray-500">
              {segments.length} segments
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'compact' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <AlignLeft className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-700 mx-2" />

            {/* Export Button */}
            <button
              onClick={() => onExport?.()}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search transcription..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Selection Toolbar */}
        {selectedSegments.size > 0 && (
          <div className="mt-4 flex items-center justify-between bg-gray-700 p-2 rounded-lg">
            <span className="text-sm text-gray-300">
              {selectedSegments.size} segments selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportSelected}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
              >
                Export Selected
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Display Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="time">Time</option>
                <option value="speaker">Speaker</option>
                <option value="duration">Duration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Playback Speed</label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={groupBySpeaker}
                onChange={(e) => setGroupBySpeaker(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600"
              />
              <span className="text-sm text-gray-300">Group by speaker</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSpeaker}
                onChange={(e) => setShowSpeaker(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600"
              />
              <span className="text-sm text-gray-300">Show speaker</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={(e) => setShowTimestamps(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600"
              />
              <span className="text-sm text-gray-300">Show timestamps</span>
            </label>
          </div>
        </div>
      )}

      {/* Transcription Content */}
      <div 
        ref={containerRef}
        className="overflow-y-auto max-h-96 p-4 space-y-3"
        style={{ maxHeight: '500px' }}
      >
        {groupBySpeaker ? (
          // Grouped by speaker
          sortedGroups.map(([speaker, speakerSegments]) => (
            <div key={speaker} className="space-y-2">
              <div className="flex items-center space-x-2 sticky top-0 bg-gray-900 py-2">
                <div className={`w-2 h-2 rounded-full ${speakerColors[speaker] || 'bg-gray-500'}`} />
                <h3 className="text-sm font-medium text-gray-400">{speaker}</h3>
                <span className="text-xs text-gray-600">
                  {speakerSegments.length} segments
                </span>
              </div>
              {speakerSegments.map((segment, idx) => (
                <SegmentCard
                  key={idx}
                  segment={segment}
                  index={idx}
                  currentTime={currentTime}
                  showSpeaker={false}
                  showTimestamps={showTimestamps}
                  highlightCurrent={highlightCurrent}
                  editable={editable}
                  onSegmentClick={handleSegmentClick}
                  onEditStart={handleEditStart}
                  onSelect={() => toggleSegmentSelection(idx)}
                  isSelected={selectedSegments.has(idx)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ))
        ) : (
          // Flat list
          filteredSegments.map((segment, idx) => (
            <SegmentCard
              key={idx}
              segment={segment}
              index={idx}
              currentTime={currentTime}
              showSpeaker={showSpeaker}
              showTimestamps={showTimestamps}
              highlightCurrent={highlightCurrent}
              editable={editable}
              onSegmentClick={handleSegmentClick}
              onEditStart={handleEditStart}
              onSelect={() => toggleSegmentSelection(idx)}
              isSelected={selectedSegments.has(idx)}
              viewMode={viewMode}
              speakerColor={speakerColors[segment.speaker] || 'bg-gray-500'}
            />
          ))
        )}

        {filteredSegments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No segments found</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-800 p-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Total: {segments.length} segments</span>
            <span>Duration: {formatTime(segments.reduce((acc, s) => acc + (s.end - s.start), 0))}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAll}
              className="hover:text-white transition"
            >
              Select All
            </button>
            <span>•</span>
            <button
              onClick={clearSelection}
              className="hover:text-white transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Segment</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                {formatTime(editingSegment.start)} - {formatTime(editingSegment.end)}
              </div>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Edit transcription..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Segment Card Component
const SegmentCard = ({
  segment,
  index,
  currentTime,
  showSpeaker,
  showTimestamps,
  highlightCurrent,
  editable,
  onSegmentClick,
  onEditStart,
  onSelect,
  isSelected,
  viewMode,
  speakerColor = 'bg-gray-500'
}) => {
  const isActive = highlightCurrent && 
                   currentTime >= segment.start && 
                   currentTime <= segment.end

  if (viewMode === 'compact') {
    return (
      <div
        ref={isActive ? activeSegmentRef : null}
        onClick={() => onSegmentClick(segment)}
        className={`group flex items-start space-x-3 p-2 rounded-lg cursor-pointer transition ${
          isActive ? 'bg-blue-500 bg-opacity-20' : 'hover:bg-gray-800'
        } ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 rounded bg-gray-700 border-gray-600"
        />
        {showTimestamps && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatTime(segment.start)}
          </span>
        )}
        <p className="text-sm text-gray-300 flex-1">{segment.text}</p>
        {editable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEditStart(segment)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition"
          >
            <Edit2 className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div
        ref={isActive ? activeSegmentRef : null}
        onClick={() => onSegmentClick(segment)}
        className={`group p-3 bg-gray-800 rounded-lg cursor-pointer transition ${
          isActive ? 'ring-2 ring-blue-500' : 'hover:bg-gray-750'
        } ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            {showSpeaker && (
              <div className={`w-2 h-2 rounded-full ${speakerColor}`} />
            )}
            {showTimestamps && (
              <span className="text-xs text-gray-500">
                {formatTime(segment.start)}
              </span>
            )}
          </div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="rounded bg-gray-700 border-gray-600"
          />
        </div>
        <p className="text-sm text-gray-300">{segment.text}</p>
        {editable && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEditStart(segment)
            }}
            className="mt-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition"
          >
            <Edit2 className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>
    )
  }

  // Default list view
  return (
    <div
      ref={isActive ? activeSegmentRef : null}
      onClick={() => onSegmentClick(segment)}
      className={`group flex items-start space-x-3 p-3 bg-gray-800 rounded-lg cursor-pointer transition ${
        isActive ? 'ring-2 ring-blue-500' : 'hover:bg-gray-750'
      } ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        onClick={(e) => e.stopPropagation()}
        className="mt-1 rounded bg-gray-700 border-gray-600"
      />
      
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          {showSpeaker && (
            <>
              <div className={`w-2 h-2 rounded-full ${speakerColor}`} />
              <span className="text-xs font-medium text-gray-400">
                {segment.speaker || 'Speaker'}
              </span>
            </>
          )}
          {showTimestamps && (
            <span className="text-xs text-gray-500">
              {formatTime(segment.start)} - {formatTime(segment.end)}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-300">{segment.text}</p>
      </div>

      {editable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEditStart(segment)
          }}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-700 rounded-lg transition"
        >
          <Edit2 className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}

export default TranscriptionDisplay