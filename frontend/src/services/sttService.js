import { apiClient, handleResponse, handleError, uploadFile } from './api'
import { wsManager } from './api'

class STTService {
  constructor() {
    this.baseUrl = '/stt'
    this.tasks = new Map()
  }

  // Transcribe audio
  async transcribe(file, options = {}) {
    try {
      const {
        language = 'auto',
        model = 'base',
        task = 'transcribe',
        wordTimestamps = false,
        vadFilter = true,
        onProgress
      } = options

      const response = await uploadFile(`${this.baseUrl}/transcribe`, file, onProgress, {
        data: {
          language,
          model,
          task,
          word_timestamps: wordTimestamps,
          vad_filter: vadFilter
        }
      })

      const { task_id, status, message } = response
      
      this.tasks.set(task_id, {
        id: task_id,
        status,
        message,
        progress: 0
      })

      return {
        success: true,
        taskId: task_id
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to start transcription'
      }
    }
  }

  // Get task status
  async getStatus(taskId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/status/${taskId}`)
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
        error: error.response?.data?.error || 'Failed to get status'
      }
    }
  }

  // Get transcription result
  async getResult(taskId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/result/${taskId}`)
      const data = handleResponse(response)
      
      this.tasks.delete(taskId)

      return {
        success: true,
        ...data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get result'
      }
    }
  }

  // Cancel transcription
  async cancel(taskId) {
    try {
      await apiClient.post(`${this.baseUrl}/cancel/${taskId}`)
      this.tasks.delete(taskId)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel task'
      }
    }
  }

  // Connect to WebSocket for real-time updates
  connectWebSocket(taskId, callbacks = {}) {
    const {
      onProgress,
      onComplete,
      onError,
      onSegment
    } = callbacks

    const url = `${import.meta.env.VITE_WS_URL}/api/v1${this.baseUrl}/ws/${taskId}`

    wsManager.connect(url, {
      onMessage: (data) => {
        switch (data.type) {
          case 'progress':
            onProgress?.(data.progress, data.message)
            break
          case 'segment':
            onSegment?.(data.segment)
            break
          case 'complete':
            onComplete?.(data.result)
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

  // Get available models
  async getModels() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/models`)
      const data = handleResponse(response)
      return {
        success: true,
        models: data.models
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get models'
      }
    }
  }

  // Get supported languages
  async getLanguages() {
    try {
      const response = await apiClient.get(`${this.baseUrl}/languages`)
      const data = handleResponse(response)
      return {
        success: true,
        languages: data.languages
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get languages'
      }
    }
  }

  // Get task list
  getTasks() {
    return Array.from(this.tasks.values())
  }

  // Clean up old tasks
  async cleanup(hours = 24) {
    try {
      await apiClient.delete(`${this.baseUrl}/cleanup/${hours}`)
      this.tasks.clear()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cleanup'
      }
    }
  }

  // Export transcription
  async exportTranscription(taskId, format = 'txt') {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export/${taskId}/${format}`, {
        responseType: 'blob'
      })
      
      const contentDisposition = response.headers['content-disposition']
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]
        : `transcription_${taskId}.${format}`
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to export'
      }
    }
  }
}

export const sttService = new STTService()

export default sttService