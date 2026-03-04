import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import sttService from '../services/sttService'
import ttsService from '../services/ttsService'

// Initial state
const initialState = {
  transcriptions: [],
  currentTranscription: null,
  ttsTasks: [],
  currentTTS: null,
  voices: [],
  selectedVoice: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  transcriptionProgress: 0,
  ttsProgress: 0,
  stats: {
    totalTranscribed: 0,
    totalHours: 0,
    totalGenerated: 0,
    totalDuration: 0
  }
}

// Async thunks for STT
export const transcribeAudio = createAsyncThunk(
  'audio/transcribe',
  async ({ file, options, onProgress }, { rejectWithValue }) => {
    try {
      const response = await sttService.transcribe(file, { ...options, onProgress })
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to transcribe audio')
    }
  }
)

export const getTranscriptionStatus = createAsyncThunk(
  'audio/getTranscriptionStatus',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await sttService.getStatus(taskId)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get transcription status')
    }
  }
)

export const getTranscriptionResult = createAsyncThunk(
  'audio/getTranscriptionResult',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await sttService.getResult(taskId)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get transcription result')
    }
  }
)

export const cancelTranscription = createAsyncThunk(
  'audio/cancelTranscription',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await sttService.cancel(taskId)
      if (response.success) {
        return { taskId }
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel transcription')
    }
  }
)

// Async thunks for TTS
export const generateSpeech = createAsyncThunk(
  'audio/generateSpeech',
  async ({ text, options }, { rejectWithValue }) => {
    try {
      const response = await ttsService.generateSpeech(text, options)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate speech')
    }
  }
)

export const batchGenerateSpeech = createAsyncThunk(
  'audio/batchGenerate',
  async ({ segments, options }, { rejectWithValue }) => {
    try {
      const response = await ttsService.batchGenerate(segments, options)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to batch generate speech')
    }
  }
)

export const getTTSStatus = createAsyncThunk(
  'audio/getTTSStatus',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await ttsService.getStatus(taskId)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get TTS status')
    }
  }
)

export const getBatchResult = createAsyncThunk(
  'audio/getBatchResult',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await ttsService.getBatchResult(taskId)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get batch result')
    }
  }
)

export const listVoices = createAsyncThunk(
  'audio/listVoices',
  async (language, { rejectWithValue }) => {
    try {
      const response = await ttsService.listVoices(language)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to list voices')
    }
  }
)

export const getVoice = createAsyncThunk(
  'audio/getVoice',
  async (voiceId, { rejectWithValue }) => {
    try {
      const response = await ttsService.getVoice(voiceId)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get voice details')
    }
  }
)

export const previewVoice = createAsyncThunk(
  'audio/previewVoice',
  async ({ voice, text }, { rejectWithValue }) => {
    try {
      const response = await ttsService.previewVoice(voice, text)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to preview voice')
    }
  }
)

// Audio slice
const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentTranscription: (state, action) => {
      state.currentTranscription = action.payload
    },
    clearCurrentTranscription: (state) => {
      state.currentTranscription = null
    },
    setSelectedVoice: (state, action) => {
      state.selectedVoice = action.payload
    },
    clearSelectedVoice: (state) => {
      state.selectedVoice = null
    },
    setTranscriptionProgress: (state, action) => {
      state.transcriptionProgress = action.payload
    },
    setTTSProgress: (state, action) => {
      state.ttsProgress = action.payload
    },
    addTranscription: (state, action) => {
      state.transcriptions.push(action.payload)
      state.stats.totalTranscribed++
      state.stats.totalHours += (action.payload.duration || 0) / 3600
    },
    removeTranscription: (state, action) => {
      const transcription = state.transcriptions.find(t => t.id === action.payload)
      if (transcription) {
        state.stats.totalHours -= (transcription.duration || 0) / 3600
        state.stats.totalTranscribed--
      }
      state.transcriptions = state.transcriptions.filter(t => t.id !== action.payload)
    },
    updateTranscription: (state, action) => {
      const index = state.transcriptions.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.transcriptions[index] = { ...state.transcriptions[index], ...action.payload }
      }
    },
    clearTranscriptions: (state) => {
      state.transcriptions = []
      state.stats.totalTranscribed = 0
      state.stats.totalHours = 0
    },
    addTTSTask: (state, action) => {
      state.ttsTasks.push(action.payload)
      state.stats.totalGenerated++
      if (action.payload.duration) {
        state.stats.totalDuration += action.payload.duration
      }
    },
    updateTTSTask: (state, action) => {
      const index = state.ttsTasks.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.ttsTasks[index] = { ...state.ttsTasks[index], ...action.payload }
      }
    },
    removeTTSTask: (state, action) => {
      const task = state.ttsTasks.find(t => t.id === action.payload)
      if (task?.duration) {
        state.stats.totalDuration -= task.duration
        state.stats.totalGenerated--
      }
      state.ttsTasks = state.ttsTasks.filter(t => t.id !== action.payload)
    },
    clearTTSTasks: (state) => {
      state.ttsTasks = []
      state.stats.totalGenerated = 0
      state.stats.totalDuration = 0
    }
  },
  extraReducers: (builder) => {
    // Transcribe audio
    builder.addCase(transcribeAudio.pending, (state) => {
      state.isProcessing = true
      state.error = null
      state.transcriptionProgress = 0
    })
    builder.addCase(transcribeAudio.fulfilled, (state, action) => {
      state.isProcessing = false
      state.transcriptionProgress = 100
      // Task will be added when status is checked
    })
    builder.addCase(transcribeAudio.rejected, (state, action) => {
      state.isProcessing = false
      state.transcriptionProgress = 0
      state.error = action.payload || 'Failed to transcribe audio'
    })

    // Get transcription status
    builder.addCase(getTranscriptionStatus.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(getTranscriptionStatus.fulfilled, (state, action) => {
      state.isLoading = false
      state.transcriptionProgress = action.payload.progress || 0
    })
    builder.addCase(getTranscriptionStatus.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get transcription status'
    })

    // Get transcription result
    builder.addCase(getTranscriptionResult.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(getTranscriptionResult.fulfilled, (state, action) => {
      state.isLoading = false
      state.transcriptions.push({
        id: action.meta.arg,
        ...action.payload,
        createdAt: new Date().toISOString()
      })
      state.stats.totalTranscribed++
      state.stats.totalHours += (action.payload.duration || 0) / 3600
    })
    builder.addCase(getTranscriptionResult.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get transcription result'
    })

    // Cancel transcription
    builder.addCase(cancelTranscription.fulfilled, (state, action) => {
      // Task removed by service
    })

    // Generate speech
    builder.addCase(generateSpeech.pending, (state) => {
      state.isProcessing = true
      state.error = null
      state.ttsProgress = 0
    })
    builder.addCase(generateSpeech.fulfilled, (state, action) => {
      state.isProcessing = false
      state.ttsProgress = 100
      // Task will be added when status is checked
    })
    builder.addCase(generateSpeech.rejected, (state, action) => {
      state.isProcessing = false
      state.ttsProgress = 0
      state.error = action.payload || 'Failed to generate speech'
    })

    // Batch generate
    builder.addCase(batchGenerateSpeech.pending, (state) => {
      state.isProcessing = true
      state.error = null
      state.ttsProgress = 0
    })
    builder.addCase(batchGenerateSpeech.fulfilled, (state, action) => {
      state.isProcessing = false
      state.ttsTasks.push({
        id: action.payload.taskId,
        type: 'batch',
        status: 'pending',
        total: action.payload.total,
        completed: 0,
        createdAt: new Date().toISOString()
      })
    })
    builder.addCase(batchGenerateSpeech.rejected, (state, action) => {
      state.isProcessing = false
      state.ttsProgress = 0
      state.error = action.payload || 'Failed to batch generate speech'
    })

    // Get TTS status
    builder.addCase(getTTSStatus.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(getTTSStatus.fulfilled, (state, action) => {
      state.isLoading = false
      const taskIndex = state.ttsTasks.findIndex(t => t.id === action.meta.arg)
      if (taskIndex !== -1) {
        state.ttsTasks[taskIndex] = {
          ...state.ttsTasks[taskIndex],
          ...action.payload
        }
      }
      state.ttsProgress = action.payload.progress || 0
    })
    builder.addCase(getTTSStatus.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get TTS status'
    })

    // Get batch result
    builder.addCase(getBatchResult.fulfilled, (state, action) => {
      const taskIndex = state.ttsTasks.findIndex(t => t.id === action.meta.arg)
      if (taskIndex !== -1) {
        state.ttsTasks[taskIndex].result = action.payload
        state.stats.totalGenerated += action.payload.successful || 0
        state.stats.totalDuration += action.payload.totalDuration || 0
      }
    })

    // List voices
    builder.addCase(listVoices.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(listVoices.fulfilled, (state, action) => {
      state.isLoading = false
      state.voices = action.payload.voices
    })
    builder.addCase(listVoices.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to list voices'
    })

    // Get voice
    builder.addCase(getVoice.fulfilled, (state, action) => {
      // Voice details can be accessed via selector
    })

    // Preview voice
    builder.addCase(previewVoice.fulfilled, (state, action) => {
      // Preview task will be handled separately
    })
  }
})

// Actions
export const {
  clearError,
  setCurrentTranscription,
  clearCurrentTranscription,
  setSelectedVoice,
  clearSelectedVoice,
  setTranscriptionProgress,
  setTTSProgress,
  addTranscription,
  removeTranscription,
  updateTranscription,
  clearTranscriptions,
  addTTSTask,
  updateTTSTask,
  removeTTSTask,
  clearTTSTasks
} = audioSlice.actions

// Selectors
export const selectTranscriptions = (state) => state.audio.transcriptions
export const selectCurrentTranscription = (state) => state.audio.currentTranscription
export const selectTTSTasks = (state) => state.audio.ttsTasks
export const selectCurrentTTS = (state) => state.audio.currentTTS
export const selectVoices = (state) => state.audio.voices
export const selectSelectedVoice = (state) => state.audio.selectedVoice
export const selectAudioLoading = (state) => state.audio.isLoading
export const selectAudioProcessing = (state) => state.audio.isProcessing
export const selectAudioError = (state) => state.audio.error
export const selectTranscriptionProgress = (state) => state.audio.transcriptionProgress
export const selectTTSProgress = (state) => state.audio.ttsProgress
export const selectAudioStats = (state) => state.audio.stats

export default audioSlice.reducer