import React, { useState, useRef, useEffect } from 'react'

const Slider = ({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'horizontal',
  size = 'md',
  showValue = false,
  valuePrefix = '',
  valueSuffix = '',
  marks = [],
  disabled = false,
  className = '',
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const sliderRef = useRef(null)

  // Sizes
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  }

  const thumbSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Calculate percentage
  const percentage = ((localValue - min) / (max - min)) * 100

  // Handle mouse/touch interaction
  const handleStart = () => {
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleMove = (e) => {
    if (!isDragging || !sliderRef.current) return

    e.preventDefault()

    const rect = sliderRef.current.getBoundingClientRect()
    let clientX, clientY

    if (e.type === 'mousemove') {
      clientX = e.clientX
      clientY = e.clientY
    } else if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }

    let newValue
    if (orientation === 'horizontal') {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      newValue = (x / rect.width) * (max - min) + min
    } else {
      const y = Math.max(0, Math.min(rect.bottom - clientY, rect.height))
      newValue = (y / rect.height) * (max - min) + min
    }

    // Round to step
    newValue = Math.round(newValue / step) * step
    newValue = Math.max(min, Math.min(max, newValue))

    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  // Handle keyboard
  const handleKeyDown = (e) => {
    if (disabled) return

    let newValue = localValue
    const stepSize = e.shiftKey ? step * 10 : step

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault()
        newValue = Math.min(max, localValue + stepSize)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault()
        newValue = Math.max(min, localValue - stepSize)
        break
      case 'Home':
        e.preventDefault()
        newValue = min
        break
      case 'End':
        e.preventDefault()
        newValue = max
        break
      default:
        return
    }

    setLocalValue(newValue)
    onChange?.(newValue)
  }

  // Event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchmove', handleMove)
      window.addEventListener('touchend', handleEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging])

  // Orientation classes
  const orientationClasses = {
    horizontal: 'w-full',
    vertical: 'h-48'
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Value display */}
      {showValue && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {min}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {valuePrefix}{localValue}{valueSuffix}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {max}
          </span>
        </div>
      )}

      {/* Slider container */}
      <div
        ref={sliderRef}
        className={`
          relative ${orientationClasses[orientation]} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={localValue}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {/* Track */}
        <div
          className={`
            absolute bg-gray-200 dark:bg-gray-700 rounded-full
            ${orientation === 'horizontal' 
              ? 'w-full h-full' 
              : 'w-full h-full'
            }
            ${sizes[size]}
          `}
        />

        {/* Fill */}
        <div
          className={`
            absolute bg-blue-600 rounded-full
            ${orientation === 'horizontal'
              ? 'left-0'
              : 'bottom-0'
            }
            ${sizes[size]}
          `}
          style={
            orientation === 'horizontal'
              ? { width: `${percentage}%` }
              : { height: `${percentage}%` }
          }
        />

        {/* Thumb */}
        <div
          className={`
            absolute bg-white border-2 border-blue-600 rounded-full shadow-lg
            transform -translate-x-1/2 -translate-y-1/2
            ${thumbSizes[size]}
            ${isDragging ? 'scale-110' : ''}
            transition-transform
          `}
          style={
            orientation === 'horizontal'
              ? { left: `${percentage}%`, top: '50%' }
              : { left: '50%', bottom: `${percentage}%` }
          }
        />

        {/* Marks */}
        {marks.map((mark, index) => {
          const markPercentage = ((mark.value - min) / (max - min)) * 100
          return (
            <div
              key={index}
              className="absolute"
              style={
                orientation === 'horizontal'
                  ? { left: `${markPercentage}%`, top: '50%' }
                  : { left: '50%', bottom: `${markPercentage}%` }
              }
            >
              <div className="w-1 h-1 bg-gray-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              {mark.label && (
                <div className="absolute mt-2 text-xs text-gray-500 whitespace-nowrap transform -translate-x-1/2">
                  {mark.label}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Range Slider (for min-max values)
export const RangeSlider = ({
  value = [20, 80],
  onChange,
  min = 0,
  max = 100,
  step = 1,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value)

  const handleMinChange = (newMin) => {
    const newValue = [Math.min(newMin, localValue[1]), localValue[1]]
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const handleMaxChange = (newMax) => {
    const newValue = [localValue[0], Math.max(newMax, localValue[0])]
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div className="relative">
      <Slider
        value={localValue[0]}
        onChange={handleMinChange}
        min={min}
        max={max}
        step={step}
        {...props}
      />
      <Slider
        value={localValue[1]}
        onChange={handleMaxChange}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    </div>
  )
}

export default Slider