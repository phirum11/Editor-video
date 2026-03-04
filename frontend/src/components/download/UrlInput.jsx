import React, { useState, useEffect, useRef } from 'react'
import {
  Link,
  X,
  Check,
  AlertCircle,
  Loader,
  History,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
  Scan,
  Clipboard,
  Sparkles,
  Globe,
  Youtube,
  Music,
  Video,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

const UrlInput = ({
  value = '',
  onChange,
  onSubmit,
  onPaste,
  onClear,
  isValidating = false,
  isValid = null,
  error = null,
  placeholder = 'Enter video URL...',
  showHistory = true,
  showSuggestions = true,
  autoDetect = true,
  className = ''
}) => {
  const [url, setUrl] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false)
  const [history, setHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [detectedPlatform, setDetectedPlatform] = useState(null)
  const [urlType, setUrlType] = useState(null)
  
  const inputRef = useRef(null)
  const historyRef = useRef(null)

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('urlHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }

    const savedFavorites = localStorage.getItem('urlFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save to history when URL is submitted
  const addToHistory = (url) => {
    const newHistory = [
      { url, timestamp: Date.now(), used: 0 },
      ...history.filter(h => h.url !== url)
    ].slice(0, 20)
    
    setHistory(newHistory)
    localStorage.setItem('urlHistory', JSON.stringify(newHistory))
  }

  // Toggle favorite
  const toggleFavorite = (url) => {
    const newFavorites = favorites.includes(url)
      ? favorites.filter(f => f !== url)
      : [...favorites, url]
    
    setFavorites(newFavorites)
    localStorage.setItem('urlFavorites', JSON.stringify(newFavorites))
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('urlHistory')
    setShowHistoryDropdown(false)
  }

  // Detect platform from URL
  const detectPlatformFromUrl = (url) => {
    const platforms = [
      { name: 'YouTube', pattern: /(youtube\.com|youtu\.be)/, icon: Youtube, color: 'text-red-600' },
      { name: 'Vimeo', pattern: /vimeo\.com/, icon: Video, color: 'text-blue-600' },
      { name: 'Dailymotion', pattern: /dailymotion\.com/, icon: Video, color: 'text-gray-600' },
      { name: 'SoundCloud', pattern: /soundcloud\.com/, icon: Music, color: 'text-orange-500' },
      { name: 'Facebook', pattern: /facebook\.com/, icon: Video, color: 'text-blue-600' },
      { name: 'Instagram', pattern: /instagram\.com/, icon: ImageIcon, color: 'text-purple-600' },
      { name: 'Twitter', pattern: /twitter\.com/, icon: Video, color: 'text-blue-400' },
      { name: 'TikTok', pattern: /tiktok\.com/, icon: Video, color: 'text-black' }
    ]

    for (const platform of platforms) {
      if (platform.pattern.test(url)) {
        return platform
      }
    }
    return null
  }

  // Detect URL type
  const detectUrlType = (url) => {
    if (/(youtube\.com|youtu\.be).*list=/.test(url)) return 'playlist'
    if (/(youtube\.com|youtu\.be)/.test(url)) return 'video'
    if (/vimeo\.com\/\d+/.test(url)) return 'video'
    if (/soundcloud\.com/.test(url)) return 'audio'
    if (/\.(mp4|avi|mov|mkv)$/i.test(url)) return 'direct-video'
    if (/\.(mp3|wav|m4a|flac)$/i.test(url)) return 'direct-audio'
    if (/\.(jpg|jpeg|png|gif)$/i.test(url)) return 'image'
    return 'unknown'
  }

  // Handle URL change
  const handleChange = (e) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    onChange?.(newUrl)

    // Detect platform
    if (newUrl && autoDetect) {
      const platform = detectPlatformFromUrl(newUrl)
      setDetectedPlatform(platform)
      
      const type = detectUrlType(newUrl)
      setUrlType(type)
      
      // Generate suggestions
      if (showSuggestions) {
        generateSuggestions(newUrl)
      }
    } else {
      setDetectedPlatform(null)
      setUrlType(null)
    }
  }

  // Handle paste
  const handlePaste = async (e) => {
    const pastedText = e.clipboardData.getData('text')
    onPaste?.(pastedText)
    
    // Auto-submit if enabled
    if (autoDetect && isValidUrl(pastedText)) {
      setTimeout(() => handleSubmit(), 100)
    }
  }

  // Handle submit
  const handleSubmit = () => {
    if (url && isValidUrl(url)) {
      addToHistory(url)
      onSubmit?.(url)
    }
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  // Validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Generate suggestions based on input
  const generateSuggestions = (input) => {
    // This would typically come from an API
    const mockSuggestions = [
      'youtube.com/watch?v=dQw4w9WgXcQ',
      'youtu.be/dQw4w9WgXcQ',
      'vimeo.com/123456789',
      'soundcloud.com/artist/track'
    ].filter(s => s.includes(input) || input.includes('youtube'))
    
    setSuggestions(mockSuggestions)
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Platform icons
  const PlatformIcon = detectedPlatform?.icon || Globe

  return (
    <div className={`space-y-2 ${className}`}>
      {/* URL Input */}
      <div className="relative">
        <div className={`flex items-center bg-white dark:bg-gray-800 border-2 rounded-lg overflow-hidden transition-all ${
          isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-300 dark:border-gray-700'
        } ${error ? 'border-red-500' : ''} ${isValid ? 'border-green-500' : ''}`}>
          
          {/* Left icon */}
          <div className="pl-4">
            {isValidating ? (
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
            ) : isValid ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Link className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={handleChange}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />

          {/* Platform indicator */}
          {detectedPlatform && (
            <div className="flex items-center space-x-2 px-2">
              <PlatformIcon className={`w-5 h-5 ${detectedPlatform.color}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {detectedPlatform.name}
              </span>
            </div>
          )}

          {/* URL type badge */}
          {urlType && urlType !== 'unknown' && (
            <div className="hidden sm:block px-2">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                {urlType.replace('-', ' ')}
              </span>
            </div>
          )}

          {/* Clear button */}
          {url && (
            <button
              onClick={() => {
                setUrl('')
                onClear?.()
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition mr-1"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!url || !isValidUrl(url) || isValidating}
            className="px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Fetch
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}

        {/* Quick actions */}
        <div className="absolute right-2 -bottom-8 flex items-center space-x-2">
          <button
            onClick={async () => {
              const text = await navigator.clipboard.readText()
              setUrl(text)
              onChange?.(text)
            }}
            className="p-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center space-x-1"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3 h-3" />
            <span>Paste</span>
          </button>
          
          <button
            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
            className="p-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center space-x-1"
          >
            <History className="w-3 h-3" />
            <span>History</span>
            {showHistoryDropdown ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* History dropdown */}
      {showHistoryDropdown && (
        <div
          ref={historyRef}
          className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          style={{ maxWidth: '600px' }}
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Recent URLs</span>
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearHistory}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {history.length > 0 ? (
              history.map((item, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => {
                          setUrl(item.url)
                          setShowHistoryDropdown(false)
                        }}
                        className="text-sm text-left text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block w-full"
                      >
                        {item.url}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => toggleFavorite(item.url)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            favorites.includes(item.url)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => {
                          const newHistory = history.filter((_, i) => i !== index)
                          setHistory(newHistory)
                          localStorage.setItem('urlHistory', JSON.stringify(newHistory))
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                No history yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && isFocused && (
        <div className="absolute z-40 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setUrl(suggestion)
                setSuggestions([])
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Smart detection preview */}
      {detectedPlatform && url && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Smart Detection
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Detected {detectedPlatform.name} {urlType} content.
                {urlType === 'playlist' && ' This appears to be a playlist with multiple videos.'}
                {urlType === 'direct-video' && ' Direct video link detected.'}
                {urlType === 'direct-audio' && ' Direct audio link detected.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UrlInput