import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    // Add token to headers if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, config)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.data)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message)
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await apiClient.post('/auth/refresh', {
            refreshToken
          })
          
          const { token } = response.data
          localStorage.setItem('token', token)
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden')
      // Could redirect to unauthorized page
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found')
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error')
    }
    
    return Promise.reject(error)
  }
)

// WebSocket connection manager
export class WebSocketManager {
  constructor() {
    this.connections = new Map()
    this.reconnectAttempts = new Map()
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
  }

  connect(url, options = {}) {
    const {
      onOpen,
      onMessage,
      onClose,
      onError,
      protocols = []
    } = options

    const ws = new WebSocket(url, protocols)
    
    ws.onopen = (event) => {
      console.log(`WebSocket connected: ${url}`)
      this.reconnectAttempts.delete(url)
      onOpen?.(event)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage?.(data)
      } catch (error) {
        onMessage?.(event.data)
      }
    }

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected: ${url}`)
      
      // Attempt to reconnect
      const attempts = this.reconnectAttempts.get(url) || 0
      if (attempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          console.log(`Reconnecting to ${url} (attempt ${attempts + 1})`)
          this.reconnectAttempts.set(url, attempts + 1)
          this.connect(url, options)
        }, this.reconnectDelay * Math.pow(2, attempts))
      }
      
      onClose?.(event)
    }

    ws.onerror = (event) => {
      console.error(`WebSocket error: ${url}`, event)
      onError?.(event)
    }

    this.connections.set(url, ws)
    return ws
  }

  disconnect(url) {
    const ws = this.connections.get(url)
    if (ws) {
      ws.close()
      this.connections.delete(url)
      this.reconnectAttempts.delete(url)
    }
  }

  disconnectAll() {
    this.connections.forEach((ws) => ws.close())
    this.connections.clear()
    this.reconnectAttempts.clear()
  }

  send(url, data) {
    const ws = this.connections.get(url)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data))
      return true
    }
    return false
  }
}

// Create WebSocket manager instance
export const wsManager = new WebSocketManager()

// API error class
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Handle API response
export const handleResponse = (response) => {
  return response.data
}

// Handle API error
export const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    throw new ApiError(
      error.response.data?.message || 'An error occurred',
      error.response.status,
      error.response.data
    )
  } else if (error.request) {
    // Request made but no response
    throw new ApiError('Network error - no response from server', 0)
  } else {
    // Request setup error
    throw new ApiError(error.message, 0)
  }
}

// Upload file with progress
export const uploadFile = async (url, file, onProgress, options = {}) => {
  const formData = new FormData()
  formData.append('file', file)
  
  if (options.data) {
    Object.keys(options.data).forEach(key => {
      formData.append(key, options.data[key])
    })
  }

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress?.(percentCompleted, progressEvent)
    },
    ...options
  }

  return apiClient.post(url, formData, config).then(handleResponse)
}

// Download file with progress
export const downloadFile = async (url, filename, onProgress) => {
  const response = await apiClient.get(url, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onProgress?.(percentCompleted, progressEvent)
    }
  })

  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)

  return response.data
}

// Retry mechanism for failed requests
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}

// Cancel token for requests
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

// Export default
export default {
  apiClient,
  wsManager,
  ApiError,
  handleResponse,
  handleError,
  uploadFile,
  downloadFile,
  withRetry,
  createCancelToken
}