import React from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    })

    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo)

    // Send to error tracking service (optional)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  // Reset error state
  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  // Reload page
  handleReload = () => {
    window.location.reload()
  }

  // Go back
  handleGoBack = () => {
    window.history.back()
  }

  // Go home
  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isDev = process.env.NODE_ENV === 'development'

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-white mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-red-100">
                We're sorry for the inconvenience. Please try again.
              </p>
            </div>

            {/* Error details (development only) */}
            {isDev && this.state.error && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Error Details (Development)
                </h2>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Error count */}
            {this.state.errorCount > 1 && (
              <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ This error has occurred {this.state.errorCount} times.
                  {this.state.errorCount > 3 && ' There might be a persistent issue.'}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex flex-wrap gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              
              <button
                onClick={this.handleGoBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>
            </div>

            {/* Support contact */}
            <div className="p-6 text-center border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If this problem persists, please contact our support team at{' '}
                <a
                  href="mailto:support@aistudio.com"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  support@aistudio.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC for error boundary
export const withErrorBoundary = (WrappedComponent, fallback) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

// Route error boundary
export const RouteErrorBoundary = ({ error }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Route Error
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error?.message || 'An error occurred while loading this route.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}

export default ErrorBoundary