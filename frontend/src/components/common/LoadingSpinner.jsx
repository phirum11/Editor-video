import React from 'react'

const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  text = 'Loading...',
  fullScreen = false,
  overlay = false,
  className = ''
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colors = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    purple: 'border-purple-600',
    pink: 'border-pink-600',
    gray: 'border-gray-600',
    white: 'border-white'
  }

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className={`mt-4 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-40">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Skeleton loader component
export const SkeletonLoader = ({ type = 'text', count = 1, className = '' }) => {
  const skeletons = {
    text: 'h-4 bg-gray-200 dark:bg-gray-700 rounded w-full',
    title: 'h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4',
    avatar: 'w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full',
    image: 'w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg',
    card: 'h-32 bg-gray-200 dark:bg-gray-700 rounded-lg',
    button: 'h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24'
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${skeletons[type] || skeletons.text} animate-pulse`}
        />
      ))}
    </div>
  )
}

// Progress loader
export const ProgressLoader = ({ progress = 0, text = 'Loading...', className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:text-blue-200 dark:bg-blue-900">
              Loading
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
              {progress}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-900">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
          />
        </div>
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
        )}
      </div>
    </div>
  )
}

// Dots loader
export const DotsLoader = ({ className = '' }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
    </div>
  )
}

// Pulse loader
export const PulseLoader = ({ className = '' }) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-75" />
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-150" />
    </div>
  )
}

export default LoadingSpinner