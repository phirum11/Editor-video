import { apiClient, handleResponse, handleError, ApiError } from './api'

class AuthService {
  constructor() {
    this.tokenKey = 'token'
    this.refreshTokenKey = 'refreshToken'
    this.userKey = 'user'
  }

  // Login
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const data = handleResponse(response)
      
      this.setTokens(data.token, data.refreshToken)
      this.setUser(data.user)
      
      return {
        success: true,
        user: data.user,
        token: data.token
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      }
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      const data = handleResponse(response)
      
      this.setTokens(data.token, data.refreshToken)
      this.setUser(data.user)
      
      return {
        success: true,
        user: data.user,
        token: data.token
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // Logout
  async logout() {
    try {
      const token = this.getToken()
      if (token) {
        await apiClient.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearTokens()
      this.clearUser()
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await apiClient.post('/auth/refresh', { refreshToken })
      const data = handleResponse(response)
      
      this.setToken(data.token)
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken)
      }
      
      return data.token
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      // Check cache first
      const cached = this.getUser()
      if (cached) {
        return { success: true, user: cached }
      }

      const response = await apiClient.get('/auth/me')
      const data = handleResponse(response)
      
      this.setUser(data.user)
      
      return {
        success: true,
        user: data.user
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user'
      }
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData)
      const data = handleResponse(response)
      
      // Update cached user
      const currentUser = this.getUser()
      this.setUser({ ...currentUser, ...data.user })
      
      return {
        success: true,
        user: data.user
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      }
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to change password'
      }
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      await apiClient.post('/auth/verify-email', { token })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Email verification failed'
      }
    }
  }

  // Resend verification email
  async resendVerification() {
    try {
      await apiClient.post('/auth/resend-verification')
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend verification'
      }
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      await apiClient.post('/auth/forgot-password', { email })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email'
      }
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset password'
      }
    }
  }

  // Token management
  setToken(token) {
    localStorage.setItem(this.tokenKey, token)
  }

  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  setRefreshToken(refreshToken) {
    localStorage.setItem(this.refreshTokenKey, refreshToken)
  }

  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey)
  }

  setTokens(token, refreshToken) {
    this.setToken(token)
    if (refreshToken) {
      this.setRefreshToken(refreshToken)
    }
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  // User management
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  getUser() {
    const user = localStorage.getItem(this.userKey)
    return user ? JSON.parse(user) : null
  }

  clearUser() {
    localStorage.removeItem(this.userKey)
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken()
  }

  // Check if token is expired
  isTokenExpired() {
    const token = this.getToken()
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  // Get token payload
  getTokenPayload() {
    const token = this.getToken()
    if (!token) return null

    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch {
      return null
    }
  }

  // Check if user has role
  hasRole(role) {
    const user = this.getUser()
    return user?.roles?.includes(role) || false
  }

  // Check if user has permission
  hasPermission(permission) {
    const user = this.getUser()
    return user?.permissions?.includes(permission) || false
  }
}

// Create singleton instance
export const authService = new AuthService()

// Hook for using auth service
export const useAuth = () => {
  return authService
}

export default authService