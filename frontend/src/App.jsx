import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ROUTES } from './utils/constants';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const VideoEditor = lazy(() => import('./pages/VideoEditor'));
const SpeechToText = lazy(() => import('./pages/SpeechToText'));
const TextToSpeech = lazy(() => import('./pages/TextToSpeech'));
const Downloader = lazy(() => import('./pages/Downloader'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading page..." />
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children;
};

// Public Route wrapper (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

function App() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const location = useLocation();

  // Track page views (analytics)
  useEffect(() => {
    const pageView = {
      path: location.pathname,
      timestamp: new Date().toISOString(),
      title: document.title
    };

    // Send to analytics (implement as needed)
    if (import.meta.env.PROD) {
      // analytics.track(pageView)
    }

    console.log('Page view:', pageView);
  }, [location]);

  // Handle offline/online events
  useEffect(() => {
    const handleOnline = () => {
      showToast({
        type: 'success',
        message: 'You are back online!',
        duration: 3000
      });
    };

    const handleOffline = () => {
      showToast({
        type: 'warning',
        message: 'You are offline. Some features may be unavailable.',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Handle before unload (save state)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Save any unsaved changes
      const message =
        'You have unsaved changes. Are you sure you want to leave?';
      e.returnValue = message;
      return message;
    };

    // Add listener when there are unsaved changes
    // window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

            <Route
              path={ROUTES.DASHBOARD}
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />

            <Route
              path={ROUTES.VIDEO_EDITOR}
              element={
                <Suspense fallback={<PageLoader />}>
                  <VideoEditor />
                </Suspense>
              }
            />

            <Route
              path={ROUTES.SPEECH_TO_TEXT}
              element={
                <Suspense fallback={<PageLoader />}>
                  <SpeechToText />
                </Suspense>
              }
            />

            <Route
              path={ROUTES.TEXT_TO_SPEECH}
              element={
                <Suspense fallback={<PageLoader />}>
                  <TextToSpeech />
                </Suspense>
              }
            />

            <Route
              path={ROUTES.DOWNLOADER}
              element={
                <Suspense fallback={<PageLoader />}>
                  <Downloader />
                </Suspense>
              }
            />

            <Route
              path={ROUTES.SETTINGS}
              element={
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

// App configuration
App.displayName = 'App';

// App metadata
export const appConfig = {
  name: 'AI Studio Pro',
  version: '1.0.0',
  description: 'Professional AI-powered audio and video processing suite',
  author: 'AI Studio Team',
  repository: 'https://github.com/aistudio/web-app',
  keywords: [
    'video editing',
    'audio processing',
    'speech to text',
    'text to speech',
    'AI',
    'machine learning',
    'download manager'
  ]
};

// Initialize app
export const initializeApp = async () => {
  // Load any initial data or configurations
  console.log('Initializing app...');

  try {
    // Check for updates
    const { APP_VERSION } = await import('./utils/constants');

    // Compare versions
    const lastVersion = localStorage.getItem('app_version');
    if (lastVersion !== APP_VERSION) {
      console.log(`App updated from ${lastVersion} to ${APP_VERSION}`);
      localStorage.setItem('app_version', APP_VERSION);

      // Clear cache if major version change
      if (
        lastVersion &&
        lastVersion.split('.')[0] !== APP_VERSION.split('.')[0]
      ) {
        console.log('Major version update detected, clearing cache...');
        // Clear relevant caches
      }
    }

    // Load user preferences
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.add(theme);

    // Initialize analytics
    if (import.meta.env.PROD) {
      // Initialize analytics
    }

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// App error handler
export const handleAppError = (error, errorInfo) => {
  console.error('App error:', error, errorInfo);

  // Send to error tracking service
  if (import.meta.env.PROD) {
    // errorTracking.captureException(error, { extra: errorInfo })
  }

  // Show user-friendly error message
  // toast.error('An unexpected error occurred. Please try again.')
};

// App cleanup
export const cleanupApp = () => {
  console.log('Cleaning up app...');

  // Clear any intervals
  // Remove event listeners
  // Save state
};

export default App;
