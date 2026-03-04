import React, { useState, useEffect } from 'react'
import {
  Video,
  Music,
  FileText,
  Image,
  Archive,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  Download,
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Sparkles,
  Star,
  Hash,
  Clock,
  HardDrive,
  Layers
} from 'lucide-react'

const FormatSelector = ({
  formats = [],
  selectedFormat,
  onSelect,
  type = 'video', // video, audio, document, image
  showQuality = true,
  showSize = true,
  showPreview = true,
  multiple = false,
  className = ''
}) => {
  const [expandedGroups, setExpandedGroups] = useState({})
  const [selectedFormats, setSelectedFormats] = useState(
    multiple ? selectedFormat || [] : selectedFormat ? [selectedFormat] : []
  )
  const [viewMode, setViewMode] = useState('grid') // grid, list, compact
  const [sortBy, setSortBy] = useState('quality') // quality, size, bitrate
  const [filterResolution, setFilterResolution] = useState('all')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Group formats by type
  const groupedFormats = formats.reduce((acc, format) => {
    const group = format.resolution ? 'video' : 'audio'
    if (!acc[group]) acc[group] = []
    acc[group].push(format)
    return acc
  }, {})

  // Sort formats
  const sortFormats = (formats) => {
    return [...formats].sort((a, b) => {
      if (sortBy === 'quality') {
        const aQuality = parseInt(a.quality) || 0
        const bQuality = parseInt(b.quality) || 0
        return bQuality - aQuality
      }
      if (sortBy === 'size') {
        return (b.filesize || 0) - (a.filesize || 0)
      }
      return 0
    })
  }

  // Filter formats
  const filterFormats = (formats) => {
    if (filterResolution === 'all') return formats
    return formats.filter(f => f.resolution === filterResolution)
  }

  // Handle format selection
  const handleSelect = (format) => {
    if (multiple) {
      const newSelection = selectedFormats.includes(format.format_id)
        ? selectedFormats.filter(id => id !== format.format_id)
        : [...selectedFormats, format.format_id]
      setSelectedFormats(newSelection)
      onSelect?.(formats.filter(f => newSelection.includes(f.format_id)))
    } else {
      setSelectedFormats([format.format_id])
      onSelect?.(format)
    }
  }

  // Toggle group expansion
  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  // Get quality badge
  const getQualityBadge = (format) => {
    if (format.quality === 'best') return { label: 'Best', color: 'bg-purple-500' }
    if (format.quality >= 1080) return { label: 'HD', color: 'bg-green-500' }
    if (format.quality >= 720) return { label: 'HD', color: 'bg-green-500' }
    if (format.quality >= 480) return { label: 'SD', color: 'bg-blue-500' }
    return { label: 'Low', color: 'bg-gray-500' }
  }

  // Device icons based on resolution
  const getDeviceIcon = (resolution) => {
    if (resolution >= 2160) return Tv
    if (resolution >= 1080) return Monitor
    if (resolution >= 720) return Tablet
    return Smartphone
  }

  return (
    <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {type === 'video' && <Video className="w-5 h-5 text-blue-400" />}
            {type === 'audio' && <Music className="w-5 h-5 text-green-400" />}
            <h2 className="text-lg font-semibold text-white">Format Selector</h2>
            <span className="text-sm text-gray-500">
              {formats.length} formats available
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* View mode toggle */}
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Hash className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'compact' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2 rounded-lg transition ${
                showAdvanced ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={filterResolution}
            onChange={(e) => setFilterResolution(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white text-sm rounded-lg"
          >
            <option value="all">All Resolutions</option>
            <option value="2160">4K</option>
            <option value="1080">1080p</option>
            <option value="720">720p</option>
            <option value="480">480p</option>
            <option value="360">360p</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white text-sm rounded-lg"
          >
            <option value="quality">Sort by Quality</option>
            <option value="size">Sort by Size</option>
            <option value="bitrate">Sort by Bitrate</option>
          </select>
        </div>
      </div>

      {/* Advanced options */}
      {showAdvanced && (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Advanced Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
              <span className="text-sm text-gray-300">Include subtitles</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
              <span className="text-sm text-gray-300">Include thumbnails</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
              <span className="text-sm text-gray-300">Embed metadata</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
              <span className="text-sm text-gray-300">Limit download speed</span>
            </label>
          </div>
        </div>
      )}

      {/* Format groups */}
      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {Object.entries(groupedFormats).map(([group, groupFormats]) => (
          <div key={group} className="space-y-3">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center justify-between p-2 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
            >
              <div className="flex items-center space-x-2">
                {group === 'video' ? (
                  <Video className="w-4 h-4 text-blue-400" />
                ) : (
                  <Music className="w-4 h-4 text-green-400" />
                )}
                <span className="font-medium text-white capitalize">{group}</span>
                <span className="text-xs text-gray-500">
                  {groupFormats.length} formats
                </span>
              </div>
              {expandedGroups[group] ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Format list */}
            {expandedGroups[group] !== false && (
              <div className="space-y-2">
                {sortFormats(filterFormats(groupFormats)).map((format, index) => {
                  const isSelected = selectedFormats.includes(format.format_id)
                  const qualityBadge = getQualityBadge(format)
                  const DeviceIcon = getDeviceIcon(format.resolution)

                  if (viewMode === 'grid') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(format)}
                        className={`w-full p-4 rounded-lg border-2 transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <DeviceIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-white">
                              {format.resolution ? `${format.resolution}p` : format.abr ? `${format.abr} kbps` : format.format_id}
                            </span>
                          </div>
                          {format.quality === 'best' && (
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                              {format.ext}
                            </span>
                            {format.fps && (
                              <span className="text-gray-500">{format.fps} fps</span>
                            )}
                          </div>
                          {showSize && format.filesize && (
                            <span className="text-gray-400">
                              {formatFileSize(format.filesize)}
                            </span>
                          )}
                        </div>

                        {showQuality && (
                          <div className="mt-2">
                            <span className={`px-2 py-0.5 ${qualityBadge.color} text-white text-xs rounded`}>
                              {qualityBadge.label}
                            </span>
                          </div>
                        )}
                      </button>
                    )
                  }

                  if (viewMode === 'list') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(format)}
                        className={`w-full p-3 rounded-lg border transition flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${
                            format.resolution >= 1080 ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="text-white font-medium">
                              {format.resolution ? `${format.resolution}p` : format.abr ? `${format.abr} kbps` : format.format_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format.ext} • {format.vcodec || 'audio'} • {format.fps ? `${format.fps}fps` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {showSize && format.filesize && (
                            <span className="text-sm text-gray-400">
                              {formatFileSize(format.filesize)}
                            </span>
                          )}
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </button>
                    )
                  }

                  // Compact view
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelect(format)}
                      className={`w-full px-3 py-2 rounded-lg border transition flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-sm">
                          {format.resolution ? `${format.resolution}p` : format.abr ? `${format.abr} kbps` : format.format_id}
                        </span>
                        <span className="text-xs text-gray-500">{format.ext}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {showSize && format.filesize && (
                          <span className="text-xs text-gray-500">
                            {formatFileSize(format.filesize)}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected formats summary */}
      {selectedFormats.length > 0 && (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">
              Selected {multiple ? 'Formats' : 'Format'}
            </h3>
            {multiple && (
              <span className="text-xs text-gray-500">
                {selectedFormats.length} selected
              </span>
            )}
          </div>
          <div className="space-y-2">
            {formats
              .filter(f => selectedFormats.includes(f.format_id))
              .map((format, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    {format.resolution ? (
                      <Video className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Music className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-white">
                      {format.resolution ? `${format.resolution}p` : `${format.abr} kbps`}
                    </span>
                  </div>
                  {format.filesize && (
                    <span className="text-gray-400">{formatFileSize(format.filesize)}</span>
                  )}
                </div>
              ))}
          </div>

          {/* Total size */}
          {multiple && (
            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-sm">
              <span className="text-gray-400">Total Size</span>
              <span className="text-white font-medium">
                {formatFileSize(
                  formats
                    .filter(f => selectedFormats.includes(f.format_id))
                    .reduce((sum, f) => sum + (f.filesize || 0), 0)
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Info note */}
      <div className="bg-gray-800/50 p-3 border-t border-gray-700">
        <p className="text-xs text-gray-500 flex items-center space-x-1">
          <Info className="w-3 h-3" />
          <span>Formats with checkmarks indicate recommended quality for your device</span>
        </p>
      </div>
    </div>
  )
}

export default FormatSelector