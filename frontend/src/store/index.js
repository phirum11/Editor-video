import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import videoReducer from './videoSlice'
import audioReducer from './audioSlice'
import downloadReducer from './downloadSlice'
import uiReducer from './uiSlice'

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState')
    if (serializedState === null) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    console.error('Failed to load state from localStorage:', err)
    return undefined
  }
}

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('reduxState', serializedState)
  } catch (err) {
    console.error('Failed to save state to localStorage:', err)
  }
}

// Configure store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    video: videoReducer,
    audio: audioReducer,
    download: downloadReducer,
    ui: uiReducer
  },
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.file', 'payload.error'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'video.currentVideo', 'audio.currentAudio']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
})

// Subscribe to store changes
store.subscribe(() => {
  saveState({
    auth: store.getState().auth,
    ui: store.getState().ui
  })
})

// Export types
export * from './authSlice'
export * from './videoSlice'
export * from './audioSlice'
export * from './downloadSlice'
export * from './uiSlice'

// Export store hooks
export const useAppDispatch = () => store.dispatch
export const useAppSelector = (selector) => selector(store.getState())

export default store