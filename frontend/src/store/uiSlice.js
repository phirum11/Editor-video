import { createSlice } from '@reduxjs/toolkit'

// Initial state
const initialState = {
  theme: localStorage.getItem('theme') || 'dark',
  sidebarOpen: window.innerWidth > 768,
  notifications: [],
  modals: {},
  toast: {
    visible: false,
    message: '',
    type: 'info',
    duration: 5000
  },
  loading: {
    global: false,
    requests: {}
  },
  filters: {},
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0
  },
  errors: {},
  alerts: [],
  breadcrumbs: [],
  keyboardShortcuts: true,
  animations: true,
  reducedMotion: false,
  fontSize: 'medium',
  compactMode: false
}

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.theme)
    },

    // Sidebar
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },

    // Notifications
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        read: false,
        timestamp: new Date().toISOString(),
        ...action.payload
      })
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(n => n.read = true)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },

    // Modals
    openModal: (state, action) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false
    },
    toggleModal: (state, action) => {
      state.modals[action.payload] = !state.modals[action.payload]
    },
    closeAllModals: (state) => {
      state.modals = {}
    },

    // Toast
    showToast: (state, action) => {
      state.toast = {
        visible: true,
        ...action.payload,
        id: Date.now()
      }
    },
    hideToast: (state) => {
      state.toast.visible = false
    },
    updateToast: (state, action) => {
      state.toast = { ...state.toast, ...action.payload }
    },

    // Loading
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload
    },
    startRequest: (state, action) => {
      state.loading.requests[action.payload] = true
    },
    finishRequest: (state, action) => {
      delete state.loading.requests[action.payload]
    },
    clearRequests: (state) => {
      state.loading.requests = {}
    },

    // Filters
    setFilter: (state, action) => {
      const { key, value } = action.payload
      state.filters[key] = value
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilter: (state, action) => {
      delete state.filters[action.payload]
    },
    clearAllFilters: (state) => {
      state.filters = {}
    },

    // Pagination
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload
    },
    setTotalItems: (state, action) => {
      state.pagination.totalItems = action.payload
    },
    nextPage: (state) => {
      state.pagination.currentPage++
    },
    prevPage: (state) => {
      state.pagination.currentPage = Math.max(1, state.pagination.currentPage - 1)
    },
    resetPagination: (state) => {
      state.pagination = initialState.pagination
    },

    // Errors
    setError: (state, action) => {
      const { key, error } = action.payload
      state.errors[key] = error
    },
    clearError: (state, action) => {
      delete state.errors[action.payload]
    },
    clearAllErrors: (state) => {
      state.errors = {}
    },

    // Alerts
    addAlert: (state, action) => {
      state.alerts.push({
        id: Date.now(),
        ...action.payload
      })
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(a => a.id !== action.payload)
    },
    clearAlerts: (state) => {
      state.alerts = []
    },

    // Breadcrumbs
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload)
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = []
    },

    // Settings
    setKeyboardShortcuts: (state, action) => {
      state.keyboardShortcuts = action.payload
    },
    setAnimations: (state, action) => {
      state.animations = action.payload
    },
    setReducedMotion: (state, action) => {
      state.reducedMotion = action.payload
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload
    },
    setCompactMode: (state, action) => {
      state.compactMode = action.payload
    },

    // Window
    windowResized: (state, action) => {
      // Handle window resize
      if (action.payload.width < 768) {
        state.sidebarOpen = false
      }
    }
  }
})

// Actions
export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleModal,
  closeAllModals,
  showToast,
  hideToast,
  updateToast,
  setGlobalLoading,
  startRequest,
  finishRequest,
  clearRequests,
  setFilter,
  setFilters,
  clearFilter,
  clearAllFilters,
  setCurrentPage,
  setPageSize,
  setTotalItems,
  nextPage,
  prevPage,
  resetPagination,
  setError,
  clearError,
  clearAllErrors,
  addAlert,
  removeAlert,
  clearAlerts,
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,
  setKeyboardShortcuts,
  setAnimations,
  setReducedMotion,
  setFontSize,
  setCompactMode,
  windowResized
} = uiSlice.actions

// Selectors
export const selectTheme = (state) => state.ui.theme
export const selectIsDarkMode = (state) => state.ui.theme === 'dark'
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectNotifications = (state) => state.ui.notifications
export const selectUnreadCount = (state) => 
  state.ui.notifications.filter(n => !n.read).length
export const selectModalOpen = (state, modalId) => state.ui.modals[modalId]
export const selectToast = (state) => state.ui.toast
export const selectGlobalLoading = (state) => state.ui.loading.global
export const selectRequestLoading = (state, requestId) => 
  state.ui.loading.requests[requestId]
export const selectAnyLoading = (state) => 
  state.ui.loading.global || Object.keys(state.ui.loading.requests).length > 0
export const selectFilters = (state) => state.ui.filters
export const selectFilter = (state, key) => state.ui.filters[key]
export const selectPagination = (state) => state.ui.pagination
export const selectErrors = (state) => state.ui.errors
export const selectError = (state, key) => state.ui.errors[key]
export const selectAlerts = (state) => state.ui.alerts
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs
export const selectKeyboardShortcuts = (state) => state.ui.keyboardShortcuts
export const selectAnimations = (state) => state.ui.animations
export const selectReducedMotion = (state) => state.ui.reducedMotion
export const selectFontSize = (state) => state.ui.fontSize
export const selectCompactMode = (state) => state.ui.compactMode

// Helper selectors
export const selectIsMobile = (state) => {
  // This would need window size, but we can derive from sidebar behavior
  return !state.ui.sidebarOpen && window.innerWidth < 768
}

export const selectShouldAnimate = (state) => {
  return state.ui.animations && !state.ui.reducedMotion
}

export default uiSlice.reducer