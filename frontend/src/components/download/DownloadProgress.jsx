import React, { useState, useEffect } from 'react'
import {
  Download,
  Check,
  X,
  AlertCircle,
  Pause,
  Play,
  StopCircle,
  RefreshCw,
  Folder,
  Clock,
  HardDrive,
  Zap,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  Copy,
  Share2,
  ArrowUpRight,
  Maximize2,
  Minimize2
} from 'lucide-react'

const DownloadProgress = ({
  downloads = [],
  onPause,
  onResume,
  onCancel,
  onRetry,
  onClear,
  onOpenFolder,
  showDetails = true,
  compact = false,
  className = ''
}) => {
  const [expandedItems, setExpandedItems] = useState({})
  const [overallStats, setOverallStats] = useState({
    total: 0,
    completed: 0,
    downloading: 0,
    paused: 0,
    failed: 0,
    totalSize: 0,
    downloadedSize: 0,
    totalSpeed: 0
  })

  // Calculate overall stats
  useEffect(() => {
    const stats = downloads.reduce((acc, item) => {
      acc.total++
      if (item.status === 'completed') acc.completed++
      if (item.status === 'downloading') acc.downloading++
      if (item.status === 'paused') acc.paused++
      if (item.status === 'failed') acc.failed++
      acc.totalSize += item.totalSize || 0
      acc.downloadedSize += item.downloadedSize || 0
      acc.totalSpeed += item.speed || 0
      return acc
    }, {
      total: 0,
      completed: 0,
      downloading: 0,
      paused: 0,
      failed: 0,
      totalSize: 0,
      downloadedSize: 0,
      totalSpeed: 0
    })
    setOverallStats(stats)
  }, [downloads])

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Format speed
  const formatSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond) return '0 KB/s'
    return formatBytes(bytesPerSecond) + '/s'
  }

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || seconds === Infinity) return '--:--'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'downloading': return 'text-blue-500'
      case 'paused': return 'text-yellow-500'
      case 'failed': return 'text-red-500'
      case 'queued': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return Check
      case 'downloading': return Download
      case 'paused': return Pause
      case 'failed': return AlertCircle
      case 'queued': return Clock
      default: return Download
    }
  }

  if (compact) {
    return (
      <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
        {/* Compact header */}
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Downloads</span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-green-500">{overallStats.completed}</span>
              <span className="text-blue-500">{overallStats.downloading}</span>
              <span className="text-yellow-500">{overallStats.paused}</span>
              <span className="text-red-500">{overallStats.failed}</span>
            </div>
          </div>
        </div>

        {/* Compact list */}
        <div className="max-h-60 overflow-y-auto">
          {downloads.slice(0, 5).map((item, index) => {
            const StatusIcon = getStatusIcon(item.status)
            const progress = item.totalSize ? (item.downloadedSize / item.totalSize) * 100 : 0

            return (
              <div key={item.id || index} className="p-3 border-b border-gray-800 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 min-w-0">
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(item.status)}`} />
                    <span className="text-sm text-white truncate">{item.title || 'Download'}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatBytes(item.downloadedSize || 0)}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">{formatSpeed(item.speed)}</span>
                    <span className="text-gray-500">{formatTime(item.eta)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 p-2 text-center">
          <button className="text-xs text-blue-400 hover:text-blue-300">
            View All Downloads
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Download Manager</h2>
            <span className="text-sm text-gray-500">
              {overallStats.downloading} active
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClear}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
              title="Clear completed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenFolder}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
              title="Open downloads folder"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white font-medium">
              {formatBytes(overallStats.downloadedSize)} / {formatBytes(overallStats.totalSize)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(overallStats.downloadedSize / overallStats.totalSize) * 100 || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>{formatSpeed(overallStats.totalSpeed)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <HardDrive className="w-3 h-3" />
              <span>{formatBytes(overallStats.totalSize)} total</span>
            </span>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center space-x-1">
            <Check className="w-3 h-3" />
            <span>{overallStats.completed} Completed</span>
          </span>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center space-x-1">
            <Download className="w-3 h-3" />
            <span>{overallStats.downloading} Downloading</span>
          </span>
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center space-x-1">
            <Pause className="w-3 h-3" />
            <span>{overallStats.paused} Paused</span>
          </span>
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>{overallStats.failed} Failed</span>
          </span>
        </div>
      </div>

      {/* Download list */}
      <div className="max-h-96 overflow-y-auto">
        {downloads.map((item, index) => {
          const isExpanded = expandedItems[item.id]
          const StatusIcon = getStatusIcon(item.status)
          const progress = item.totalSize ? (item.downloadedSize / item.totalSize) * 100 : 0
          const StatusColor = getStatusColor(item.status)

          return (
            <div
              key={item.id || index}
              className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition"
            >
              {/* Main row */}
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${
                    item.status === 'completed' ? 'bg-green-500/20' :
                    item.status === 'failed' ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    <StatusIcon className={`w-5 h-5 ${StatusColor}`} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="text-sm font-medium text-white truncate">
                          {item.title || 'Downloading...'}
                        </h3>
                        {item.url && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {item.url}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-white">
                          {formatBytes(item.downloadedSize || 0)}
                        </span>
                        <span className="text-xs text-gray-500">
                          / {formatBytes(item.totalSize || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.status === 'completed' ? 'bg-green-500' :
                            item.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Progress details */}
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-500">
                            Speed: {formatSpeed(item.speed)}
                          </span>
                          <span className="text-gray-500">
                            ETA: {formatTime(item.eta)}
                          </span>
                        </div>
                        <button
                          onClick={() => setExpandedItems(prev => ({
                            ...prev,
                            [item.id]: !prev[item.id]
                          }))}
                          className="text-gray-500 hover:text-gray-400"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end space-x-2 mt-3">
                  {item.status === 'downloading' && (
                    <>
                      <button
                        onClick={() => onPause?.(item.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition text-yellow-500"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onCancel?.(item.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition text-red-500"
                        title="Cancel"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {item.status === 'paused' && (
                    <>
                      <button
                        onClick={() => onResume?.(item.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition text-green-500"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onCancel?.(item.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition text-red-500"
                        title="Cancel"
                      >
                        <StopCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {item.status === 'failed' && (
                    <button
                      onClick={() => onRetry?.(item.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition text-blue-500"
                      title="Retry"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}

                  {item.status === 'completed' && (
                    <>
                      <button
                        onClick={() => onOpenFolder?.(item.path)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
                        title="Open file location"
                      >
                        <Folder className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRetry?.(item.id)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
                        title="Download again"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && showDetails && (
                <div className="px-4 pb-4 pt-2 bg-gray-800/50">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">File Information</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white">{item.filename || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Size:</span>
                          <span className="text-white">{formatBytes(item.totalSize || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white">{item.type || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Format:</span>
                          <span className="text-white">{item.format || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Download Details</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Started:</span>
                          <span className="text-white">
                            {item.startTime ? new Date(item.startTime).toLocaleString() : '--'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Completed:</span>
                          <span className="text-white">
                            {item.endTime ? new Date(item.endTime).toLocaleString() : '--'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Speed:</span>
                          <span className="text-white">{formatSpeed(item.avgSpeed)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Source:</span>
                          <span className="text-white truncate">{item.source || 'Direct'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {item.error && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-xs text-red-400">{item.error}</p>
                    </div>
                  )}

                  <button
                    onClick={() => window.open(item.url, '_blank')}
                    className="mt-3 w-full flex items-center justify-center space-x-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm text-white"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Open Source URL</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {downloads.length === 0 && (
        <div className="text-center py-12">
          <Download className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No downloads in progress</p>
          <p className="text-sm text-gray-600 mt-1">
            Add URLs to start downloading
          </p>
        </div>
      )}
    </div>
  )
}

export default DownloadProgress
