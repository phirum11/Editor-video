import { useState, useEffect, useRef, useCallback } from 'react'

export const useAudio = (src) => {
  const [audio] = useState(new Audio(src))
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loop, setLoop] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [waveform, setWaveform] = useState([])

  const animationRef = useRef()

  // Load audio metadata
  useEffect(() => {
    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoaded(true)
    }

    const handleError = (e) => {
      setError(e.target.error)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('error', handleError)
    }
  }, [audio])

  // Update time
  const updateTime = useCallback(() => {
    setCurrentTime(audio.currentTime)
    animationRef.current = requestAnimationFrame(updateTime)
  }, [audio])

  // Play/Pause
  const play = useCallback(() => {
    const promise = audio.play()
    if (promise !== undefined) {
      promise
        .then(() => {
          setPlaying(true)
          animationRef.current = requestAnimationFrame(updateTime)
        })
        .catch(error => setError(error))
    }
  }, [audio, updateTime])

  const pause = useCallback(() => {
    audio.pause()
    setPlaying(false)
    cancelAnimationFrame(animationRef.current)
  }, [audio])

  const toggle = useCallback(() => {
    playing ? pause() : play()
  }, [playing, play, pause])

  // Seek
  const seek = useCallback((time) => {
    audio.currentTime = time
    setCurrentTime(time)
  }, [audio])

  // Volume
  const changeVolume = useCallback((value) => {
    audio.volume = value
    setVolume(value)
    setMuted(value === 0)
  }, [audio])

  const toggleMute = useCallback(() => {
    audio.muted = !muted
    setMuted(!muted)
  }, [audio, muted])

  // Playback rate
  const changePlaybackRate = useCallback((rate) => {
    audio.playbackRate = rate
    setPlaybackRate(rate)
  }, [audio])

  // Loop
  const toggleLoop = useCallback(() => {
    audio.loop = !loop
    setLoop(!loop)
  }, [audio, loop])

  // Generate waveform (simplified)
  const generateWaveform = useCallback(async () => {
    if (!src) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const response = await fetch(src)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      const rawData = audioBuffer.getChannelData(0)
      const samples = 100
      const blockSize = Math.floor(rawData.length / samples)
      const waveformData = []

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j])
        }
        waveformData.push(sum / blockSize)
      }

      setWaveform(waveformData)
    } catch (err) {
      setError(err)
    }
  }, [src])

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current)
      audio.pause()
    }
  }, [audio])

  return {
    playing,
    currentTime,
    duration,
    volume,
    muted,
    playbackRate,
    loop,
    error,
    loaded,
    waveform,
    play,
    pause,
    toggle,
    seek,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    toggleLoop,
    generateWaveform,
    // Helper functions
    formatTime: (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    progress: (currentTime / duration) * 100 || 0
  }
}

// Multiple audio tracks
export const usePlaylist = (tracks = []) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [playlist, setPlaylist] = useState(tracks)
  const audio = useAudio(playlist[currentTrackIndex]?.src)

  const next = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)
  }, [playlist.length])

  const previous = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
  }, [playlist.length])

  const addTrack = useCallback((track) => {
    setPlaylist((prev) => [...prev, track])
  }, [])

  const removeTrack = useCallback((index) => {
    setPlaylist((prev) => prev.filter((_, i) => i !== index))
    if (index === currentTrackIndex) {
      setCurrentTrackIndex(0)
    }
  }, [currentTrackIndex])

  return {
    ...audio,
    currentTrack: playlist[currentTrackIndex],
    currentTrackIndex,
    playlist,
    next,
    previous,
    addTrack,
    removeTrack
  }
}

// Audio recorder
export const useAudioRecorder = () => {
  const [recording, setRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const [audioBlob, setAudioBlob] = useState(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState(false)

  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setPermission(true)
      return stream
    } catch (err) {
      setError(err)
      return null
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      if (!streamRef.current) {
        await requestPermission()
      }

      if (!streamRef.current) return

      mediaRecorder.current = new MediaRecorder(streamRef.current)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setAudioBlob(audioBlob)
      }

      mediaRecorder.current.start()
      setRecording(true)

      // Timer for duration
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setError(err)
    }
  }, [requestPermission])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [recording])

  // Reset recording
  const resetRecording = useCallback(() => {
    setAudioURL('')
    setAudioBlob(null)
    setDuration(0)
    audioChunks.current = []
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      clearInterval(timerRef.current)
    }
  }, [])

  return {
    recording,
    audioURL,
    audioBlob,
    duration,
    error,
    permission,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermission,
    formatTime: (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }
}

// Audio visualizer
export const useAudioVisualizer = (audioElement, canvasRef) => {
  const [analyser, setAnalyser] = useState(null)
  const [dataArray, setDataArray] = useState(null)
  const animationRef = useRef()

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return

    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const analyserNode = audioContext.createAnalyser()
    const source = audioContext.createMediaElementSource(audioElement)
    
    source.connect(analyserNode)
    analyserNode.connect(audioContext.destination)
    
    analyserNode.fftSize = 256
    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    setAnalyser(analyserNode)
    setDataArray(dataArray)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      analyserNode.getByteFrequencyData(dataArray)

      ctx.fillStyle = 'rgb(0, 0, 0)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i]

        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2)

        x += barWidth + 1
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
      source.disconnect()
      analyserNode.disconnect()
    }
  }, [audioElement, canvasRef])

  return { analyser, dataArray }
}