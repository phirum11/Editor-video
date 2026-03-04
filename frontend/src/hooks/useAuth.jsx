import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext
} from 'react';

// Create auth context
const AuthContext = createContext();

// Auth Provider Component
// Helper to safely read JSON from localStorage
const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Load / validate user from token
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // If we already have a cached user, mark ready immediately
      // and refresh in background
      const cached = readStoredUser();
      if (cached) {
        setUser(cached);
        setLoading(false);
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401 || response.status === 403) {
          // Token is explicitly invalid — clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
        // For other errors (500, network), keep cached user
      } catch (err) {
        // Network error / backend down — keep cached user
        console.warn(
          'Auth check failed (backend may be offline):',
          err.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Google Login
  const googleLogin = useCallback(async (credentialResponse) => {
    setLoading(true);
    setError(null);

    try {
      // Send Google token to backend for verification
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          clientId: credentialResponse.clientId
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }

      // Fallback: use Google profile directly if backend isn't ready
      const userInfo = credentialResponse.userInfo || {};
      const googleUser = {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
        provider: 'google',
        emailVerified: userInfo.email_verified
      };

      const fallbackToken = credentialResponse.credential;
      localStorage.setItem('token', fallbackToken);
      setToken(fallbackToken);
      setUser(googleUser);

      return { success: true, user: googleUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, [token]);

  // Update user
  const updateUser = useCallback(
    async (updates) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Update failed');
        }

        setUser(data.user);
        return { success: true, user: data.user };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Change password
  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Password change failed');
        }

        return { success: true };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token refresh error:', err);
      return false;
    }
  }, [token]);

  // Check if user has role
  const hasRole = useCallback(
    (role) => {
      return user?.roles?.includes(role) || false;
    },
    [user]
  );

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Auto refresh token
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(
      () => {
        refreshToken();
      },
      15 * 60 * 1000
    ); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [token, refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        changePassword,
        refreshToken,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected route hook
export const useProtectedRoute = (requiredRole = null) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setAuthorized(false);
        window.location.href = '/login';
      } else if (requiredRole && !user?.roles?.includes(requiredRole)) {
        setAuthorized(false);
        window.location.href = '/unauthorized';
      } else {
        setAuthorized(true);
      }
    }
  }, [isAuthenticated, loading, user, requiredRole]);

  return { authorized, loading };
};

// Admin hook
export const useAdmin = () => {
  return useProtectedRoute('admin');
};

// Guest hook (redirect if authenticated)
export const useGuest = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, loading]);

  return { isGuest: !isAuthenticated, loading };
};
