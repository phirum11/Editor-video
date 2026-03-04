import React, { useState, useRef, useEffect } from 'react'

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  hideDelay = 0,
  maxWidth = 200,
  className = '',
  contentClassName = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)
  const hideTimeoutRef = useRef(null)

  // Positions
  const positions = {
    top: { transform: 'translateX(-50%) translateY(-100%)', bottom: '100%', left: '50%', marginBottom: '8px' },
    bottom: { transform: 'translateX(-50%)', top: '100%', left: '50%', marginTop: '8px' },
    left: { transform: 'translateY(-50%) translateX(-100%)', right: '100%', top: '50%', marginRight: '8px' },
    right: { transform: 'translateY(-50%)', left: '100%', top: '50%', marginLeft: '8px' }
  }

  // Calculate position
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const scrollY = window.scrollY || window.pageYOffset
    const scrollX = window.scrollX || window.pageXOffset

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2
        break
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2
        break
      case 'left':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2
        left = triggerRect.left + scrollX - tooltipRect.width - 8
        break
      case 'right':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2
        left = triggerRect.right + scrollX + 8
        break
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (left < 10) left = 10
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10
    }
    if (top < 10) top = 10
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10
    }

    setCoords({ top, left })
  }

  // Show tooltip
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      updatePosition()
    }, delay)
  }

  // Hide tooltip
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    if (hideDelay > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, hideDelay)
    } else {
      setIsVisible(false)
    }
  }

  // Update position on scroll/resize
  useEffect(() => {
    if (!isVisible) return

    const handleUpdate = () => {
      updatePosition()
    }

    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [isVisible])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            fixed z-50 px-2 py-1 bg-gray-900 text-white text-sm rounded shadow-lg
            animate-in fade-in duration-200
            ${contentClassName}
          `}
          style={{
            top: coords.top,
            left: coords.left,
            maxWidth
          }}
          role="tooltip"
        >
          {content}
          <div
            className={`
              absolute w-2 h-2 bg-gray-900 transform rotate-45
              ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
              ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
              ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
              ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
            `}
          />
        </div>
      )}
    </div>
  )
}

// Tooltip with HTML content
export const RichTooltip = ({ content, ...props }) => {
  return (
    <Tooltip
      content={<div className="p-2 max-w-xs">{content}</div>}
      {...props}
    />
  )
}

// Tooltip with delay
export const DelayedTooltip = ({ delay = 500, ...props }) => {
  return <Tooltip delay={delay} {...props} />
}

// Tooltip Group
export const TooltipGroup = ({ children, delay = 0 }) => {
  return (
    <div className="flex space-x-2">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { delay })
        }
        return child
      })}
    </div>
  )
}

export default Tooltip