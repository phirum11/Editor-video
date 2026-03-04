import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import downloadService from '../services/downloadService'

// Initial state
const initialState = {
  downloads: [],
  currentDownload: null,
  tasks: [],
  formats: [],
  videoInfo: null,
  isLoading: false,
  isDownloading: false,
  error: null,
  progress: 0,
  speed: 0,
  stats: {
    totalDownloads: 0,
    totalSize: 0,
    completed: 0,
    failed: 0,
    active: 0
  },
  history: [],
  favorites: []
}

// Async thunks
export const getVideoInfo = createAsyncThunk(
  'download/getInfo',
  async (url, { rejectWithValue }) => {
    try {
      const response = await downloadService.getInfo(url)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get video info')
    }
  }
)

export const getFormats = createAsyncThunk(
  'download/getFormats',
  async (url, { rejectWithValue }) => {
    try {
      const response = await downloadService.getFormats(url)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get formats')
    }
  }
)

export const startDownload = createAsyncThunk(
  'download/start',
  async ({ url, options }, { rejectWithValue }) => {
    try {
      const response = await downloadService.startDownload(url, options)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to start download')
    }
  }
)

export const downloadPlaylist = createAsyncThunk(
  'download/playlist',
  async ({ url, episodes, options }, { rejectWithValue }) => {
    try {
      const response = await downloadService.downloadPlaylist(url, episodes, options)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to download playlist')
    }
  }
)

export const getProgress = createAsyncThunk(
  'download/getProgress',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await downloadService.getProgress(taskId)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get progress')
    }
  }
)

export const cancelDownload = createAsyncThunk(
  'download/cancel',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await downloadService.cancelDownload(taskId)
      if (response.success) {
        return { taskId }
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel download')
    }
  }
)

// Download slice
const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentDownload: (state, action) => {
      state.currentDownload = action.payload
    },
    clearCurrentDownload: (state) => {
      state.currentDownload = null
    },
    setVideoInfo: (state, action) => {
      state.videoInfo = action.payload
    },
    clearVideoInfo: (state) => {
      state.videoInfo = null
    },
    setProgress: (state, action) => {
      state.progress = action.payload
    },
    setSpeed: (state, action) => {
      state.speed = action.payload
    },
    addToHistory: (state, action) => {
      state.history.unshift(action.payload)
      state.history = state.history.slice(0, 50) // Keep last 50
    },
    clearHistory: (state) => {
      state.history = []
    },
    addToFavorites: (state, action) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload)
      }
    },
    removeFromFavorites: (state, action) => {
      state.favorites = state.favorites.filter(url => url !== action.payload)
    },
    clearFavorites: (state) => {
      state.favorites = []
    },
    updateDownload: (state, action) => {
      const index = state.downloads.findIndex(d => d.id === action.payload.id)
      if (index !== -1) {
        state.downloads[index] = { ...state.downloads[index], ...action.payload }
      }
    },
    removeDownload: (state, action) => {
      const download = state.downloads.find(d => d.id === action.payload)
      if (download) {
        if (download.status === 'completed') {
          state.stats.completed--
        } else if (download.status === 'failed') {
          state.stats.failed--
        } else if (download.status === 'downloading') {
          state.stats.active--
        }
        state.stats.totalDownloads--
        state.stats.totalSize -= download.totalSize || 0
      }
      state.downloads = state.downloads.filter(d => d.id !== action.payload)
    },
    clearDownloads: (state) => {
      state.downloads = []
      state.tasks = []
      state.stats = initialState.stats
    }
  },
  extraReducers: (builder) => {
    // Get video info
    builder.addCase(getVideoInfo.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getVideoInfo.fulfilled, (state, action) => {
      state.isLoading = false
      state.videoInfo = action.payload.info
    })
    builder.addCase(getVideoInfo.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get video info'
    })

    // Get formats
    builder.addCase(getFormats.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getFormats.fulfilled, (state, action) => {
      state.isLoading = false
      state.formats = action.payload.formats
    })
    builder.addCase(getFormats.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get formats'
    })

    // Start download
    builder.addCase(startDownload.pending, (state) => {
      state.isDownloading = true
      state.error = null
      state.progress = 0
    })
    builder.addCase(startDownload.fulfilled, (state, action) => {
      state.isDownloading = false
      const download = {
        id: action.payload.taskId,
        status: 'pending',
        progress: 0,
        url: action.meta.arg.url,
        ...action.meta.arg.options,
        createdAt: new Date().toISOString()
      }
      state.downloads.push(download)
      state.tasks.push({
        id: action.payload.taskId,
        type: 'download',
        status: 'pending'
      })
      state.stats.totalDownloads++
      state.stats.active++
    })
    builder.addCase(startDownload.rejected, (state, action) => {
      state.isDownloading = false
      state.progress = 0
      state.error = action.payload || 'Failed to start download'
    })

    // Download playlist
    builder.addCase(downloadPlaylist.pending, (state) => {
      state.isDownloading = true
      state.error = null
    })
    builder.addCase(downloadPlaylist.fulfilled, (state, action) => {
      state.isDownloading = false
      state.tasks.push({
        id: action.payload.taskId,
        type: 'playlist',
        status: 'pending',
        total: action.payload.total,
        completed: 0
      })
      state.stats.totalDownloads += action.payload.total
      state.stats.active += action.payload.total
    })
    builder.addCase(downloadPlaylist.rejected, (state, action) => {
      state.isDownloading = false
      state.error = action.payload || 'Failed to download playlist'
    })

    // Get progress
    builder.addCase(getProgress.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(getProgress.fulfilled, (state, action) => {
      state.isLoading = false
      state.progress = action.payload.progress || 0
      state.speed = action.payload.speed || 0
      
      const downloadIndex = state.downloads.findIndex(d => d.id === action.meta.arg)
      if (downloadIndex !== -1) {
        state.downloads[downloadIndex] = {
          ...state.downloads[downloadIndex],
          ...action.payload
        }
      }

      const taskIndex = state.tasks.findIndex(t => t.id === action.meta.arg)
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...action.payload
        }
      }

      // Update stats based on status
      if (action.payload.status === 'completed') {
        state.stats.completed++
        state.stats.active--
      } else if (action.payload.status === 'failed') {
        state.stats.failed++
        state.stats.active--
      }
    })
    builder.addCase(getProgress.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get progress'
    })

    // Cancel download
    builder.addCase(cancelDownload.fulfilled, (state, action) => {
      const downloadIndex = state.downloads.findIndex(d => d.id === action.payload.taskId)
      if (downloadIndex !== -1) {
        state.downloads[downloadIndex].status = 'cancelled'
        if (state.downloads[downloadIndex].status === 'downloading') {
          state.stats.active--
        }
      }

      const taskIndex = state.tasks.findIndex(t => t.id === action.payload.taskId)
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = 'cancelled'
      }
    })
  }
})

// Actions
export const {
  clearError,
  setCurrentDownload,
  clearCurrentDownload,
  setVideoInfo,
  clearVideoInfo,
  setProgress,
  setSpeed,
  addToHistory,
  clearHistory,
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
  updateDownload,
  removeDownload,
  clearDownloads
} = downloadSlice.actions

// Selectors
export const selectDownloads = (state) => state.download.downloads
export const selectCurrentDownload = (state) => state.download.currentDownload
export const selectTasks = (state) => state.download.tasks
export const selectFormats = (state) => state.download.formats
export const selectVideoInfo = (state) => state.download.videoInfo
export const selectDownloadLoading = (state) => state.download.isLoading
export const selectDownloading = (state) => state.download.isDownloading
export const selectDownloadError = (state) => state.download.error
export const selectProgress = (state) => state.download.progress
export const selectSpeed = (state) => state.download.speed
export const selectDownloadStats = (state) => state.download.stats
export const selectHistory = (state) => state.download.history
export const selectFavorites = (state) => state.download.favorites
export const selectActiveDownloads = (state) => 
  state.download.downloads.filter(d => d.status === 'downloading' || d.status === 'pending')
export const selectCompletedDownloads = (state) => 
  state.download.downloads.filter(d => d.status === 'completed')
export const selectFailedDownloads = (state) => 
  state.download.downloads.filter(d => d.status === 'failed')

export default downloadSlice.reducer