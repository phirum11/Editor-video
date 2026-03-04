import { FILE_TYPES, MIME_TYPES } from './constants'

// ===== File Type Detection =====

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return ''
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Get file name without extension
 */
export const getFileNameWithoutExtension = (filename) => {
  if (!filename) return ''
  return filename.replace(/\.[^/.]+$/, '')
}

/**
 * Check if file is video
 */
export const isVideoFile = (filename) => {
  const ext = getFileExtension(filename)
  return FILE_TYPES.VIDEO.includes(ext)
}

/**
 * Check if file is audio
 */
export const isAudioFile = (filename) => {
  const ext = getFileExtension(filename)
  return FILE_TYPES.AUDIO.includes(ext)
}

/**
 * Check if file is image
 */
export const isImageFile = (filename) => {
  const ext = getFileExtension(filename)
  return FILE_TYPES.IMAGE.includes(ext)
}

/**
 * Check if file is document
 */
export const isDocumentFile = (filename) => {
  const ext = getFileExtension(filename)
  return FILE_TYPES.DOCUMENT.includes(ext)
}

/**
 * Check if file is subtitle
 */
export const isSubtitleFile = (filename) => {
  const ext = getFileExtension(filename)
  return FILE_TYPES.SUBTITLE.includes(ext)
}

/**
 * Check if file is archive
 */
export const isArchiveFile = (filename) => {
  const ext = getFileExtension(filename)
  return FILE_TYPES.ARCHIVE.includes(ext)
}

/**
 * Get MIME type from extension
 */
export const getMimeType = (filename) => {
  const ext = getFileExtension(filename)
  return MIME_TYPES[ext] || 'application/octet-stream'
}

// ===== File Size =====

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Parse file size string to bytes
 */
export const parseFileSize = (sizeStr) => {
  const units = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  }
  
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB|TB)$/i)
  if (!match) return null
  
  const [, value, unit] = match
  return parseFloat(value) * units[unit.toUpperCase()]
}

// ===== File Operations =====

/**
 * Read file as data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Read file as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/**
 * Read file as array buffer
 */
export const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Download file from blob
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Download file from URL
 */
export const downloadFromUrl = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Create blob from data
 */
export const createBlob = (data, mimeType) => {
  return new Blob([data], { type: mimeType })
}

/**
 * Create object URL from blob
 */
export const createObjectUrl = (blob) => {
  return window.URL.createObjectURL(blob)
}

/**
 * Revoke object URL
 */
export const revokeObjectUrl = (url) => {
  window.URL.revokeObjectURL(url)
}

// ===== File Validation =====

/**
 * Validate file type against allowed types
 */
export const validateFileType = (file, allowedTypes) => {
  const ext = getFileExtension(file.name)
  return allowedTypes.includes(ext)
}

/**
 * Validate file size against max size
 */
export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize
}

/**
 * Validate file count
 */
export const validateFileCount = (files, maxCount) => {
  return files.length <= maxCount
}

/**
 * Get file validation errors
 */
export const getFileValidationErrors = (files, options = {}) => {
  const {
    allowedTypes = [],
    maxSize = Infinity,
    maxCount = Infinity,
    minCount = 0
  } = options
  
  const errors = []
  
  if (files.length < minCount) {
    errors.push(`Minimum ${minCount} file(s) required`)
  }
  
  if (files.length > maxCount) {
    errors.push(`Maximum ${maxCount} file(s) allowed`)
  }
  
  files.forEach(file => {
    if (allowedTypes.length > 0 && !validateFileType(file, allowedTypes)) {
      errors.push(`File type not allowed: ${file.name}`)
    }
    
    if (!validateFileSize(file, maxSize)) {
      errors.push(`File too large: ${file.name} (max ${formatFileSize(maxSize)})`)
    }
  })
  
  return errors
}

// ===== File Selection =====

/**
 * Open file picker
 */
export const openFilePicker = (options = {}) => {
  const {
    accept = '*/*',
    multiple = false,
    capture = null
  } = options
  
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    
    if (capture) {
      input.capture = capture
    }
    
    input.onchange = () => {
      const files = Array.from(input.files)
      resolve(multiple ? files : files[0])
    }
    
    input.click()
  })
}

/**
 * Open directory picker
 */
export const openDirectoryPicker = async () => {
  try {
    const directoryHandle = await window.showDirectoryPicker()
    return directoryHandle
  } catch (error) {
    console.error('Failed to open directory picker:', error)
    return null
  }
}

// ===== Image Processing =====

/**
 * Get image dimensions
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Resize image
 */
export const resizeImage = (file, maxWidth, maxHeight, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob((blob) => {
        resolve(blob)
      }, file.type, quality)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// ===== Audio Processing =====

/**
 * Get audio duration
 */
export const getAudioDuration = (file) => {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src)
      resolve(audio.duration)
    }
    audio.onerror = () => reject(new Error('Failed to load audio'))
    audio.src = URL.createObjectURL(file)
  })
}

// ===== Video Processing =====

/**
 * Get video dimensions and duration
 */
export const getVideoInfo = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      })
    }
    video.onerror = () => reject(new Error('Failed to load video'))
    video.src = URL.createObjectURL(file)
  })
}

/**
 * Extract video frame
 */
export const extractVideoFrame = (file, time = 0) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.currentTime = time
    video.muted = true
    
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src)
        resolve(blob)
      }, 'image/jpeg', 0.9)
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      reject(new Error('Failed to load video'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}