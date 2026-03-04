import React from 'react'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader,
  Play,
  Pause,
  Download,
  Upload,
  Check,
  X,
  Minus,
  Plus,
  Star,
  Zap,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Wifi,
  WifiOff
} from 'lucide-react'

const StatusBadge = ({
  status = 'info',
  text,
  size = 'md',
  showIcon = true,
  animated = false,
  pulse = false,
  className = ''
}) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const statuses = {
    // Success states
    success: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: Check,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    
    // Error states
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400'
    },
    failed: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: X,
      iconColor: 'text-red-600 dark:text-red-400'
    },
    
    // Warning states
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: AlertCircle,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    
    // Info states
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: AlertCircle,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    
    // Processing states
    processing: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-800 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      icon: Loader,
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    loading: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-800 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      icon: Loader,
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    
    // Paused states
    paused: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: Pause,
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    
    // Active states
    active: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: Play,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    online: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: Wifi,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    
    // Offline states
    offline: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: WifiOff,
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    
    // Download/Upload states
    downloading: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Download,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    uploading: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Upload,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    
    // Security states
    secured: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: Shield,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    locked: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: Lock,
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    unlocked: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: Unlock,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    
    // Visibility states
    visible: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Eye,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    hidden: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: EyeOff,
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    
    // Other states
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: Clock,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    queued: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: Clock,
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    canceled: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: X,
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    draft: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      icon: Minus,
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    published: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: Check,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    featured: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: Star,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    premium: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-800 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      icon: Zap,
      iconColor: 'text-purple-600 dark:text-purple-400'
    }
  }

  const currentStatus = statuses[status] || statuses.info
  const Icon = currentStatus.icon

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-full border ${sizes[size]} ${
        currentStatus.bg
      } ${currentStatus.text} ${currentStatus.border} ${
        animated ? 'animate-pulse' : ''
      } ${pulse ? 'animate-pulse-slow' : ''} ${className}`}
    >
      {showIcon && (
        <Icon
          className={`w-4 h-4 ${currentStatus.iconColor} ${
            status === 'processing' || status === 'loading' ? 'animate-spin' : ''
          }`}
        />
      )}
      <span>{text || status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  )
}

// Status group component
export const StatusGroup = ({ statuses = [], className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statuses.map((status, index) => (
        <StatusBadge key={index} {...status} />
      ))}
    </div>
  )
}

// Status indicator dot
export const StatusDot = ({ status = 'info', size = 'md', pulse = false, className = '' }) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    processing: 'bg-purple-500',
    active: 'bg-green-500',
    offline: 'bg-gray-500',
    online: 'bg-green-500'
  }

  return (
    <span
      className={`inline-block ${sizes[size]} rounded-full ${
        colors[status] || colors.info
      } ${pulse ? 'animate-pulse' : ''} ${className}`}
    />
  )
}

// Status bar component
export const StatusBar = ({ value = 0, max = 100, color = 'blue', label, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600'
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-gray-900 dark:text-white font-medium">{value}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default StatusBadge