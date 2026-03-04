import React, { useState, useEffect } from 'react'
import {
  Mic,
  Play,
  Pause,
  Check,
  Search,
  Filter,
  Volume2,
  Star,
  Globe,
  User,
  Hash,
  Clock,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react'

const VoiceSelector = ({
  voices = [],
  selectedVoice,
  onSelect,
  onPreview,
  language = 'all',
  showFavoritesOnly = false,
  showRecentOnly = false,
  allowMultiple = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [favorites, setFavorites] = useState(new Set())
  const [recent, setRecent] = useState([])
  const [previewVoice, setPreviewVoice] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [expandedVoice, setExpandedVoice] = useState(null)
  const [sortBy, setSortBy] = useState('name') // name, language, popularity
  const [showFilters, setShowFilters] = useState(false)

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('voiceFavorites')
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)))
    }
  }, [])

  // Save favorites to localStorage
  const toggleFavorite = (voiceId) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(voiceId)) {
      newFavorites.delete(voiceId)
    } else {
      newFavorites.add(voiceId)
    }
    setFavorites(newFavorites)
    localStorage.setItem('voiceFavorites', JSON.stringify([...newFavorites]))
  }

  // Add to recent
  const addToRecent = (voice) => {
    setRecent(prev => {
      const filtered = prev.filter(v => v.id !== voice.id)
      return [voice, ...filtered].slice(0, 10)
    })
  }

  // Handle voice selection
  const handleSelect = (voice) => {
    onSelect?.(voice)
    addToRecent(voice)
  }

  // Handle preview
  const handlePreview = (voice) => {
    setPreviewVoice(voice)
    setIsPlaying(true)
    onPreview?.(voice)
    
    // Simulate playback ending
    setTimeout(() => {
      setIsPlaying(false)
      setPreviewVoice(null)
    }, 3000)
  }

  // Filter voices
  const filteredVoices = voices.filter(voice => {
    // Search filter
    if (searchTerm && !voice.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !voice.languageName?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Language filter
    if (selectedLanguage !== 'all' && voice.language !== selectedLanguage) {
      return false
    }

    // Gender filter
    if (selectedGender !== 'all' && voice.gender !== selectedGender) {
      return false
    }

    // Favorites filter
    if (showFavoritesOnly && !favorites.has(voice.id)) {
      return false
    }

    // Recent filter
    if (showRecentOnly && !recent.some(v => v.id === voice.id)) {
      return false
    }

    return true
  })

  // Sort voices
  const sortedVoices = [...filteredVoices].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    if (sortBy === 'language') {
      return (a.languageName || '').localeCompare(b.languageName || '')
    }
    if (sortBy === 'popularity') {
      return (b.popularity || 0) - (a.popularity || 0)
    }
    return 0
  })

  // Group by language
  const groupedByLanguage = sortedVoices.reduce((acc, voice) => {
    const lang = voice.languageName || voice.language || 'Other'
    if (!acc[lang]) acc[lang] = []
    acc[lang].push(voice)
    return acc
  }, {})

  // Language options
  const languages = [
    { code: 'all', name: 'All Languages' },
    { code: 'km', name: 'Khmer' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'th', name: 'Thai' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' },
    { code: 'ru', name: 'Russian' }
  ]

  return (
    <div className={`bg-gray-900 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Voice Selection</h2>
            <span className="text-sm text-gray-500">
              {filteredVoices.length} voices
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition ${
                showFilters ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-2 rounded-lg transition ${
                showFavoritesOnly ? 'bg-yellow-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Star className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search voices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2"
              >
                <option value="all">All</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs text-gray-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2"
            >
              <option value="name">Name</option>
              <option value="language">Language</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      )}

      {/* Voice List */}
      <div className="overflow-y-auto max-h-96 p-4" style={{ maxHeight: '500px' }}>
        {Object.entries(groupedByLanguage).map(([language, langVoices]) => (
          <div key={language} className="mb-6">
            <div className="flex items-center space-x-2 mb-3 sticky top-0 bg-gray-900 py-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-300">{language}</h3>
              <span className="text-xs text-gray-600">
                {langVoices.length} voices
              </span>
            </div>
            <div className="space-y-2">
              {langVoices.map(voice => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  isSelected={selectedVoice?.id === voice.id}
                  isFavorite={favorites.has(voice.id)}
                  isPreviewing={previewVoice?.id === voice.id && isPlaying}
                  onSelect={() => handleSelect(voice)}
                  onPreview={() => handlePreview(voice)}
                  onToggleFavorite={() => toggleFavorite(voice.id)}
                  onExpand={() => setExpandedVoice(
                    expandedVoice === voice.id ? null : voice.id
                  )}
                  isExpanded={expandedVoice === voice.id}
                />
              ))}
            </div>
          </div>
        ))}

        {sortedVoices.length === 0 && (
          <div className="text-center py-12">
            <Mic className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No voices found</p>
          </div>
        )}
      </div>

      {/* Recent Voices */}
      {recent.length > 0 && !showRecentOnly && (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Recent</h3>
            </div>
            <button
              onClick={() => setRecent([])}
              className="text-xs text-gray-500 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {recent.map(voice => (
              <button
                key={voice.id}
                onClick={() => handleSelect(voice)}
                className="flex-shrink-0 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
              >
                <span className="text-sm text-white">{voice.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Voice Card Component
const VoiceCard = ({
  voice,
  isSelected,
  isFavorite,
  isPreviewing,
  onSelect,
  onPreview,
  onToggleFavorite,
  onExpand,
  isExpanded
}) => {
  return (
    <div
      className={`group bg-gray-800 rounded-lg overflow-hidden transition ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-750'
      }`}
    >
      {/* Main Card */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-white">{voice.name}</h4>
              {voice.isNew && (
                <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">
                  NEW
                </span>
              )}
              {voice.isPremium && (
                <span className="px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded">
                  PREMIUM
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{voice.gender}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>{voice.languageName || voice.language}</span>
              </span>
              {voice.age && (
                <span className="flex items-center space-x-1">
                  <Hash className="w-3 h-3" />
                  <span>{voice.age}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg transition ${
                isFavorite ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
              }`}
            >
              <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onExpand}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={onPreview}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              {isPreviewing ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>
            {isPreviewing && (
              <div className="flex items-center space-x-1">
                <div className="w-1 h-4 bg-blue-500 animate-pulse" />
                <div className="w-1 h-6 bg-blue-500 animate-pulse delay-100" />
                <div className="w-1 h-3 bg-blue-500 animate-pulse delay-200" />
              </div>
            )}
          </div>
          <button
            onClick={onSelect}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              isSelected
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isSelected ? (
              <span className="flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Selected</span>
              </span>
            ) : (
              'Select'
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-3 bg-gray-900 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <span className="text-xs text-gray-500 block">Language Code</span>
              <span className="text-sm text-white">{voice.language}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Voice ID</span>
              <span className="text-sm text-white font-mono">{voice.id}</span>
            </div>
            {voice.sampleRate && (
              <div>
                <span className="text-xs text-gray-500 block">Sample Rate</span>
                <span className="text-sm text-white">{voice.sampleRate} Hz</span>
              </div>
            )}
            {voice.bitrate && (
              <div>
                <span className="text-xs text-gray-500 block">Bitrate</span>
                <span className="text-sm text-white">{voice.bitrate} kbps</span>
              </div>
            )}
          </div>

          {voice.description && (
            <div className="mb-3">
              <span className="text-xs text-gray-500 block mb-1">Description</span>
              <p className="text-sm text-gray-400">{voice.description}</p>
            </div>
          )}

          {voice.styles && voice.styles.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-gray-500 block mb-1">Voice Styles</span>
              <div className="flex flex-wrap gap-2">
                {voice.styles.map(style => (
                  <span
                    key={style}
                    className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-400">
                {voice.uses || 0} uses this week
              </span>
            </div>
            <button
              onClick={() => window.open(voice.docsUrl, '_blank')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Documentation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceSelector