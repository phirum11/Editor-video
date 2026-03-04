import React, { useState, useEffect } from 'react'
import {
  Play,
  Check,
  Clock,
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Folder,
  Video,
  Image,
  Music,
  FileText,
  Star,
  Eye,
  DownloadCloud,
  List,
  Grid,
  SortAsc,
  SortDesc,
  Calendar,
  Hash,
  User,
  PlayCircle
} from 'lucide-react'

const PlaylistSelector = ({
  items = [],
  selectedItems = [],
  onSelect,
  onSelectAll,
  onDownload,
  title = 'Playlist',
  totalItems = 0,
  showStats = true,
  allowMultiple = true,
  showSearch = true,
  showFilters = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid, list, compact
  const [sortBy, setSortBy] = useState('index') // index, title, duration, size
  const [sortOrder, setSortOrder] = useState('asc')
  const [filterType, setFilterType] = useState('all')
  const [expandedItems, setExpandedItems] = useState({})
  const [filteredItems, setFilteredItems] = useState(items)
  const [stats, setStats] = useState({
    total: 0,
    videos: 0,
    audio: 0,
    images: 0,
    documents: 0,
    totalSize: 0,
    totalDuration: 0
  })

  // Calculate stats
  useEffect(() => {
    const newStats = items.reduce((acc, item) => {
      acc.total++
      if (item.type === 'video') acc.videos++
      if (item.type === 'audio') acc.audio++
      if (item.type === 'image') acc.images++
      if (item.type === 'document') acc.documents++
      acc.totalSize += item.size || 0
      acc.totalDuration += item.duration || 0
      return acc
    }, {
      total: 0,
      videos: 0,
      audio: 0,
      images: 0,
      documents: 0,
      totalSize: 0,
      totalDuration: 0
    })
    setStats(newStats)
  }, [items])

  // Filter and sort items
  useEffect(() => {
    let filtered = [...items]

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'index') {
        comparison = (a.index || 0) - (b.index || 0)
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortBy === 'duration') {
        comparison = (a.duration || 0) - (b.duration || 0)
      } else if (sortBy === 'size') {
        comparison = (a.size || 0) - (b.size || 0)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredItems(filtered)
  }, [items, searchTerm, filterType, sortBy, sortOrder])

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      onSelect?.([])
    } else {
      onSelect?.(filteredItems.map(item => item.id))
    }
  }

  // Handle item select
  const handleSelect = (itemId) => {
    if (!allowMultiple) {
      onSelect?.([itemId])
      return
    }

    const newSelection = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId]
    onSelect?.(newSelection)
  }

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '00:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Format size
  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return Video
      case 'audio': return Music
      case 'image': return Image
      case 'document': return FileText
      default: return FileText
    }
  }

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'video': return 'text-blue-400'
      case 'audio': return 'text-green-400'
      case 'image': return 'text-purple-400'
      case 'document': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <span className="text-sm text-gray-500">
              {filteredItems.length} of {items.length} items
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'compact' ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Hash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="space-y-3">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search in playlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white text-sm rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white text-sm rounded-lg"
              >
                <option value="index">Sort by Index</option>
                <option value="title">Sort by Title</option>
                <option value="duration">Sort by Duration</option>
                <option value="size">Sort by Size</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="bg-gray-800/50 p-3 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.videos}</p>
              <p className="text-xs text-gray-500">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.audio}</p>
              <p className="text-xs text-gray-500">Audio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.images}</p>
              <p className="text-xs text-gray-500">Images</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
            <span>Total Size: {formatSize(stats.totalSize)}</span>
            <span>Total Duration: {formatDuration(stats.totalDuration)}</span>
          </div>
        </div>
      )}

      {/* Select All bar */}
      {allowMultiple && filteredItems.length > 0 && (
        <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center justify-between">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              selectedItems.length === filteredItems.length
                ? 'bg-blue-500 border-blue-500'
                : selectedItems.length > 0
                ? 'border-blue-500'
                : 'border-gray-600'
            }`}>
              {selectedItems.length === filteredItems.length && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span>
              {selectedItems.length === filteredItems.length
                ? 'Deselect All'
                : 'Select All'
              }
            </span>
          </button>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                {selectedItems.length} selected
              </span>
              <button
                onClick={() => onDownload?.(selectedItems)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Items list */}
      <div className={`overflow-y-auto ${viewMode === 'grid' ? 'p-4' : ''}`} style={{ maxHeight: '500px' }}>
        {filteredItems.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
            {filteredItems.map((item, index) => {
              const isSelected = selectedItems.includes(item.id)
              const TypeIcon = getTypeIcon(item.type)
              const typeColor = getTypeColor(item.type)

              if (viewMode === 'grid') {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`group p-3 bg-gray-800 rounded-lg border-2 transition ${
                      isSelected
                        ? 'border-blue-500'
                        : 'border-transparent hover:border-gray-700'
                    }`}
                  >
                    <div className="aspect-video bg-gray-700 rounded-lg mb-2 flex items-center justify-center relative">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <PlayCircle className="w-8 h-8 text-gray-600" />
                      )}
                      {item.duration && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black bg-opacity-75 text-white text-xs rounded">
                          {formatDuration(item.duration)}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <TypeIcon className={`w-3 h-3 ${typeColor}`} />
                          <span className="text-xs text-gray-500">
                            {item.type}
                          </span>
                        </div>
                        {item.size && (
                          <span className="text-xs text-gray-600">
                            {formatSize(item.size)}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              }

              if (viewMode === 'list') {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full p-3 bg-gray-800 rounded-lg border-2 transition flex items-center space-x-4 ${
                      isSelected
                        ? 'border-blue-500'
                        : 'border-transparent hover:border-gray-700'
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <TypeIcon className={`w-6 h-6 ${typeColor}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {item.title}
                        </span>
                        {item.episode && (
                          <span className="text-xs text-gray-500">
                            Ep. {item.episode}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date || 'Unknown'}</span>
                        </span>
                        {item.duration && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(item.duration)}</span>
                          </span>
                        )}
                        {item.size && (
                          <span className="flex items-center space-x-1">
                            <Download className="w-3 h-3" />
                            <span>{formatSize(item.size)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                )
              }

              // Compact view
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full px-3 py-2 bg-gray-800 rounded-lg border transition flex items-center justify-between ${
                    isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500 w-8">
                      {String(item.index || index + 1).padStart(2, '0')}
                    </span>
                    <TypeIcon className={`w-4 h-4 ${typeColor}`} />
                    <span className="text-sm text-white truncate max-w-xs">
                      {item.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {item.duration && (
                      <span className="text-xs text-gray-500">
                        {formatDuration(item.duration)}
                      </span>
                    )}
                    {item.size && (
                      <span className="text-xs text-gray-600">
                        {formatSize(item.size)}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No items found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 p-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Showing {filteredItems.length} of {items.length}</span>
            {selectedItems.length > 0 && (
              <span>{selectedItems.length} selected</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span>Page 1 of {Math.ceil(filteredItems.length / 20)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaylistSelector