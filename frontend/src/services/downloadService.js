import { apiClient, handleResponse, handleError, downloadFile } from './api'
import { wsManager } from './api'

class DownloadService {
  constructor() {
    this.baseUrl = '/download'
    this.tasks = new Map()
  }

  // Get video info
  async getInfo(url) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/info`, {
        params: { url }
      })
      const data = handleResponse(response)
      return {
        success: true,
        info: data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get video info'
      }
    }
  }

  // Get available formats
  async getFormats(url) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/formats`, {
        params: { url }
      })
      const data = handleResponse(response)
      return {
        success: true,
        formats: data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get formats'
      }
    }
  }

  // Start download
  async startDownload(url, options = {}) {
    try {
      const {
        format = 'video',
        quality = 'best',
        audioFormat = 'mp3',
        audioQuality = '192',
        extractAudio = false,
        subtitles = false,
        thumbnail = false,
        limitSpeed = null
      } = options

      const response = await apiClient.post(`${this.baseUrl}/start`, {
        url,
        format,
        quality,
        audio_format: audioFormat,
        audio_quality: audioQuality,
        extract_audio: extractAudio,
        subtitles,
        thumbnail,
        limit_speed: limitSpeed
      })

      const { task_id, status, message } = response.data

      this.tasks.set(task_id, {
        id: task_id,
        status,
        message,
        progress: 0,
        url,
        ...options
      })

      return {
        success: true,
        taskId: task_id
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to start download'
      }
    }
  }

  // Download playlist
  async downloadPlaylist(url, episodes, options = {}) {
    try {
      const {
        format = 'video',
        quality = 'best',
        audioFormat = 'mp3'
      } = options

      const response = await apiClient.post(`${this.baseUrl}/playlist`, {
        url,
        episodes,
        format,
        quality,
        audio_format: audioFormat
      })

      const { task_id, total_episodes } = response.data

      this.tasks.set(task_id, {
        id: task_id,
        status: 'pending',
        total: total_episodes,
        completed: 0,
        progress: 0,
        url
      })

      return {
        success: true,
        taskId: task_id,
        total: total_episodes
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to download playlist'
      }
    }
  }

  // Get download progress
  async getProgress(taskId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/progress/${taskId}`)
      const data = handleResponse(response)
      
      const task = this.tasks.get(taskId) || {}
      this.tasks.set(taskId, {
        ...task,
        ...data
      })

      return {
        success: true,
        ...data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get progress'
      }
    }
  }

  // Get download file
  async getDownloadFile(taskId, filename) {
    try {
      const task = this.tasks.get(taskId)
      const defaultFilename = task?.title 
        ? `${task.title}.${task.format === 'audio' ? task.audioFormat : 'mp4'}`
        : `download_${taskId}.mp4`

      await downloadFile(
        `${this.baseUrl}/download/${taskId}`,
        filename || defaultFilename
      )
      
      this.tasks.delete(taskId)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to download file'
      }
    }
  }

  // Cancel download
  async cancelDownload(taskId) {
    try {
      await apiClient.post(`${this.baseUrl}/cancel/${taskId}`)
      this.tasks.delete(taskId)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel download'
      }
    }
  }

  // Connect to WebSocket for real-time progress
  connectWebSocket(taskId, callbacks = {}) {
    const {
      onProgress,
      onComplete,
      onError
    } = callbacks

    const url = `${import.meta.env.VITE_WS_URL}/api/v1${this.baseUrl}/ws/${taskId}`

    wsManager.connect(url, {
      onMessage: (data) => {
        switch (data.type) {
          case 'progress':
            onProgress?.(data.progress, data.speed, data.message)
            break
          case 'complete':
            onComplete?.(data.file)
            wsManager.disconnect(url)
            break
          case 'error':
            onError?.(data.message)
            break
        }
      },
      onError: (error) => {
        onError?.('WebSocket error')
      }
    })

    return () => wsManager.disconnect(url)
  }

  // Extract video ID from URL
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
      /(?:youtube\.com\/v\/)([^?]+)/,
      /(?:youtube\.com\/live\/)([^?]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  // Detect platform
  detectPlatform(url) {
    const platforms = [
      { name: 'YouTube', pattern: /(youtube\.com|youtu\.be)/ },
      { name: 'Vimeo', pattern: /vimeo\.com/ },
      { name: 'Dailymotion', pattern: /dailymotion\.com/ },
      { name: 'SoundCloud', pattern: /soundcloud\.com/ },
      { name: 'Facebook', pattern: /facebook\.com/ },
      { name: 'Instagram', pattern: /instagram\.com/ },
      { name: 'Twitter', pattern: /twitter\.com/ },
      { name: 'TikTok', pattern: /tiktok\.com/ }
    ]

    for (const platform of platforms) {
      if (platform.pattern.test(url)) {
        return platform.name
      }
    }

    return 'Unknown'
  }

  // Check if URL is playlist
  isPlaylist(url) {
    return /(playlist|list=|&list=)/i.test(url)
  }

  // Get task list
  getTasks() {
    return Array.from(this.tasks.values())
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // Format duration
  formatDuration(seconds) {
    if (!seconds) return '00:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// Create singleton instance
export const downloadService = new DownloadService()

export default downloadService