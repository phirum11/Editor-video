import React, { useState } from 'react'
import {
  Download,
  Link2,
  Music,
  Video,
  FileText,
  Image,
  Globe,
  Settings,
  History,
  Star,
  Trash2,
  Play,
  Pause,
  Check,
  X,
  AlertCircle,
  Clock,
  HardDrive,
  Zap,
  RefreshCw,
  Folder,
  Eye,
  Copy,
  Share2,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Calendar,
  DownloadCloud,
  Upload,
  ExternalLink,
  Info
} from 'lucide-react'
import UrlInput from '../components/download/UrlInput'
import FormatSelector from '../components/download/FormatSelector'
import PlaylistSelector from '../components/download/PlaylistSelector'
import DownloadProgress from '../components/download/DownloadProgress'
import Button from '../components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { useDownload } from '../hooks/useDownload'
import { useToast } from '../hooks/useToast'

const Downloader = () => {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState('video')
  const [quality, setQuality] = useState('best')
  const [audioFormat, setAudioFormat] = useState('mp3')
  const [audioQuality, setAudioQuality] = useState('192')
  const [extractAudio, setExtractAudio] = useState(false)
  const [subtitles, setSubtitles] = useState(false)
  const [thumbnail, setThumbnail] = useState(false)
  const [playlist, setPlaylist] = useState([])
  const [selectedPlaylistItems, setSelectedPlaylistItems] = useState([])
  const [videoInfo, setVideoInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('single')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [downloadHistory, setDownloadHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const [stats, setStats] = useState({
    totalDownloads: 156,
    totalSize: 45.2,
    avgSpeed: 12.5,
    successRate: 98
  })

  const { startDownload, downloads, stats: downloadStats } = useDownload()
  const { success, error: showError } = useToast()

  // Mock formats
  const mockFormats = [
    { format_id: '137', ext: 'mp4', resolution: 1080, filesize: 250 * 1024 * 1024, vcodec: 'h264', acodec: 'aac', fps: 30, quality: 1080 },
    { format_id: '136', ext: 'mp4', resolution: 720, filesize: 150 * 1024 * 1024, vcodec: 'h264', acodec: 'aac', fps: 30, quality: 720 },
    { format_id: '135', ext: 'mp4', resolution: 480, filesize: 80 * 1024 * 1024, vcodec: 'h264', acodec: 'aac', fps: 30, quality: 480 },
    { format_id: '140', ext: 'm4a', abr: 128, filesize: 15 * 1024 * 1024, acodec: 'aac', quality: 128 },
    { format_id: '251', ext: 'webm', abr: 160, filesize: 18 * 1024 * 1024, acodec: 'opus', quality: 160 }
  ]

  // Mock playlist
  const mockPlaylist = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Video Tutorial Episode ${i + 1}`,
    duration: 300 + i * 60,
    size: (50 + i * 10) * 1024 * 1024,
    thumbnail: `https://picsum.photos/200/120?random=${i}`,
    type: i % 3 === 0 ? 'video' : i % 3 === 1 ? 'audio' : 'image',
    date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    episode: i + 1
  }))

  // Handle URL submit
  const handleSubmit = async (url) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check if playlist
      if (url.includes('playlist') || url.includes('list=')) {
        setPlaylist(mockPlaylist)
        setVideoInfo(null)
        success('Playlist detected with 12 items')
      } else {
        setVideoInfo({
          title: 'Sample Video Title',
          duration: 845,
          uploader: 'Video Creator',
          views: 12345,
          likes: 892,
          comments: 156
        })
        setPlaylist([])
        success('Video information fetched successfully')
      }
    } catch (err) {
      setError(err.message)
      showError('Failed to fetch video information')
    } finally {
      setLoading(false)
    }
  }

  // Handle download start
  const handleDownload = async () => {
    try {
      if (playlist.length > 0) {
        if (selectedPlaylistItems.length === 0) {
          showError('Please select items to download')
          return
        }

        const items = selectedPlaylistItems.map(id => 
          mockPlaylist.find(item => item.id === id)
        )

        for (const item of items) {
          await startDownload(item.url || 'https://example.com/video', {
            format,
            quality,
            audioFormat,
            audioQuality,
            extractAudio,
            subtitles,
            thumbnail,
            filename: item.title
          })
        }
        success(`Started downloading ${items.length} items`)
      } else {
        await startDownload(url, {
          format,
          quality,
          audioFormat,
          audioQuality,
          extractAudio,
          subtitles,
          thumbnail
        })
        success('Download started successfully')
      }
    } catch (err) {
      showError('Failed to start download')
    }
  }

  // Handle history
  const addToHistory = (item) => {
    setDownloadHistory(prev => [item, ...prev].slice(0, 20))
  }

  const toggleFavorite = (url) => {
    setFavorites(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url)
        : [...prev, url]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Download Manager</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Download videos, audio, and playlists from 1000+ websites
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSize} GB</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <HardDrive className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Speed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgSpeed} MB/s</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Check className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Download Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL Input */}
          <UrlInput
            value={url}
            onChange={setUrl}
            onSubmit={handleSubmit}
            isValidating={loading}
            error={error}
            showHistory
            showSuggestions
            autoDetect
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-64">
              <TabsTrigger value="single">Single Video</TabsTrigger>
              <TabsTrigger value="playlist">Playlist</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="pt-6">
              {videoInfo && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{videoInfo.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Uploader:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{videoInfo.uploader}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{videoInfo.views.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Likes:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{videoInfo.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <FormatSelector
                formats={mockFormats}
                selectedFormat={format}
                onSelect={setFormat}
                type="video"
                showQuality
                showSize
              />

              <div className="mt-6 space-y-4">
                {/* Basic Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="best">Best Quality</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                    <option value="360p">360p</option>
                  </select>

                  <select
                    value={audioFormat}
                    onChange={(e) => setAudioFormat(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="mp3">MP3</option>
                    <option value="m4a">M4A</option>
                    <option value="wav">WAV</option>
                    <option value="flac">FLAC</option>
                  </select>

                  <select
                    value={audioQuality}
                    onChange={(e) => setAudioQuality(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="128">128 kbps</option>
                    <option value="192">192 kbps</option>
                    <option value="256">256 kbps</option>
                    <option value="320">320 kbps</option>
                  </select>
                </div>

                {/* Advanced Options Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <span>Advanced Options</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={extractAudio}
                        onChange={(e) => setExtractAudio(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Extract audio only</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={subtitles}
                        onChange={(e) => setSubtitles(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Download subtitles</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={thumbnail}
                        onChange={(e) => setThumbnail(e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Download thumbnail</span>
                    </label>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="playlist" className="pt-6">
              {playlist.length > 0 && (
                <PlaylistSelector
                  items={playlist}
                  selectedItems={selectedPlaylistItems}
                  onSelect={setSelectedPlaylistItems}
                  onSelectAll={() => setSelectedPlaylistItems(playlist.map(p => p.id))}
                  onDownload={handleDownload}
                  title="Playlist Items"
                  showStats
                  showSearch
                  showFilters
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Download Button */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setUrl('')}>
              Clear
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={!url || loading}
              loading={loading}
              icon={Download}
            >
              Start Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Download Progress */}
      {downloads.length > 0 && (
        <DownloadProgress
          downloads={downloads}
          onPause={(id) => console.log('Pause', id)}
          onResume={(id) => console.log('Resume', id)}
          onCancel={(id) => console.log('Cancel', id)}
          onRetry={(id) => console.log('Retry', id)}
          onClear={() => console.log('Clear')}
          onOpenFolder={(path) => console.log('Open', path)}
          showDetails
        />
      )}

      {/* History and Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Recent Downloads</span>
            </CardTitle>
            <Button variant="ghost" size="sm">Clear All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {downloadHistory.length > 0 ? (
                downloadHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <Video className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <Folder className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No download history</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Favorites</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {favorites.length > 0 ? (
                favorites.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                        <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 fill-current" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{url}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(url)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No favorites yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Downloader