import React, { forwardRef } from 'react'
import { Loader } from 'lucide-react'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}, ref) => {
  // Button variants
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    info: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    link: 'text-blue-600 hover:underline focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-transparent shadow-none'
  }

  // Button sizes
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  // Conditional classes
  const widthClass = fullWidth ? 'w-full' : ''
  const loadingClass = loading ? 'cursor-wait' : ''

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${widthClass}
        ${loadingClass}
        ${className}
      `}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${iconPosition === 'left' ? 'mr-2' : 'ml-2 order-last'}`} />
      )}
      
      {/* Left icon */}
      {Icon && !loading && iconPosition === 'left' && (
        <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
      )}
      
      {/* Button text */}
      <span>{children}</span>
      
      {/* Right icon */}
      {Icon && !loading && iconPosition === 'right' && (
        <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ml-2`} />
      )}
    </button>
  )
})

Button.displayName = 'Button'

// ============================================
// ICON BUTTON COMPONENT
// ============================================

export const IconButton = forwardRef(({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  // Icon button sizes
  const sizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3'
  }

  // Icon sizes
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={`${sizes[size]} rounded-full ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  )
})

IconButton.displayName = 'IconButton'

// ============================================
// BUTTON GROUP COMPONENT
// ============================================

export const ButtonGroup = ({ 
  children, 
  orientation = 'horizontal', 
  className = '' 
}) => {
  // Orientation classes
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  }

  return (
    <div className={`inline-flex ${orientationClasses[orientation]} -space-x-px ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child
        
        const isFirst = index === 0
        const isLast = index === React.Children.count(children) - 1
        
        // Border radius classes based on orientation and position
        let roundedClasses = ''
        if (orientation === 'horizontal') {
          if (isFirst) roundedClasses = 'rounded-r-none'
          else if (isLast) roundedClasses = 'rounded-l-none'
          else roundedClasses = 'rounded-none'
        } else {
          if (isFirst) roundedClasses = 'rounded-b-none'
          else if (isLast) roundedClasses = 'rounded-t-none'
          else roundedClasses = 'rounded-none'
        }
        
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${roundedClasses}`
        })
      })}
    </div>
  )
}

ButtonGroup.displayName = 'ButtonGroup'

// ============================================
// TOGGLE BUTTON COMPONENT
// ============================================

export const ToggleButton = forwardRef(({
  pressed = false,
  onPressedChange,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={pressed ? 'primary' : 'outline'}
      onClick={() => onPressedChange?.(!pressed)}
      aria-pressed={pressed}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
})

ToggleButton.displayName = 'ToggleButton'

// ============================================
// LOADING BUTTON COMPONENT
// ============================================

export const LoadingButton = forwardRef(({
  loading = true,
  loadingText = 'Loading...',
  children,
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      loading={loading}
      disabled={loading}
      {...props}
    >
      {loading ? loadingText : children}
    </Button>
  )
})

LoadingButton.displayName = 'LoadingButton'

// ============================================
// SOCIAL BUTTON COMPONENTS
// ============================================

export const GoogleButton = forwardRef(({ children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="outline"
      className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
      {...props}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {children || 'Continue with Google'}
    </Button>
  )
})

GoogleButton.displayName = 'GoogleButton'

export const GithubButton = forwardRef(({ children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="outline"
      className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
      {...props}
    >
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
      {children || 'Continue with GitHub'}
    </Button>
  )
})

GithubButton.displayName = 'GithubButton'

// ============================================
// FLOATING ACTION BUTTON (FAB)
// ============================================

export const FabButton = forwardRef(({
  icon: Icon,
  label,
  position = 'bottom-right',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  // Position classes
  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  }

  // Size classes
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8'
  }

  return (
    <button
      ref={ref}
      className={`
        fixed ${positions[position]} ${sizes[size]}
        bg-blue-600 text-white rounded-full shadow-lg
        hover:bg-blue-700 hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-all duration-200 transform hover:scale-110
        flex items-center justify-center
        ${className}
      `}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  )
})

FabButton.displayName = 'FabButton'

// ============================================
// DROPDOWN BUTTON
// ============================================

export const DropdownButton = forwardRef(({
  children,
  icon: Icon = ChevronDown,
  items = [],
  align = 'left',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Alignment classes
  const alignClasses = {
    left: 'left-0',
    right: 'right-0'
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        ref={ref}
        onClick={() => setIsOpen(!isOpen)}
        icon={Icon}
        iconPosition="right"
        {...props}
      >
        {children}
      </Button>

      {isOpen && (
        <div className={`absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 ${alignClasses[align]}`}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

DropdownButton.displayName = 'DropdownButton'

export default Button