import { TIME_UNITS, FILE_SIZE_UNITS } from './constants'

// ===== Object Helpers =====

/**
 * Deep clone an object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const cloned = {}
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key])
    })
    return cloned
  }
}

/**
 * Deep merge two objects
 */
export const deepMerge = (target, source) => {
  const output = { ...target }
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  
  return output
}

/**
 * Check if value is an object
 */
export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}

/**
 * Pick specific keys from object
 */
export const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj && obj.hasOwnProperty(key)) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}

/**
 * Omit specific keys from object
 */
export const omit = (obj, keys) => {
  return Object.keys(obj)
    .filter(key => !keys.includes(key))
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})
}

// ===== Array Helpers =====

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * Chunk array into smaller arrays
 */
export const chunk = (array, size) => {
  return array.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size)
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = []
    }
    chunks[chunkIndex].push(item)
    return chunks
  }, [])
}

/**
 * Remove duplicates from array
 */
export const unique = (array) => {
  return [...new Set(array)]
}

/**
 * Shuffle array
 */
export const shuffle = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key]
    const bVal = typeof key === 'function' ? key(b) : b[key]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

// ===== String Helpers =====

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Capitalize each word
 */
export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.split(' ').map(capitalize).join(' ')
}

/**
 * Truncate string with ellipsis
 */
export const truncate = (str, length, ending = '...') => {
  if (!str || str.length <= length) return str
  return str.substring(0, length - ending.length) + ending
}

/**
 * Slugify string
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate random string
 */
export const randomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
}

// ===== Number Helpers =====

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Format percentage
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(decimals)}%`
}

/**
 * Clamp number between min and max
 */
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

/**
 * Generate random number between min and max
 */
export const random = (min, max) => {
  return Math.random() * (max - min) + min
}

/**
 * Generate random integer between min and max
 */
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ===== Date Helpers =====

/**
 * Format date
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return ''
  
  const d = new Date(date)
  const options = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }
  
  return d.toLocaleDateString(undefined, options[format])
}

/**
 * Format time
 */
export const formatTime = (date, format = 'short') => {
  if (!date) return ''
  
  const d = new Date(date)
  const options = {
    short: { hour: 'numeric', minute: '2-digit' },
    medium: { hour: 'numeric', minute: '2-digit', second: '2-digit' },
    long: { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }
  }
  
  return d.toLocaleTimeString(undefined, options[format])
}

/**
 * Format datetime
 */
export const formatDateTime = (date, format = 'medium') => {
  if (!date) return ''
  return `${formatDate(date, format)} ${formatTime(date, 'short')}`
}

/**
 * Get time ago
 */
export const timeAgo = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diff = now - past
  
  const seconds = Math.floor(diff / TIME_UNITS.SECOND)
  const minutes = Math.floor(diff / TIME_UNITS.MINUTE)
  const hours = Math.floor(diff / TIME_UNITS.HOUR)
  const days = Math.floor(diff / TIME_UNITS.DAY)
  const weeks = Math.floor(diff / TIME_UNITS.WEEK)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`
  return `${years} year${years === 1 ? '' : 's'} ago`
}

/**
 * Get time remaining
 */
export const timeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now
  
  if (diff < 0) return 'Expired'
  
  const days = Math.floor(diff / TIME_UNITS.DAY)
  const hours = Math.floor((diff % TIME_UNITS.DAY) / TIME_UNITS.HOUR)
  const minutes = Math.floor((diff % TIME_UNITS.HOUR) / TIME_UNITS.MINUTE)
  
  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  if (minutes > 0) return `${minutes}m remaining`
  return 'Less than a minute'
}

// ===== Storage Helpers =====

/**
 * Set item in localStorage with expiration
 */
export const setStorageItem = (key, value, ttl = null) => {
  const item = {
    value,
    timestamp: Date.now(),
    ttl
  }
  localStorage.setItem(key, JSON.stringify(item))
}

/**
 * Get item from localStorage with expiration check
 */
export const getStorageItem = (key) => {
  const item = localStorage.getItem(key)
  if (!item) return null
  
  try {
    const { value, timestamp, ttl } = JSON.parse(item)
    
    if (ttl && Date.now() - timestamp > ttl) {
      localStorage.removeItem(key)
      return null
    }
    
    return value
  } catch {
    return item
  }
}

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key) => {
  localStorage.removeItem(key)
}

/**
 * Clear all localStorage items
 */
export const clearStorage = () => {
  localStorage.clear()
}

// ===== URL Helpers =====

/**
 * Get query parameters from URL
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search)
  const result = {}
  
  for (const [key, value] of params.entries()) {
    result[key] = value
  }
  
  return result
}

/**
 * Build URL with query parameters
 */
export const buildUrl = (base, params) => {
  const url = new URL(base, window.location.origin)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value)
    }
  })
  
  return url.toString()
}

// ===== Color Helpers =====

/**
 * Convert hex to rgb
 */
export const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const normalized = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Convert rgb to hex
 */
export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Lighten color by percentage
 */
export const lightenColor = (color, percent) => {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  
  const lighten = (value) => Math.min(255, Math.floor(value + (255 - value) * (percent / 100)))
  
  return rgbToHex(
    lighten(rgb.r),
    lighten(rgb.g),
    lighten(rgb.b)
  )
}

/**
 * Darken color by percentage
 */
export const darkenColor = (color, percent) => {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  
  const darken = (value) => Math.max(0, Math.floor(value * (1 - percent / 100)))
  
  return rgbToHex(
    darken(rgb.r),
    darken(rgb.g),
    darken(rgb.b)
  )
}

// ===== Performance Helpers =====

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Memoize function
 */
export const memoize = (func) => {
  const cache = {}
  return (...args) => {
    const key = JSON.stringify(args)
    if (cache[key] === undefined) {
      cache[key] = func(...args)
    }
    return cache[key]
  }
}

// ===== Promise Helpers =====

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry promise with exponential backoff
 */
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await sleep(delay * Math.pow(2, i))
      }
    }
  }
  
  throw lastError
}
export const timeout = (promise, ms) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), ms)
  })
  
  return Promise.race([promise, timeoutPromise])
}