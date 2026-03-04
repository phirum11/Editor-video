import React, { useState, useRef, useEffect } from 'react'
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  VolumeX, Download, Clock, List, Mic, 
  Waves, Settings, Maximize2, Minimize2 
} from 'lucide-react'

const AudioPlayer = ({ 
  src, 
  onPlay, 
  onPause, 
  onEnded,
  onTimeUpdate,
  title = "Audio Track",
  artist = "Unknown Artist",
  coverArt,
  waveformData,
  showWaveform = true,
  showTranscript = true,
  transcript,
  onSeek,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [audioQuality, setAudioQuality] = useState('auto')
  const [visualizerBars, setVisualizerBars] = useState([])
  
  const audioRef = useRef(null)
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)

  // Format time (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
      onPause?.()
    } else {
      audioRef.current.play()
      onPlay?.()
    }
    setIsPlaying(!isPlaying)
  }

  // Handle time update
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime)
    onTimeUpdate?.(audioRef.current.currentTime)
  }

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration)
  }

  // Handle seeking
  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value)
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
    onSeek?.(seekTime)
  }

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audioRef.current.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume || 1
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  // Handle playback rate
  const handlePlaybackRate = (rate) => {
    setPlaybackRate(rate)
    audioRef.current.playbackRate = rate
    setShowSettings(false)
  }

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowLeft') {
        audioRef.current.currentTime -= 10
      } else if (e.code === 'ArrowRight') {
        audioRef.current.currentTime += 10
      } else if (e.code === 'ArrowUp') {
        setVolume(Math.min(1, volume + 0.1))
      } else if (e.code === 'ArrowDown') {
        setVolume(Math.max(0, volume - 0.1))
      } else if (e.code === 'KeyM') {
        toggleMute()
      } else if (e.code === 'KeyF') {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, volume])

  // Visualizer animation
  useEffect(() => {
    if (!canvasRef.current || !audioRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaElementSource(audioRef.current)
    
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isPlaying) return
      
      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, '#3b82f6')
        gradient.addColorStop(1, '#8b5cf6')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        
        x += barWidth + 2
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
      source.disconnect()
      analyser.disconnect()
    }
  }, [isPlaying])

  // Playback rates
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

  // Audio qualities
  const qualities = ['auto', 'low', 'medium', 'high', 'lossless']

  return (
    <div 
      ref={containerRef}
      className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden ${className}`}
    >
      {/* Cover Art and Visualizer */}
      <div className="relative h-64 bg-black">
        {coverArt ? (
          <img 
            src={coverArt} 
            alt={title}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Waves className="w-24 h-24 text-gray-600" />
          </div>
        )}
        
        {/* Live Visualizer */}
        <canvas 
          ref={canvasRef}
          className="absolute bottom-0 left-0 w-full h-24"
          width={800}
          height={96}
        />
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        loop={isLooping}
      />

      {/* Player Controls */}
      <div className="p-6 space-y-4">
        {/* Title and Artist */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-400">{artist}</p>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Waveform Display */}
        {showWaveform && waveformData && (
          <div className="h-16 bg-gray-800 rounded-lg overflow-hidden">
            <Waveform data={waveformData} currentTime={currentTime} duration={duration} />
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:hover:bg-blue-600"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-lg transition ${
                isLooping ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Clock className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsShuffling(!isShuffling)}
              className={`p-2 rounded-lg transition ${
                isShuffling ? 'bg-blue-500 text-white' : 'hover:bg-gray-700 text-gray-400'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400">
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
            
            <button className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400">
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-webkit-slider-thumb]:rounded-full"
          />
          <span className="text-sm text-gray-400">{Math.round(volume * 100)}%</span>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Playback Speed</h4>
              <div className="flex flex-wrap gap-2">
                {playbackRates.map(rate => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRate(rate)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      playbackRate === rate
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Audio Quality</h4>
              <div className="flex flex-wrap gap-2">
                {qualities.map(quality => (
                  <button
                    key={quality}
                    onClick={() => setAudioQuality(quality)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      audioQuality === quality
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {showTranscript && transcript && (
        <div className="border-t border-gray-700 p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-3">
            <Mic className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-medium text-gray-300">Live Transcript</h4>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            {transcript}
          </p>
        </div>
      )}
    </div>
  )
}

export default AudioPlayer