import { REGEX } from './constants'

// ===== String Validators =====

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  if (!email) return false
  return REGEX.EMAIL.test(email)
}

/**
 * Validate password strength
 */
export const isStrongPassword = (password) => {
  if (!password) return false
  return REGEX.PASSWORD.test(password)
}

/**
 * Validate password match
 */
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword
}

/**
 * Validate URL
 */
export const isValidUrl = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return REGEX.URL.test(url)
  }
}

/**
 * Validate YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url) return false
  return REGEX.YOUTUBE_URL.test(url)
}

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
  if (!phone) return false
  return REGEX.PHONE.test(phone)
}

/**
 * Validate username
 */
export const isValidUsername = (username) => {
  if (!username) return false
  return REGEX.USERNAME.test(username)
}

/**
 * Validate alphanumeric
 */
export const isAlphanumeric = (str) => {
  if (!str) return false
  return REGEX.ALPHANUMERIC.test(str)
}

/**
 * Validate numeric
 */
export const isNumeric = (str) => {
  if (!str) return false
  return REGEX.NUMERIC.test(str)
}

/**
 * Validate hex color
 */
export const isValidHexColor = (color) => {
  if (!color) return false
  return REGEX.HEX_COLOR.test(color)
}

// ===== Number Validators =====

/**
 * Check if number is within range
 */
export const isInRange = (num, min, max) => {
  if (typeof num !== 'number') return false
  return num >= min && num <= max
}

/**
 * Check if number is positive
 */
export const isPositive = (num) => {
  return typeof num === 'number' && num > 0
}

/**
 * Check if number is negative
 */
export const isNegative = (num) => {
  return typeof num === 'number' && num < 0
}

/**
 * Check if number is integer
 */
export const isInteger = (num) => {
  return Number.isInteger(num)
}

/**
 * Check if number is float
 */
export const isFloat = (num) => {
  return typeof num === 'number' && !Number.isInteger(num)
}

// ===== Date Validators =====

/**
 * Check if date is valid
 */
export const isValidDate = (date) => {
  const d = new Date(date)
  return d instanceof Date && !isNaN(d)
}

/**
 * Check if date is in the past
 */
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false
  return new Date(date) < new Date()
}

/**
 * Check if date is in the future
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false
  return new Date(date) > new Date()
}

/**
 * Check if date is today
 */
export const isToday = (date) => {
  if (!isValidDate(date)) return false
  const today = new Date()
  const check = new Date(date)
  return check.toDateString() === today.toDateString()
}

/**
 * Check if date is within range
 */
export const isDateInRange = (date, start, end) => {
  if (!isValidDate(date)) return false
  const d = new Date(date)
  const s = new Date(start)
  const e = new Date(end)
  return d >= s && d <= e
}

// ===== File Validators =====

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
  if (!file) return false
  
  const extension = file.name.split('.').pop().toLowerCase()
  const mimeType = file.type
  
  return allowedTypes.some(type => 
    extension === type || mimeType.includes(type)
  )
}

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSize) => {
  if (!file) return false
  return file.size <= maxSize
}

/**
 * Validate image dimensions
 */
export const isValidImageDimensions = (file, minWidth, minHeight, maxWidth, maxHeight) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(
        img.width >= minWidth &&
        img.height >= minHeight &&
        img.width <= maxWidth &&
        img.height <= maxHeight
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Validate video duration
 */
export const isValidVideoDuration = (file, minDuration, maxDuration) => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(
        video.duration >= minDuration &&
        video.duration <= maxDuration
      )
    }
    video.src = URL.createObjectURL(file)
  })
}

// ===== Object Validators =====

/**
 * Check if object has required fields
 */
export const hasRequiredFields = (obj, required) => {
  return required.every(field => {
    const value = obj[field]
    return value !== undefined && value !== null && value !== ''
  })
}

/**
 * Validate object against schema
 */
export const validateSchema = (obj, schema) => {
  const errors = {}
  
  Object.keys(schema).forEach(field => {
    const rules = schema[field]
    const value = obj[field]
    
    if (rules.required && isEmpty(value)) {
      errors[field] = `${field} is required`
    }
    
    if (value) {
      if (rules.type && typeof value !== rules.type) {
        errors[field] = `${field} must be of type ${rules.type}`
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be at most ${rules.maxLength} characters`
      }
      
      if (rules.min && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`
      }
      
      if (rules.max && value > rules.max) {
        errors[field] = `${field} must be at most ${rules.max}`
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `${field} is invalid`
      }
      
      if (rules.validate) {
        const customError = rules.validate(value)
        if (customError) {
          errors[field] = customError
        }
      }
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// ===== Array Validators =====

/**
 * Check if array has duplicates
 */
export const hasDuplicates = (array) => {
  return new Set(array).size !== array.length
}

/**
 * Check if all array elements are unique
 */
export const isUnique = (array) => {
  return !hasDuplicates(array)
}

/**
 * Check if array contains value
 */
export const contains = (array, value) => {
  return array.includes(value)
}

// ===== Credit Card Validators =====

/**
 * Validate credit card number (Luhn algorithm)
 */
export const isValidCreditCard = (number) => {
  const cleaned = number.replace(/\D/g, '')
  
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10)
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

/**
 * Get credit card type
 */
export const getCreditCardType = (number) => {
  const cleaned = number.replace(/\D/g, '')
  
  if (/^4/.test(cleaned)) return 'Visa'
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard'
  if (/^3[47]/.test(cleaned)) return 'American Express'
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover'
  
  return 'Unknown'
}

// ===== IBAN Validator =====

/**
 * Validate IBAN
 */
export const isValidIBAN = (iban) => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  
  // Basic format check
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(cleaned)) {
    return false
  }
  
  // Move first 4 characters to end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  
  // Convert letters to numbers (A=10, B=11, etc.)
  const numeric = rearranged.split('').map(char => {
    const code = char.charCodeAt(0)
    return code >= 65 ? (code - 55).toString() : char
  }).join('')
  
  // Modulo 97 check
  let remainder = numeric
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9)
    remainder = (parseInt(block, 10) % 97) + remainder.slice(block.length)
  }
  
  return parseInt(remainder, 10) % 97 === 1
}