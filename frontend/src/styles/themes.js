// Theme configuration for JavaScript/React

export const themes = {
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      // Primary
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryDark: '#2563eb',
      
      // Secondary
      secondary: '#64748b',
      secondaryLight: '#94a3b8',
      secondaryDark: '#475569',
      
      // Background
      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      backgroundTertiary: '#f3f4f6',
      
      // Text
      text: '#111827',
      textSecondary: '#4b5563',
      textTertiary: '#6b7280',
      textDisabled: '#9ca3af',
      
      // Borders
      border: '#e5e7eb',
      borderDark: '#d1d5db',
      
      // Status
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Overlays
      overlay: 'rgba(0, 0, 0, 0.1)',
      overlayDark: 'rgba(0, 0, 0, 0.2)',
      
      // Charts
      chart1: '#3b82f6',
      chart2: '#ef4444',
      chart3: '#eab308',
      chart4: '#22c55e',
      chart5: '#8b5cf6',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      secondary: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      warning: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    }
  },
  
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      // Primary
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryDark: '#2563eb',
      
      // Secondary
      secondary: '#94a3b8',
      secondaryLight: '#cbd5e1',
      secondaryDark: '#64748b',
      
      // Background
      background: '#111827',
      backgroundSecondary: '#1f2937',
      backgroundTertiary: '#374151',
      
      // Text
      text: '#f9fafb',
      textSecondary: '#e5e7eb',
      textTertiary: '#d1d5db',
      textDisabled: '#9ca3af',
      
      // Borders
      border: '#374151',
      borderDark: '#4b5563',
      
      // Status
      success: '#22c55e',
      warning: '#eab308',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Overlays
      overlay: 'rgba(255, 255, 255, 0.1)',
      overlayDark: 'rgba(255, 255, 255, 0.2)',
      
      // Charts
      chart1: '#60a5fa',
      chart2: '#f87171',
      chart3: '#facc15',
      chart4: '#4ade80',
      chart5: '#a78bfa',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      secondary: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
      warning: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    }
  },
  
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    colors: {
      // Primary
      primary: '#8b5cf6',
      primaryLight: '#a78bfa',
      primaryDark: '#7c3aed',
      
      // Secondary
      secondary: '#7b6b5a',
      secondaryLight: '#9b8b7a',
      secondaryDark: '#5b4b3a',
      
      // Background
      background: '#fbf7f0',
      backgroundSecondary: '#fff9f0',
      backgroundTertiary: '#f5ede0',
      
      // Text
      text: '#433422',
      textSecondary: '#5b4b3a',
      textTertiary: '#736352',
      textDisabled: '#9b8b7a',
      
      // Borders
      border: '#e8d9c5',
      borderDark: '#d8c9b5',
      
      // Status
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#7c3aed',
      
      // Overlays
      overlay: 'rgba(0, 0, 0, 0.05)',
      overlayDark: 'rgba(0, 0, 0, 0.1)',
      
      // Charts
      chart1: '#8b5cf6',
      chart2: '#dc2626',
      chart3: '#d97706',
      chart4: '#059669',
      chart5: '#7c3aed',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      secondary: 'linear-gradient(135deg, #7b6b5a 0%, #5b4b3a 100%)',
      success: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      warning: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      error: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    }
  },
  
  forest: {
    id: 'forest',
    name: 'Forest',
    colors: {
      // Primary
      primary: '#10b981',
      primaryLight: '#34d399',
      primaryDark: '#059669',
      
      // Secondary
      secondary: '#6b7280',
      secondaryLight: '#9ca3af',
      secondaryDark: '#4b5563',
      
      // Background
      background: '#064e3b',
      backgroundSecondary: '#065f46',
      backgroundTertiary: '#047857',
      
      // Text
      text: '#ecfdf5',
      textSecondary: '#d1fae5',
      textTertiary: '#a7f3d0',
      textDisabled: '#6ee7b7',
      
      // Borders
      border: '#047857',
      borderDark: '#059669',
      
      // Status
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      
      // Overlays
      overlay: 'rgba(255, 255, 255, 0.1)',
      overlayDark: 'rgba(255, 255, 255, 0.2)',
      
      // Charts
      chart1: '#10b981',
      chart2: '#f87171',
      chart3: '#fbbf24',
      chart4: '#34d399',
      chart5: '#60a5fa',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      secondary: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      success: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      warning: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      error: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    }
  },
  
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      // Primary
      primary: '#0ea5e9',
      primaryLight: '#38bdf8',
      primaryDark: '#0284c7',
      
      // Secondary
      secondary: '#94a3b8',
      secondaryLight: '#cbd5e1',
      secondaryDark: '#64748b',
      
      // Background
      background: '#0c4a6e',
      backgroundSecondary: '#075985',
      backgroundTertiary: '#0369a1',
      
      // Text
      text: '#f0f9ff',
      textSecondary: '#e0f2fe',
      textTertiary: '#bae6fd',
      textDisabled: '#7dd3fc',
      
      // Borders
      border: '#0369a1',
      borderDark: '#0284c7',
      
      // Status
      success: '#2dd4bf',
      warning: '#fcd34d',
      error: '#fca5a5',
      info: '#7dd3fc',
      
      // Overlays
      overlay: 'rgba(255, 255, 255, 0.1)',
      overlayDark: 'rgba(255, 255, 255, 0.2)',
      
      // Charts
      chart1: '#0ea5e9',
      chart2: '#fca5a5',
      chart3: '#fcd34d',
      chart4: '#2dd4bf',
      chart5: '#c084fc',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      secondary: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
      success: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
      warning: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)',
      error: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
    }
  }
};

// Theme context helper
export const getThemeColors = (themeId) => {
  return themes[themeId]?.colors || themes.light.colors;
};

// CSS variable generator
export const generateThemeVariables = (themeId) => {
  const theme = themes[themeId] || themes.light;
  const { colors } = theme;
  
  return {
    '--color-primary': colors.primary,
    '--color-primary-light': colors.primaryLight,
    '--color-primary-dark': colors.primaryDark,
    '--color-secondary': colors.secondary,
    '--color-secondary-light': colors.secondaryLight,
    '--color-secondary-dark': colors.secondaryDark,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-info': colors.info,
    '--bg-primary': colors.background,
    '--bg-secondary': colors.backgroundSecondary,
    '--bg-tertiary': colors.backgroundTertiary,
    '--text-primary': colors.text,
    '--text-secondary': colors.textSecondary,
    '--text-tertiary': colors.textTertiary,
    '--text-disabled': colors.textDisabled,
    '--border-light': colors.border,
    '--border-default': colors.borderDark,
    '--shadow-sm': theme.shadows.sm,
    '--shadow-base': theme.shadows.base,
    '--shadow-md': theme.shadows.md,
    '--shadow-lg': theme.shadows.lg,
    '--shadow-xl': theme.shadows.xl,
  };
};

// Apply theme to document
export const applyTheme = (themeId) => {
  const variables = generateThemeVariables(themeId);
  
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
  
  document.documentElement.classList.remove('light', 'dark', 'sepia', 'forest', 'ocean');
  document.documentElement.classList.add(themeId);
  
  localStorage.setItem('theme', themeId);
};

// Get system theme preference
export const getSystemTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// Initialize theme
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = getSystemTheme();
  
  return savedTheme || systemTheme;
};

export default themes;