import React, { useState, useEffect, createContext, useContext } from 'react'
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  X,
  Bell,
  BellRing
} from 'lucide-react'

// Toast Context
const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, ...toast }])

    // Auto dismiss
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Toast Component
const Toast = ({
  id,
  title,
  message,
  type = 'info',
  position = 'bottom-right',
  onClose,
  duration = 5000,
  showIcon = true,
  showClose = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    default: Bell
  }

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300',
    default: 'bg-gray-50 dark:bg-gray-800 border-gray-500 text-gray-800 dark:text-gray-300'
  }

  const Icon = icons[type] || icons.default

  // Position classes
  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  return (
    <div
      className={`
        flex items-start space-x-3 p-4 rounded-lg border-l-4 shadow-lg
        transform transition-all duration-300
        ${colors[type] || colors.default}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${positions[position]}
        ${className}
      `}
      role="alert"
    >
      {showIcon && (
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}

      <div className="flex-1">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <p className="text-sm opacity-90">{message}</p>
      </div>

      {showClose && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Toast Creator functions
export const toast = {
  success: (message, options = {}) => {
    useToast().addToast({ type: 'success', message, ...options })
  },
  error: (message, options = {}) => {
    useToast().addToast({ type: 'error', message, ...options })
  },
  warning: (message, options = {}) => {
    useToast().addToast({ type: 'warning', message, ...options })
  },
  info: (message, options = {}) => {
    useToast().addToast({ type: 'info', message, ...options })
  },
  custom: (options) => {
    useToast().addToast(options)
  }
}

// Toast with Action
export const ActionToast = ({
  action,
  onAction,
  ...props
}) => {
  return (
    <Toast
      {...props}
      className="pr-2"
    >
      <button
        onClick={onAction}
        className="ml-auto px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition"
      >
        {action}
      </button>
    </Toast>
  )
}

// Progress Toast
export const ProgressToast = ({
  progress = 0,
  ...props
}) => {
  return (
    <Toast {...props}>
      <div className="mt-2 w-full h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Toast>
  )
}

export default Toast