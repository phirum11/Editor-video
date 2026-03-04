import React, { forwardRef } from 'react'

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  selected = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}, ref) => {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
    ghost: 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
  }

  const paddings = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const interactiveClasses = interactive ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1' : ''
  const selectedClasses = selected ? 'ring-2 ring-blue-500 border-blue-500' : ''
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <div
      ref={ref}
      onClick={disabled ? undefined : onClick}
      className={`
        rounded-xl
        ${variants[variant]}
        ${paddings[padding]}
        ${interactiveClasses}
        ${selectedClasses}
        ${disabledClasses}
        ${className}
      `}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card Header component
export const CardHeader = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center justify-between mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

CardHeader.displayName = 'CardHeader'

// Card Title component
export const CardTitle = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
})

CardTitle.displayName = 'CardTitle'

// Card Description component
export const CardDescription = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </p>
  )
})

CardDescription.displayName = 'CardDescription'

// Card Content component
export const CardContent = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
})

CardContent.displayName = 'CardContent'

// Card Footer component
export const CardFooter = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

CardFooter.displayName = 'CardFooter'

// Card Image component
export const CardImage = forwardRef(({ src, alt, aspectRatio = '16/9', className = '', ...props }, ref) => {
  return (
    <div className={`relative overflow-hidden rounded-t-xl ${className}`} style={{ aspectRatio }}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        {...props}
      />
    </div>
  )
})

CardImage.displayName = 'CardImage'

// Card Grid component
export const CardGrid = ({ children, columns = 3, gap = 4, className = '' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6'
  }

  const gaps = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <div className={`grid ${gridCols[columns] || gridCols[3]} ${gaps[gap] || gaps[4]} ${className}`}>
      {children}
    </div>
  )
}

export default Card