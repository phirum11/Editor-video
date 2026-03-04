import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
  refreshToken: null,
  permissions: [],
  roles: []
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return {}
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser()
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get user')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update profile')
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to change password')
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await authService.refreshToken()
      return { token }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to refresh token')
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send reset email')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, newPassword)
      if (response.success) {
        return response
      }
      return rejectWithValue(response.error)
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reset password')
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      state.refreshToken = null
      state.permissions = []
      state.roles = []
    },
    setTokens: (state, action) => {
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
    },
    updateUserField: (state, action) => {
      const { field, value } = action.payload
      if (state.user) {
        state.user[field] = value
      }
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.permissions = action.payload.user?.permissions || []
      state.roles = action.payload.user?.roles || []
    })
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Login failed'
    })

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.permissions = action.payload.user?.permissions || []
      state.roles = action.payload.user?.roles || []
    })
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Registration failed'
    })

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false
      state.user = null
      state.isAuthenticated = false
      state.token = null
      state.refreshToken = null
      state.permissions = []
      state.roles = []
      state.error = null
    })
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Logout failed'
    })

    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.permissions = action.payload.user?.permissions || []
      state.roles = action.payload.user?.roles || []
    })
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to get user'
    })

    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false
      state.user = action.payload.user
    })
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to update profile'
    })

    // Change password
    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(changePassword.fulfilled, (state) => {
      state.isLoading = false
    })
    builder.addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to change password'
    })

    // Refresh token
    builder.addCase(refreshToken.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.isLoading = false
      state.token = action.payload.token
    })
    builder.addCase(refreshToken.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to refresh token'
    })

    // Forgot password
    builder.addCase(forgotPassword.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.isLoading = false
    })
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to send reset email'
    })

    // Reset password
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false
    })
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload || 'Failed to reset password'
    })
  }
})

// Actions
export const { clearError, setUser, clearUser, setTokens, updateUserField } = authSlice.actions

// Selectors
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error
export const selectToken = (state) => state.auth.token
export const selectRefreshToken = (state) => state.auth.refreshToken
export const selectPermissions = (state) => state.auth.permissions
export const selectRoles = (state) => state.auth.roles
export const selectHasRole = (state, role) => state.auth.roles?.includes(role)
export const selectHasPermission = (state, permission) => state.auth.permissions?.includes(permission)

export default authSlice.reducer