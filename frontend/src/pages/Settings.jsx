import React, { useState, useEffect } from 'react'
import {
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Volume2,
  Download,
  CreditCard,
  Key,
  Mail,
  Smartphone,
  Clock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  AlertCircle,
  Check,
  X,
  Moon,
  Sun,
  Monitor,
  Languages,
  HardDrive,
  Zap,
  Lock,
  Unlock,
  Fingerprint,
  QrCode,
  LogOut,
  History
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Tabs, { TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'

const Settings = () => {
  const { user, updateUser, changePassword } = useAuth()
  const { theme, setTheme, themes } = useTheme()
  const { success, error: showError } = useToast()

  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    language: 'en',
    timezone: 'UTC'
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    weeklyDigest: true,
    downloadComplete: true,
    processingComplete: true,
    accountAlerts: true
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showActivity: true,
    allowDataCollection: true,
    twoFactorAuth: false
  })

  // Storage settings
  const [storage, setStorage] = useState({
    used: 45.2,
    total: 100,
    autoDelete: false,
    deleteAfter: 30,
    compression: true
  })

  // Password change
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  // Load user data
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        language: user.language || 'en',
        timezone: user.timezone || 'UTC'
      })
    }
  }, [user])

  // Handle profile update
  const handleProfileUpdate = async () => {
    setIsSaving(true)
    try {
      await updateUser(profile)
      success('Profile updated successfully')
    } catch (err) {
      showError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showError('New passwords do not match')
      return
    }

    if (passwordData.new.length < 8) {
      showError('Password must be at least 8 characters')
      return
    }

    setIsSaving(true)
    try {
      await changePassword(passwordData.current, passwordData.new)
      success('Password changed successfully')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (err) {
      showError('Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle two-factor setup
  const handleTwoFactorSetup = () => {
    success('Two-factor authentication setup (demo)')
  }

  // Handle data export
  const handleDataExport = () => {
    success('Data export started. You will receive an email when ready.')
  }

  // Handle account deletion
  const handleAccountDelete = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      success('Account deletion request submitted (demo)')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Privacy & Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4" />
            <span>Storage</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <select
                      value={profile.language}
                      onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    >
                      <option value="en">English</option>
                      <option value="km">Khmer</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                      Timezone
                    </label>
                    <select
                      value={profile.timezone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Asia/Bangkok">Indochina Time</option>
                      <option value="Asia/Tokyo">Japan Time</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleProfileUpdate}
                    loading={isSaving}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {profile.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {profile.name || 'Your Name'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {profile.email}
                </p>

                <div className="space-y-2 text-left">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Member since Jan 2024
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <History className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      156 projects created
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      45.2 GB used
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Marketing Emails</p>
                      <p className="text-xs text-gray-500">Receive updates about new features</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.marketingEmails}
                      onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Weekly Digest</p>
                      <p className="text-xs text-gray-500">Get a weekly summary of your activity</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weeklyDigest}
                      onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-xs text-gray-500">Receive notifications in your browser</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Download Complete</p>
                      <p className="text-xs text-gray-500">Get notified when downloads finish</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.downloadComplete}
                      onChange={(e) => setNotifications({ ...notifications, downloadComplete: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Processing Complete</p>
                      <p className="text-xs text-gray-500">Get notified when processing finishes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.processingComplete}
                      onChange={(e) => setNotifications({ ...notifications, processingComplete: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" icon={Save}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Profile Visibility
                  </label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Show Email</p>
                      <p className="text-xs text-gray-500">Display your email on your profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Show Phone</p>
                      <p className="text-xs text-gray-500">Display your phone number on your profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showPhone}
                      onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Show Activity</p>
                      <p className="text-xs text-gray-500">Show your recent activity on your profile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showActivity}
                      onChange={(e) => setPrivacy({ ...privacy, showActivity: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Data Collection</p>
                      <p className="text-xs text-gray-500">Allow anonymous data collection to improve the service</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.allowDataCollection}
                      onChange={(e) => setPrivacy({ ...privacy, allowDataCollection: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                      <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button
                      variant={privacy.twoFactorAuth ? 'success' : 'outline'}
                      size="sm"
                      onClick={handleTwoFactorSetup}
                    >
                      {privacy.twoFactorAuth ? 'Enabled' : 'Enable'}
                    </Button>
                  </div>

                  {privacy.twoFactorAuth && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <QrCode className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Scan QR Code</p>
                          <p className="text-xs text-gray-500">Use an authenticator app to scan</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter verification code"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Change Password */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Change Password</h3>
                  
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Current Password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pr-10"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New Password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pr-10"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm New Password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pr-10"
                    />
                    
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePasswordChange}
                    loading={isSaving}
                    className="w-full"
                  >
                    Update Password
                  </Button>
                </div>

                {/* Active Sessions */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Active Sessions</h3>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Current Session</p>
                        <p className="text-xs text-gray-500">Chrome on Windows • IP: 192.168.1.1</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(themes).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`p-4 rounded-lg border-2 transition ${
                      theme === key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-20 rounded-lg mb-2" style={{ backgroundColor: value.colors.primary }} />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{value.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Used Storage</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {storage.used} GB / {storage.total} GB
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(storage.used / storage.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Storage Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">25.3 GB</p>
                  <p className="text-xs text-gray-500">Videos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12.8 GB</p>
                  <p className="text-xs text-gray-500">Audio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">7.1 GB</p>
                  <p className="text-xs text-gray-500">Other</p>
                </div>
              </div>

              {/* Storage Settings */}
              <div className="space-y-3 pt-4">
                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-delete old files</p>
                    <p className="text-xs text-gray-500">Automatically delete files older than selected period</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={storage.autoDelete}
                    onChange={(e) => setStorage({ ...storage, autoDelete: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>

                {storage.autoDelete && (
                  <div className="pl-4">
                    <select
                      value={storage.deleteAfter}
                      onChange={(e) => setStorage({ ...storage, deleteAfter: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    >
                      <option value="7">After 7 days</option>
                      <option value="30">After 30 days</option>
                      <option value="60">After 60 days</option>
                      <option value="90">After 90 days</option>
                    </select>
                  </div>
                )}

                <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Compress files</p>
                    <p className="text-xs text-gray-500">Automatically compress files to save space</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={storage.compression}
                    onChange={(e) => setStorage({ ...storage, compression: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
              </div>

              {/* Storage Actions */}
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" icon={RefreshCw}>
                  Refresh
                </Button>
                <Button variant="outline" icon={Trash2} className="text-red-600">
                  Clean Up
                </Button>
                <Button variant="primary" icon={CreditCard} className="ml-auto">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Export */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Export Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Download all your data including projects, settings, and activity history
                </p>
                <Button variant="outline" onClick={handleDataExport} icon={Download}>
                  Request Data Export
                </Button>
              </div>

              {/* API Access */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">API Access</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">API Key</p>
                      <p className="text-xs text-gray-500">••••••••••••••••</p>
                    </div>
                    <Button variant="ghost" size="sm">Regenerate</Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your API key has access to all your resources. Keep it secure.
                  </p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-500 mb-3">Danger Zone</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="danger"
                      onClick={handleAccountDelete}
                      icon={Trash2}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings