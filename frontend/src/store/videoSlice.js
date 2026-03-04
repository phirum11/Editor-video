import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import videoService from '../services/videoService'

// Initial state
const initialState = {
  videos: [],
  currentVideo: null,
  tasks: [],
  currentTask: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  uploadProgress: 0,
  processingProgress: 0,
  totalVideos: 0,
  totalSize: 0,
  filters: {
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
    type: 'all'
  }
}

// Async thunks
export const uploadVideo = createAsyncThunk(
  'video/upload',
  async ({ file, onProgress }, { rejectWithValue }) => {
    try {
      const response = await videoService.uploadVideo(file, onProgress)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to upload video')
    }
  }
)

export const getVideoInfo = createAsyncThunk(
  'video/getInfo',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await videoService.getVideoInfo(videoId)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get video info')
    }
  }
)

export const processVideo = createAsyncThunk(
  'video/process',
  async ({ videoId, operations }, { rejectWithValue }) => {
    try {
      const response = await videoService.processVideo(videoId, operations)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to process video')
    }
  }
)

export const getTaskStatus = createAsyncThunk(
  'video/getTaskStatus',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await videoService.getTaskStatus(taskId)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get task status')
    }
  }
)

export const cancelTask = createAsyncThunk(
  'video/cancelTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await videoService.cancelTask(taskId)
      if (response.success) {
        return { taskId }
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel task')
    }
  }
)

export const extractAudio = createAsyncThunk(
  'video/extractAudio',
  async ({ videoId, format, quality }, { rejectWithValue }) => {
    try {
      const response = await videoService.extractAudio(videoId, format, quality)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to extract audio')
    }
  }
)

export const generateSubtitles = createAsyncThunk(
  'video/generateSubtitles',
  async ({ videoId, language, model }, { rejectWithValue }) => {
    try {
      const response = await videoService.generateSubtitles(videoId, language, model)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate subtitles')
    }
  }
)

export const burnSubtitles = createAsyncThunk(
  'video/burnSubtitles',
  async ({ videoId, segments, options }, { rejectWithValue }) => {
    try {
      const response = await videoService.burnSubtitles(videoId, segments, options)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to burn subtitles')
    }
  }
)

export const mergeVideos = createAsyncThunk(
  'video/merge',
  async ({ videoIds, options }, { rejectWithValue }) => {
    try {
      const response = await videoService.mergeVideos(videoIds, options)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to merge videos')
    }
  }
)

// Video slice
const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentVideo: (state, action) => {
      state.currentVideo = action.payload
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
    setProcessingProgress: (state, action) => {
      state.processingProgress = action.payload
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    addVideo: (state, action) => {
      state.videos.push(action.payload)
      state.totalVideos++
      state.totalSize += action.payload.size || 0
    },
    removeVideo: (state, action) => {
      const video = state.videos.find(v => v.id === action.payload)
      if (video) {
        state.totalSize -= video.size || 0
        state.totalVideos--
      }
      state.videos = state.videos.filter(v => v.id !== action.payload)
    },
    updateVideo: (state, action) => {
      const index = state.videos.findIndex(v => v.id === action.payload.id)
      if (index !== -1) {
        state.videos[index] = { ...state.videos[index], ...action.payload }
      }
    },
    clearVideos: (state) => {
      state.videos = []
      state.totalVideos = 0
      state.totalSize = 0
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload)
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload }
      }
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },
    clearTasks: (state) => {
      state.tasks = []
    }
  },
  extraReducers: (builder) => {
    // Upload video
    builder.addCase(uploadVideo.pending, (state) => {
      state.isLoading = true
      state.error = null
      state.uploadProgress = 0
    })
    builder.addCase(uploadVideo.fulfilled, (state, action) => {
      state.isLoading = false
      state.uploadProgress = 100
      state.videos.push({
        id: action.payload.videoId,
        filename: action.payload.filename,
        size: action.payload.size,
        uploadedAt: new Date().toISOString()
      })
      state.totalVideos++
      state.totalSize += action.payload.size
    })
    builder.addCase(uploadVideo.rejected, (state, action) => {
      state.isLoading = false
      state.uploadProgress = 0
      state.error = action.payload || 'Failed to upload video'
    })

    // Get video info
    builder.addCase(getVideoInfo.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getVideoInfo.fulfilled, (state, action) => {
      state.isLoading = false
      state.currentVideo = action.payload.info
    })
    builder.addCase(getVideoInfo.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get video info'
    })

    // Process video
    builder.addCase(processVideo.pending, (state) => {
      state.isProcessing = true
      state.error = null
      state.processingProgress = 0
    })
    builder.addCase(processVideo.fulfilled, (state, action) => {
      state.isProcessing = false
      state.tasks.push({
        id: action.payload.taskId,
        type: 'process',
        status: 'pending',
        videoId: action.meta.arg.videoId,
        createdAt: new Date().toISOString()
      })
    })
    builder.addCase(processVideo.rejected, (state, action) => {
      state.isProcessing = false
      state.error = action.payload || 'Failed to process video'
    })

    // Get task status
    builder.addCase(getTaskStatus.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(getTaskStatus.fulfilled, (state, action) => {
      state.isLoading = false
      const taskIndex = state.tasks.findIndex(t => t.id === action.meta.arg)
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...action.payload
        }
      }
      state.processingProgress = action.payload.progress || 0
    })
    builder.addCase(getTaskStatus.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get task status'
    })

    // Cancel task
    builder.addCase(cancelTask.fulfilled, (state, action) => {
      const taskIndex = state.tasks.findIndex(t => t.id === action.payload.taskId)
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = 'cancelled'
      }
    })

    // Extract audio
    builder.addCase(extractAudio.pending, (state) => {
      state.isProcessing = true
      state.error = null
    })
    builder.addCase(extractAudio.fulfilled, (state, action) => {
      state.isProcessing = false
      state.tasks.push({
        id: action.payload.taskId,
        type: 'extract-audio',
        status: 'pending',
        videoId: action.meta.arg.videoId,
        createdAt: new Date().toISOString()
      })
    })
    builder.addCase(extractAudio.rejected, (state, action) => {
      state.isProcessing = false
      state.error = action.payload || 'Failed to extract audio'
    })

    // Generate subtitles
    builder.addCase(generateSubtitles.pending, (state) => {
      state.isProcessing = true
      state.error = null
    })
    builder.addCase(generateSubtitles.fulfilled, (state, action) => {
      state.isProcessing = false
      state.tasks.push({
        id: action.payload.taskId,
        type: 'generate-subtitles',
        status: 'pending',
        videoId: action.meta.arg.videoId,
        createdAt: new Date().toISOString()
      })
    })
    builder.addCase(generateSubtitles.rejected, (state, action) => {
      state.isProcessing = false
      state.error = action.payload || 'Failed to generate subtitles'
    })

    // Burn subtitles
    builder.addCase(burnSubtitles.pending, (state) => {
      state.isProcessing = true
      state.error = null
    })
    builder.addCase(burnSubtitles.fulfilled, (state, action) => {
      state.isProcessing = false
      state.tasks.push({
        id: action.payload.taskId,
        type: 'burn-subtitles',
        status: 'pending',
        videoId: action.meta.arg.videoId,
        createdAt: new Date().toISOString()
      })
    })
    builder.addCase(burnSubtitles.rejected, (state, action) => {
      state.isProcessing = false
      state.error = action.payload || 'Failed to burn subtitles'
    })

    // Merge videos
    builder.addCase(mergeVideos.pending, (state) => {
      state.isProcessing = true
      state.error = null
    })
    builder.addCase(mergeVideos.fulfilled, (state, action) => {
      state.isProcessing = false
      state.tasks.push({
        id: action.payload.taskId,
        type: 'merge',
        status: 'pending',
        createdAt: new Date().toISOString()
      })
    })
    builder.addCase(mergeVideos.rejected, (state, action) => {
      state.isProcessing = false
      state.error = action.payload || 'Failed to merge videos'
    })
  }
})

// Actions
export const {
  clearError,
  setCurrentVideo,
  clearCurrentVideo,
  setUploadProgress,
  setProcessingProgress,
  updateFilters,
  clearFilters,
  addVideo,
  removeVideo,
  updateVideo,
  clearVideos,
  addTask,
  updateTask,
  removeTask,
  clearTasks
} = videoSlice.actions

// Selectors
export const selectVideos = (state) => state.video.videos
export const selectCurrentVideo = (state) => state.video.currentVideo
export const selectTasks = (state) => state.video.tasks
export const selectCurrentTask = (state) => state.video.currentTask
export const selectVideoLoading = (state) => state.video.isLoading
export const selectVideoProcessing = (state) => state.video.isProcessing
export const selectVideoError = (state) => state.video.error
export const selectUploadProgress = (state) => state.video.uploadProgress
export const selectProcessingProgress = (state) => state.video.processingProgress
export const selectVideoStats = (state) => ({
  total: state.video.totalVideos,
  totalSize: state.video.totalSize
})
export const selectVideoFilters = (state) => state.video.filters
export const selectFilteredVideos = (state) => {
  const { videos, filters } = state.video
  const { search, sortBy, sortOrder, type } = filters

  return videos
    .filter(video => {
      if (search && !video.filename?.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (type !== 'all' && video.type !== type) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        comparison = new Date(b.uploadedAt) - new Date(a.uploadedAt)
      } else if (sortBy === 'name') {
        comparison = a.filename.localeCompare(b.filename)
      } else if (sortBy === 'size') {
        comparison = b.size - a.size
      }
      return sortOrder === 'asc' ? -comparison : comparison
    })
}

export default videoSlice.reducer