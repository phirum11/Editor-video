import { apiClient, handleResponse, handleError, uploadFile, downloadFile } from './api'

class VideoService {
  constructor() {
    this.baseUrl = '/video'
  }

  // Upload video
  async uploadVideo(file, onProgress) {
    try {
      const response = await uploadFile(`${this.baseUrl}/upload`, file, onProgress)
      return {
        success: true,
        videoId: response.video_id,
        filename: response.filename,
        size: response.size
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload video'
      }
    }
  }

  // Get video info
  async getVideoInfo(videoId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/info/${videoId}`)
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

  // Process video
  async processVideo(videoId, operations) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/process/${videoId}`, {
        operations
      })
      const data = handleResponse(response)
      return {
        success: true,
        taskId: data.task_id,
        status: data.status
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to start processing'
      }
    }
  }

  // Get task status
  async getTaskStatus(taskId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/status/${taskId}`)
      const data = handleResponse(response)
      return {
        success: true,
        status: data.status,
        progress: data.progress,
        message: data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get task status'
      }
    }
  }

  // Download processed video
  async downloadVideo(taskId, filename) {
    try {
      await downloadFile(`${this.baseUrl}/download/${taskId}`, filename || `video_${taskId}.mp4`)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to download video'
      }
    }
  }

  // Cancel processing
  async cancelTask(taskId) {
    try {
      await apiClient.post(`${this.baseUrl}/cancel/${taskId}`)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel task'
      }
    }
  }

  // Trim video
  async trimVideo(videoId, start, end) {
    return this.processVideo(videoId, [
      { type: 'trim', params: { start, end } }
    ])
  }

  // Resize video
  async resizeVideo(videoId, width, height) {
    return this.processVideo(videoId, [
      { type: 'resize', params: { width, height } }
    ])
  }

  // Change video speed
  async changeSpeed(videoId, factor) {
    return this.processVideo(videoId, [
      { type: 'speed', params: { factor } }
    ])
  }

  // Rotate video
  async rotateVideo(videoId, angle) {
    return this.processVideo(videoId, [
      { type: 'rotate', params: { angle } }
    ])
  }

  // Adjust volume
  async adjustVolume(videoId, factor) {
    return this.processVideo(videoId, [
      { type: 'volume', params: { factor } }
    ])
  }

  // Add watermark
  async addWatermark(videoId, text, position = 'bottom-right', opacity = 0.5) {
    return this.processVideo(videoId, [
      { type: 'watermark', params: { text, position, opacity } }
    ])
  }

  // Extract audio
  async extractAudio(videoId, format = 'mp3', quality = '192') {
    try {
      const response = await apiClient.post(`${this.baseUrl}/extract-audio/${videoId}`, {
        format,
        quality
      })
      const data = handleResponse(response)
      return {
        success: true,
        taskId: data.task_id
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to extract audio'
      }
    }
  }

  // Generate subtitles
  async generateSubtitles(videoId, language = 'auto', model = 'base') {
    try {
      const response = await apiClient.post(`${this.baseUrl}/generate-subtitles/${videoId}`, {
        language,
        model
      })
      const data = handleResponse(response)
      return {
        success: true,
        taskId: data.task_id
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to generate subtitles'
      }
    }
  }

  // Burn subtitles
  async burnSubtitles(videoId, segments, options = {}) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/burn-subtitles/${videoId}`, {
        segments,
        ...options
      })
      const data = handleResponse(response)
      return {
        success: true,
        taskId: data.task_id
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to burn subtitles'
      }
    }
  }

  // Get video formats
  async getVideoFormats(videoId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/formats/${videoId}`)
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

  // Get video thumbnail
  async getVideoThumbnail(videoId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/thumbnail/${videoId}`, {
        responseType: 'blob'
      })
      const url = URL.createObjectURL(response.data)
      return {
        success: true,
        url
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get thumbnail'
      }
    }
  }

  // Merge videos
  async mergeVideos(videoIds, options = {}) {
    try {
      const response = await apiClient.post(`${this.baseUrl}/merge`, {
        video_ids: videoIds,
        ...options
      })
      const data = handleResponse(response)
      return {
        success: true,
        taskId: data.task_id
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to merge videos'
      }
    }
  }

  // Add effects
  async addEffects(videoId, effects) {
    return this.processVideo(videoId, [
      { type: 'effects', params: { effects } }
    ])
  }

  // Stabilize video
  async stabilizeVideo(videoId) {
    return this.processVideo(videoId, [
      { type: 'stabilize', params: {} }
    ])
  }

  // Denoise video
  async denoiseVideo(videoId) {
    return this.processVideo(videoId, [
      { type: 'denoise', params: {} }
    ])
  }
}

// Create singleton instance
export const videoService = new VideoService()

export default videoService