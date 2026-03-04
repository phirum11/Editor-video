import React, { useState, createContext, useContext } from 'react'

const TabsContext = createContext()

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  children,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue)

  const handleChange = (newValue) => {
    if (value === undefined) {
      setSelectedTab(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider
      value={{
        value: value !== undefined ? value : selectedTab,
        onValueChange: handleChange,
        orientation
      }}
    >
      <div className={`tabs ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// Tabs List
export const TabsList = ({
  children,
  className = ''
}) => {
  const { orientation } = useContext(TabsContext)

  const orientationClasses = {
    horizontal: 'flex flex-row space-x-1 border-b border-gray-200 dark:border-gray-700',
    vertical: 'flex flex-col space-y-1 border-r border-gray-200 dark:border-gray-700 pr-4'
  }

  return (
    <div className={`${orientationClasses[orientation]} ${className}`}>
      {children}
    </div>
  )
}

// Tabs Trigger
export const TabsTrigger = ({
  value,
  children,
  disabled = false,
  className = ''
}) => {
  const { value: selectedValue, onValueChange, orientation } = useContext(TabsContext)
  const isSelected = selectedValue === value

  const baseClasses = `
    px-4 py-2 text-sm font-medium rounded-lg transition-all
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const stateClasses = isSelected
    ? 'bg-blue-600 text-white shadow-lg'
    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'

  const orientationClasses = {
    horizontal: '',
    vertical: 'text-left'
  }

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => !disabled && onValueChange(value)}
      className={`
        ${baseClasses}
        ${stateClasses}
        ${orientationClasses[orientation]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// Tabs Content
export const TabsContent = ({
  value,
  children,
  className = ''
}) => {
  const { value: selectedValue } = useContext(TabsContext)

  if (selectedValue !== value) return null

  return (
    <div
      role="tabpanel"
      className={`mt-4 focus:outline-none ${className}`}
      tabIndex={0}
    >
      {children}
    </div>
  )
}

// Card Tabs (stylized tabs inside a card)
export const CardTabs = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

// Underlined Tabs (material design style)
export const UnderlinedTabs = ({ children, className = '' }) => {
  return (
    <Tabs {...props} className={className}>
      <TabsList className="border-b-0">
        {React.Children.map(children, (child) => {
          if (child.type === TabsList) {
            return React.cloneElement(child, {
              className: 'border-b-2 border-transparent data-[selected]:border-blue-600'
            })
          }
          return child
        })}
      </TabsList>
    </Tabs>
  )
}

// Pills Tabs
export const PillsTabs = ({ children, className = '' }) => {
  return (
    <Tabs {...props}>
      <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {children}
      </TabsList>
    </Tabs>
  )
}

// Icons Tabs
export const IconTabs = ({ items, ...props }) => {
  return (
    <Tabs {...props}>
      <TabsList>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            <div className="flex items-center space-x-2">
              {item.icon && <item.icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default Tabs