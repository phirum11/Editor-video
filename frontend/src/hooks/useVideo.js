import { useState, useEffect, useRef, useCallback } from 'react'

export const useVideo = (src) => {
  const videoRef = useRef(null)
  const [video, setVideo] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loop, setLoop] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [buffered, setBuffered] = useState([])
  const [seeking, setSeeking] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [ended, setEnded] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [pip, setPip] = useState(false)
  const [videoWidth, setVideoWidth] = useState(0)
  const [videoHeight, setVideoHeight] = useState(0)
  const [aspectRatio, setAspectRatio] = useState('16/9')
  const [qualities, setQualities] = useState([])
  const [currentQuality, setCurrentQuality] = useState('auto')
  const [subtitles, setSubtitles] = useState([])
  const [currentSubtitle, setCurrentSubtitle] = useState(null)
  const [chapters, setChapters] = useState([])

  const animationRef = useRef()
  const containerRef = useRef()

  // Initialize video
  useEffect(() => {
    const videoElement = document.createElement('video')
    videoElement.src = src
    videoElement.crossOrigin = 'anonymous'
    setVideo(videoElement)

    return () => {
      videoElement.pause()
      videoElement.src = ''
      videoElement.load()
    }
  }, [src])

  // Event listeners
  useEffect(() => {
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setVideoWidth(video.videoWidth)
      setVideoHeight(video.videoHeight)
      setAspectRatio(`${video.videoWidth}:${video.videoHeight}`)
      setLoaded(true)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedRanges = []
        for (let i = 0; i < video.buffered.length; i++) {
          bufferedRanges.push({
            start: video.buffered.start(i),
            end: video.buffered.end(i)
          })
        }
        setBuffered(bufferedRanges)
      }
    }

    const handleWaiting = () => setWaiting(true)
    const handlePlaying = () => {
      setWaiting(false)
      setEnded(false)
    }
    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)
    const handleEnded = () => {
      setPlaying(false)
      setEnded(true)
    }
    const handleSeeking = () => setSeeking(true)
    const handleSeeked = () => setSeeking(false)
    const handleError = (e) => setError(e.target.error)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('seeking', handleSeeking)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('seeking', handleSeeking)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('error', handleError)
    }
  }, [video])

  // Play/Pause
  const play = useCallback(() => {
    video?.play().catch(err => setError(err))
  }, [video])

  const pause = useCallback(() => {
    video?.pause()
  }, [video])

  const toggle = useCallback(() => {
    playing ? pause() : play()
  }, [playing, play, pause])

  // Seek
  const seek = useCallback((time) => {
    if (video) {
      video.currentTime = time
      setCurrentTime(time)
    }
  }, [video])

  const seekBy = useCallback((seconds) => {
    if (video) {
      video.currentTime += seconds
    }
  }, [video])

  // Volume
  const changeVolume = useCallback((value) => {
    if (video) {
      video.volume = value
      setVolume(value)
      setMuted(value === 0)
    }
  }, [video])

  const toggleMute = useCallback(() => {
    if (video) {
      video.muted = !muted
      setMuted(!muted)
    }
  }, [video, muted])

  // Playback rate
  const changePlaybackRate = useCallback((rate) => {
    if (video) {
      video.playbackRate = rate
      setPlaybackRate(rate)
    }
  }, [video])

  // Loop
  const toggleLoop = useCallback(() => {
    if (video) {
      video.loop = !loop
      setLoop(!loop)
    }
  }, [video, loop])

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [fullscreen])

  // Picture-in-Picture
  const togglePip = useCallback(() => {
    if (!video) return

    if (!pip) {
      if (video.requestPictureInPicture) {
        video.requestPictureInPicture()
      }
    } else {
      if (document.exitPictureInPicture) {
        document.exitPictureInPicture()
      }
    }
  }, [video, pip])

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Listen for PiP change
  useEffect(() => {
    const handlePipChange = () => {
      setPip(!!document.pictureInPictureElement)
    }

    document.addEventListener('enterpictureinpicture', handlePipChange)
    document.addEventListener('leavepictureinpicture', handlePipChange)
    return () => {
      document.removeEventListener('enterpictureinpicture', handlePipChange)
      document.removeEventListener('leavepictureinpicture', handlePipChange)
    }
  }, [])

  // Capture frame
  const captureFrame = useCallback(() => {
    if (!video || !video.videoWidth) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    
    return canvas.toDataURL('image/png')
  }, [video])

  // Get video info
  const getVideoInfo = useCallback(() => {
    return {
      duration,
      width: videoWidth,
      height: videoHeight,
      aspectRatio,
      codec: video?.videoTracks?.[0]?.codec,
      bitrate: video?.videoTracks?.[0]?.bitrate
    }
  }, [duration, videoWidth, videoHeight, aspectRatio, video])

  return {
    videoRef,
    containerRef,
    playing,
    currentTime,
    duration,
    volume,
    muted,
    playbackRate,
    loop,
    error,
    loaded,
    buffered,
    seeking,
    waiting,
    ended,
    fullscreen,
    pip,
    videoWidth,
    videoHeight,
    aspectRatio,
    qualities,
    currentQuality,
    subtitles,
    currentSubtitle,
    chapters,
    play,
    pause,
    toggle,
    seek,
    seekBy,
    changeVolume,
    toggleMute,
    changePlaybackRate,
    toggleLoop,
    toggleFullscreen,
    togglePip,
    captureFrame,
    getVideoInfo,
    // Helper functions
    formatTime: (seconds) => {
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = Math.floor(seconds % 60)
      
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      }
      return `${m}:${s.toString().padStart(2, '0')}`
    },
    progress: (currentTime / duration) * 100 || 0,
    bufferedProgress: buffered.length > 0 
      ? (buffered[buffered.length - 1].end / duration) * 100 
      : 0
  }
}

// Multiple videos
export const useVideoPlaylist = (videos = []) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playlist, setPlaylist] = useState(videos)
  const video = useVideo(playlist[currentIndex]?.src)

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length)
  }, [playlist.length])

  const previous = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
  }, [playlist.length])

  const addVideo = useCallback((video) => {
    setPlaylist((prev) => [...prev, video])
  }, [])

  const removeVideo = useCallback((index) => {
    setPlaylist((prev) => prev.filter((_, i) => i !== index))
    if (index === currentIndex) {
      setCurrentIndex(0)
    }
  }, [currentIndex])

  return {
    ...video,
    currentVideo: playlist[currentIndex],
    currentIndex,
    playlist,
    next,
    previous,
    addVideo,
    removeVideo
  }
}

// Video recorder
export const useVideoRecorder = () => {
  const [recording, setRecording] = useState(false)
  const [videoURL, setVideoURL] = useState('')
  const [videoBlob, setVideoBlob] = useState(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)
  const [permission, setPermission] = useState(false)
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)

  const mediaRecorder = useRef(null)
  const videoChunks = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(d => d.kind === 'videoinput')
        setDevices(videoDevices)
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      } catch (err) {
        setError(err)
      }
    }
    getDevices()
  }, [])

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
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

      mediaRecorder.current = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm'
      })
      videoChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        videoChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = () => {
        const videoBlob = new Blob(videoChunks.current, { type: 'video/webm' })
        const url = URL.createObjectURL(videoBlob)
        setVideoURL(url)
        setVideoBlob(videoBlob)
      }

      mediaRecorder.current.start()
      setRecording(true)

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
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [recording])

  return {
    recording,
    videoURL,
    videoBlob,
    duration,
    error,
    permission,
    devices,
    selectedDevice,
    setSelectedDevice,
    startRecording,
    stopRecording,
    requestPermission
  }
}