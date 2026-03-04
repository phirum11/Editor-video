import { useState, useCallback, createContext, useContext } from 'react'

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Toast positions
export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  TOP_CENTER: 'top-center',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_CENTER: 'bottom-center'
}

// Create toast context
const ToastContext = createContext()

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  // Add toast
  const addToast = useCallback(({ 
    message, 
    type = TOAST_TYPES.INFO, 
    duration = 5000,
    position = TOAST_POSITIONS.TOP_RIGHT,
    title,
    icon,
    action,
    onAction,
    onClose
  }) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    const newToast = {
      id,
      message,
      type,
      duration,
      position,
      title,
      icon,
      action,
      onAction,
      onClose,
      createdAt: Date.now()
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  // Remove toast
  const removeToast = useCallback((id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      if (toast?.onClose) {
        toast.onClose()
      }
      return prev.filter(t => t.id !== id)
    })
  }, [])

  // Update toast
  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ))
  }, [])

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Helper methods
  const success = useCallback((message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.SUCCESS, ...options })
  }, [addToast])

  const error = useCallback((message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.ERROR, ...options })
  }, [addToast])

  const warning = useCallback((message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.WARNING, ...options })
  }, [addToast])

  const info = useCallback((message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.INFO, ...options })
  }, [addToast])

  const promise = useCallback(async (promise, {
    loading = 'Loading...',
    success: successMessage = 'Success!',
    error: errorMessage = 'Error!'
  }) => {
    const id = addToast({ message: loading, type: TOAST_TYPES.INFO, duration: 0 })

    try {
      const result = await promise
      updateToast(id, { 
        message: successMessage, 
        type: TOAST_TYPES.SUCCESS,
        duration: 5000
      })
      return result
    } catch (err) {
      updateToast(id, { 
        message: errorMessage, 
        type: TOAST_TYPES.ERROR,
        duration: 5000
      })
      throw err
    }
  }, [addToast, updateToast])

  return (
    <ToastContext.Provider value={{
      toasts,
      addToast,
      removeToast,
      updateToast,
      clearToasts,
      success,
      error,
      warning,
      info,
      promise
    }}>
      {children}
    </ToastContext.Provider>
  )
}

// useToast hook
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// useToastAnimation
export const useToastAnimation = (toast) => {
  const [animation, setAnimation] = useState('enter')

  useEffect(() => {
    setAnimation('enter')
    
    const enterTimer = setTimeout(() => {
      setAnimation('enter-active')
    }, 10)

    const exitTimer = setTimeout(() => {
      if (toast.duration > 0) {
        setAnimation('exit')
      }
    }, toast.duration - 300)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
    }
  }, [toast.duration])

  return animation
}

// useToastPosition
export const useToastPosition = (position = TOAST_POSITIONS.TOP_RIGHT) => {
  const [toasts, setToasts] = useState([])
  const { toasts: allToasts } = useToast()

  useEffect(() => {
    const filtered = allToasts.filter(t => t.position === position)
    setToasts(filtered)
  }, [allToasts, position])

  return toasts
}

// useToastCounter
export const useToastCounter = () => {
  const { toasts } = useToast()
  return {
    total: toasts.length,
    success: toasts.filter(t => t.type === TOAST_TYPES.SUCCESS).length,
    error: toasts.filter(t => t.type === TOAST_TYPES.ERROR).length,
    warning: toasts.filter(t => t.type === TOAST_TYPES.WARNING).length,
    info: toasts.filter(t => t.type === TOAST_TYPES.INFO).length
  }
}