import { useState, useEffect, createContext, useContext, useCallback } from 'react'

// Create theme context
const ThemeContext = createContext()

// Theme Provider
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'dark'
  })

  const [systemTheme, setSystemTheme] = useState('dark')
  const [preferredTheme, setPreferredTheme] = useState(theme)

  // Available themes
  const themes = {
    dark: {
      name: 'Dark',
      colors: {
        primary: '#3b82f6',
        background: '#111827',
        surface: '#1f2937',
        text: '#ffffff',
        textSecondary: '#9ca3af',
        border: '#374151',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    },
    light: {
      name: 'Light',
      colors: {
        primary: '#3b82f6',
        background: '#f9fafb',
        surface: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    },
    sepia: {
      name: 'Sepia',
      colors: {
        primary: '#8b5cf6',
        background: '#fbf7f0',
        surface: '#fff9f0',
        text: '#433422',
        textSecondary: '#7b6b5a',
        border: '#e8d9c5',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#7c3aed'
      }
    },
    forest: {
      name: 'Forest',
      colors: {
        primary: '#10b981',
        background: '#064e3b',
        surface: '#065f46',
        text: '#ecfdf5',
        textSecondary: '#a7f3d0',
        border: '#047857',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa'
      }
    },
    ocean: {
      name: 'Ocean',
      colors: {
        primary: '#0ea5e9',
        background: '#0c4a6e',
        surface: '#075985',
        text: '#e0f2fe',
        textSecondary: '#bae6fd',
        border: '#0284c7',
        success: '#2dd4bf',
        warning: '#fcd34d',
        error: '#fca5a5',
        info: '#38bdf8'
      }
    }
  }

  // Get system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handler = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    const currentTheme = themes[theme] || themes.dark

    // Remove all theme classes
    root.classList.remove('dark', 'light', 'sepia', 'forest', 'ocean')
    
    // Add current theme class
    root.classList.add(theme)

    // Set CSS variables
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // Save to localStorage
    localStorage.setItem('theme', theme)

    // Dispatch event for other hooks
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme, colors: currentTheme.colors } }))
  }, [theme, themes])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  // Set specific theme
  const setThemeMode = useCallback((newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme)
    }
  }, [themes])

  // Set preferred theme
  const setPreferred = useCallback((pref) => {
    setPreferredTheme(pref)
    setTheme(pref)
  }, [])

  // Reset to system preference
  const resetToSystem = useCallback(() => {
    setTheme(systemTheme)
  }, [systemTheme])

  // Cycle through themes
  const cycleTheme = useCallback(() => {
    const themeList = Object.keys(themes)
    const currentIndex = themeList.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeList.length
    setTheme(themeList[nextIndex])
  }, [theme, themes])

  return (
    <ThemeContext.Provider value={{
      theme,
      systemTheme,
      preferredTheme,
      themes,
      currentTheme: themes[theme],
      toggleTheme,
      setTheme: setThemeMode,
      setPreferred,
      resetToSystem,
      cycleTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light'
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// useTheme hook
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// useThemeDetector (detect system theme)
export const useThemeDetector = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(mediaQuery.matches)

    const handler = (e) => setIsDarkMode(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isDarkMode
}

// useThemeTransition
export const useThemeTransition = (duration = 300) => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const startTransition = useCallback(() => {
    setIsTransitioning(true)
    setTimeout(() => setIsTransitioning(false), duration)
  }, [duration])

  useEffect(() => {
    const handleThemeChange = () => startTransition()
    window.addEventListener('themeChange', handleThemeChange)
    return () => window.removeEventListener('themeChange', handleThemeChange)
  }, [startTransition])

  return { isTransitioning, startTransition }
}

// useThemeColors
export const useThemeColors = () => {
  const { currentTheme } = useTheme()
  return currentTheme?.colors || {}
}

// useThemeVariable
export const useThemeVariable = (variable) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    const updateValue = () => {
      const root = document.documentElement
      const computed = getComputedStyle(root)
      setValue(computed.getPropertyValue(`--color-${variable}`).trim())
    }

    updateValue()
    window.addEventListener('themeChange', updateValue)
    return () => window.removeEventListener('themeChange', updateValue)
  }, [variable])

  return value
}