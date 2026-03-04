import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp, X, Check, Search } from 'lucide-react'

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  helper,
  disabled = false,
  required = false,
  multiple = false,
  searchable = false,
  clearable = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const optionsRef = useRef([])

  // Sizes
  const sizes = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-3 px-4 text-lg'
  }

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0) {
            handleSelect(filteredOptions[highlightedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightedIndex, filteredOptions])

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [highlightedIndex])

  // Handle select
  const handleSelect = (option) => {
    if (multiple) {
      const newValue = value?.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...(value || []), option.value]
      onChange?.(newValue)
    } else {
      onChange?.(option.value)
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation()
    onChange?.(multiple ? [] : null)
  }

  // Get selected labels
  const getSelectedLabels = () => {
    if (!value) return []
    if (multiple) {
      return options
        .filter(opt => value.includes(opt.value))
        .map(opt => opt.label)
    }
    const option = options.find(opt => opt.value === value)
    return option ? [option.label] : []
  }

  const selectedLabels = getSelectedLabels()

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select trigger */}
      <div
        className={`
          relative w-full bg-white dark:bg-gray-800 border rounded-lg cursor-pointer
          transition-all duration-200
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300 dark:border-gray-600'}
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={`flex items-center justify-between ${sizes[size]}`}>
          {/* Selected values */}
          <div className="flex-1 truncate">
            {selectedLabels.length > 0 ? (
              multiple ? (
                <div className="flex flex-wrap gap-1">
                  {selectedLabels.map((label, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded"
                    >
                      {label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const option = options.find(opt => opt.label === label)
                          if (option) handleSelect(option)
                        }}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-900 dark:text-white">
                  {selectedLabels[0]}
                </span>
              )
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                {placeholder}
              </span>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-1">
            {clearable && value && (multiple ? value.length > 0 : value) && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Search input */}
        {isOpen && searchable && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>

      {/* Options dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = multiple
                ? value?.includes(option.value)
                : value === option.value

              return (
                <div
                  key={option.value}
                  ref={el => (optionsRef.current[index] = el)}
                  className={`
                    px-3 py-2 cursor-pointer flex items-center justify-between
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                    ${highlightedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-700
                  `}
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              )
            })
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              No options found
            </div>
          )}
        </div>
      )}

      {/* Error and helper text */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
      {helper && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helper}</p>
      )}
    </div>
  )
}

// Option Group component
export const SelectGroup = ({ label, children }) => {
  return (
    <div className="py-1">
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </div>
      {children}
    </div>
  )
}

// Async Select with loading state
export const AsyncSelect = ({ loading = false, options = [], ...props }) => {
  return (
    <Select
      options={options}
      {...props}
      placeholder={loading ? 'Loading...' : props.placeholder}
      disabled={loading || props.disabled}
    />
  )
}

export default Select