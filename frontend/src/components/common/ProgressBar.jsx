import React from 'react'

const ProgressBar = ({
  progress = 0,
  total = 100,
  status = '',
  showPercentage = true,
  showStatus = true,
  size = 'md',
  color = 'blue',
  animated = true,
  striped = false,
  label,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (progress / total) * 100))

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  }

  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600',
    indigo: 'bg-indigo-600',
    gray: 'bg-gray-600'
  }

  const getStatusColor = () => {
    if (percentage === 100) return 'text-green-600'
    if (percentage > 0) return 'text-blue-600'
    return 'text-gray-600'
  }

  const getStatusIcon = () => {
    if (percentage === 100) return '✓'
    if (percentage > 0) return '⋯'
    return '○'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className={`w-full ${sizes[size]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-300 ease-out
            ${animated && percentage < 100 ? 'animate-pulse' : ''}
            ${striped ? 'bg-stripes' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status message */}
      {showStatus && status && (
        <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
          <span className="font-mono">{getStatusIcon()}</span>
          <span>{status}</span>
        </div>
      )}

      {/* Progress details */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{progress.toLocaleString()} / {total.toLocaleString()}</span>
        {percentage > 0 && percentage < 100 && (
          <span>ETA: {calculateETA(progress, total)}</span>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate ETA
const calculateETA = (progress, total) => {
  const remaining = total - progress
  const seconds = Math.round(remaining / 10) // Assuming 10 units per second
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

// Multi-progress bar component
export const MultiProgressBar = ({ items = [], className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {item.value}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Circular progress bar
export const CircularProgressBar = ({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showPercentage = true,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar