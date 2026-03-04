import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardContent } from '../components/ui/Card'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-2xl w-full text-center">
        <CardContent className="p-12">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle className="w-24 h-24 text-gray-300 dark:text-gray-700 opacity-20" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Search suggestion */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Search className="w-4 h-4" />
              <span>Looking for something? Try these popular pages:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/dashboard"
                className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/video-editor"
                className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Video Editor
              </Link>
              <Link
                to="/speech-to-text"
                className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Speech to Text
              </Link>
              <Link
                to="/text-to-speech"
                className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Text to Speech
              </Link>
              <Link
                to="/downloader"
                className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                Downloader
              </Link>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              icon={ArrowLeft}
            >
              Go Back
            </Button>
            <Link to="/">
              <Button variant="primary" icon={Home}>
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Fun facts */}
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
            <p>Did you know? The average user visits 3-5 pages per session.</p>
            <p className="mt-1">You've found our secret 404 page! 🎉</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFound