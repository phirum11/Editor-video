import { apiClient, handleResponse, handleError, downloadFile } from './api'
import { wsManager } from './api'

class TTSService {
  constructor() {
    this.baseUrl = '/tts'
    this.tasks = new Map()
    this.voices = null
  }

  // Generate speech
  async generateSpeech(text, options = {}) {
    try {
      const {
        voice = 'km-KH-SreymomNeural',
        speed = 1.0,
        pitch = 0,
        volume = 0
      } = options

      const response = await apiClient.post(`${this.baseUrl}/generate`, {
        text,
        voice,
        speed,
        pitch,
        volume
      })

      const { task_id, status, message } = response.data

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
        error: error.response?.data?.error || 'Failed to generate speech'
      }
    }
  }

  // Batch generate speech
  async batchGenerate(segments, options = {}) {
    try {
      const { speed = 1.0, workers = 4 } = options

      const response = await apiClient.post(`${this.baseUrl}/batch`, {
        segments,
        speed,
        workers
      })

      const { task_id, total_segments } = response.data

      this.tasks.set(task_id, {
        id: task_id,
        status: 'pending',
        total: total_segments,
        completed: 0,
        progress: 0
      })

      return {
        success: true,
        taskId: task_id,
        total: total_segments
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to start batch generation'
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

  // Get batch result
  async getBatchResult(taskId) {
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

  // Download audio
  async downloadAudio(taskId, filename) {
    try {
      await downloadFile(
        `${this.baseUrl}/download/${taskId}`,
        filename || `tts_${taskId}.mp3`
      )
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to download audio'
      }
    }
  }

  // List voices
  async listVoices(language = null) {
    try {
      const url = language
        ? `${this.baseUrl}/voices?language=${language}`
        : `${this.baseUrl}/voices`

      const response = await apiClient.get(url)
      const data = handleResponse(response)
      
      this.voices = data

      return {
        success: true,
        voices: data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to list voices'
      }
    }
  }

  // Get voice details
  async getVoice(voiceId) {
    try {
      const response = await apiClient.get(`${this.baseUrl}/voices/${voiceId}`)
      const data = handleResponse(response)
      return {
        success: true,
        voice: data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get voice details'
      }
    }
  }

  // Preview voice
  async previewVoice(voice, text = null) {
    try {
      const previewTexts = {
        km: 'សួស្តី! នេះជាការសាកល្បងសំឡេង',
        en: 'Hello! This is a voice preview.',
        zh: '你好！这是语音预览。',
        ja: 'こんにちは！これは音声プレビューです。',
        ko: '안녕하세요! 음성 미리보기입니다.'
      }

      const language = voice.language || 'en'
      const previewText = text || previewTexts[language] || previewTexts.en

      return this.generateSpeech(previewText, {
        voice: voice.id,
        speed: 1.0,
        pitch: 0,
        volume: 0
      })
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to preview voice'
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
        languages: data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get languages'
      }
    }
  }

  // Connect to WebSocket for batch progress
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
            onProgress?.(data.progress, data.completed, data.total)
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

  // Get cached voices
  getCachedVoices() {
    return this.voices
  }

  // Get task list
  getTasks() {
    return Array.from(this.tasks.values())
  }

  // Clean up temp files
  async cleanup(hours = 1) {
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
}

// Create singleton instance
export const ttsService = new TTSService()

export default ttsService