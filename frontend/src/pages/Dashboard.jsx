import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  Mic,
  Volume2,
  Download,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Upload,
  Heart,
  MessageCircle,
  Star,
  Zap,
  Globe,
  BarChart3,
  FileText,
  Music,
  Film,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Timer,
  HardDrive,
  Cpu,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

// ─── Mock Data ─────────────────────────────────────────────────

const activityData = [
  { name: 'Mon', videos: 24, audio: 18, downloads: 32 },
  { name: 'Tue', videos: 38, audio: 24, downloads: 45 },
  { name: 'Wed', videos: 30, audio: 20, downloads: 36 },
  { name: 'Thu', videos: 44, audio: 30, downloads: 50 },
  { name: 'Fri', videos: 36, audio: 28, downloads: 42 },
  { name: 'Sat', videos: 20, audio: 12, downloads: 24 },
  { name: 'Sun', videos: 16, audio: 10, downloads: 18 }
];

const pieData = [
  { name: 'Videos', value: 245, color: '#6366f1' },
  { name: 'Audio', value: 128, color: '#8b5cf6' },
  { name: 'Projects', value: 83, color: '#a78bfa' },
  { name: 'Other', value: 45, color: '#c4b5fd' }
];

const recentActivities = [];

// ─── Subcomponents ─────────────────────────────────────────────

const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  iconBg,
  iconColor,
  borderAccent
}) => (
  <div className="relative group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
    {/* Top accent border */}
    <div
      className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${borderAccent} opacity-80`}
    />

    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {change !== undefined && (
        <div
          className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
            change >= 0
              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50'
              : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/50'
          }`}
        >
          {change >= 0 ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);

const ActivityItem = ({ activity, isLast }) => {
  const icons = { video: Film, audio: Music, download: Download, tts: Volume2 };
  const colors = {
    video: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    audio: {
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      icon: 'text-violet-600 dark:text-violet-400'
    },
    download: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      icon: 'text-amber-600 dark:text-amber-400'
    },
    tts: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      icon: 'text-emerald-600 dark:text-emerald-400'
    }
  };
  const Icon = icons[activity.type] || FileText;
  const color = colors[activity.type] || colors.video;

  const statusStyles = {
    completed:
      'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40',
    processing:
      'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40',
    failed: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40'
  };

  return (
    <div
      className={`flex items-center gap-4 py-3.5 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${!isLast ? 'border-b border-gray-100 dark:border-gray-800/50' : ''}`}
    >
      <div className={`p-2.5 rounded-xl ${color.bg} shrink-0`}>
        <Icon className={`w-4 h-4 ${color.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activity.action}{' '}
            <span className="text-gray-500 dark:text-gray-400 font-normal">
              — {activity.name}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {activity.time}
          </span>
          {activity.size && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              • {activity.size}
            </span>
          )}
          {activity.progress && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${activity.progress}%` }}
                />
              </div>
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {activity.progress}%
              </span>
            </div>
          )}
        </div>
      </div>
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 capitalize ${statusStyles[activity.status] || ''}`}
      >
        {activity.status}
      </span>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 min-w-[140px]">
      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-500 dark:text-gray-400 capitalize">
              {entry.dataKey}
            </span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [showNotifications, setShowNotifications] = useState(false);

  const stats = useMemo(
    () => ({
      totalVideos: 1247,
      totalAudio: 892,
      totalDownloads: 3456,
      activeUsers: 12890,
      storageUsed: 456,
      storageTotal: 1024
    }),
    []
  );

  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle2,
      message: 'Video processing complete',
      time: '5 min ago',
      read: false
    },
    {
      id: 2,
      type: 'info',
      icon: Sparkles,
      message: 'New AI model available',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      icon: AlertCircle,
      message: 'Storage almost full (89%)',
      time: '2 hours ago',
      read: true
    }
  ];

  const quickActions = [
    {
      icon: Video,
      label: 'Edit Video',
      desc: 'Open video editor',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Mic,
      label: 'Transcribe',
      desc: 'Speech to text',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: Volume2,
      label: 'Text to Speech',
      desc: 'Generate audio',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Download,
      label: 'Download',
      desc: 'Fetch from URL',
      gradient: 'from-amber-500 to-orange-500'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const storagePercent = (
    (stats.storageUsed / stats.storageTotal) *
    100
  ).toFixed(0);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}{' '}
            <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">
              👋
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Here's an overview of your projects and activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Notifications
                  </h3>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition ${
                        !n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <n.icon
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          n.type === 'success'
                            ? 'text-emerald-500'
                            : n.type === 'warning'
                              ? 'text-amber-500'
                              : 'text-indigo-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Film}
          label="Total Videos"
          value={stats.totalVideos}
          change={12.5}
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
          borderAccent="from-blue-500 to-blue-400"
        />
        <StatCard
          icon={Music}
          label="Total Audio"
          value={stats.totalAudio}
          change={8.3}
          iconBg="bg-violet-50 dark:bg-violet-950/40"
          iconColor="text-violet-600 dark:text-violet-400"
          borderAccent="from-violet-500 to-purple-400"
        />
        <StatCard
          icon={Download}
          label="Downloads"
          value={stats.totalDownloads}
          change={-2.1}
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          iconColor="text-amber-600 dark:text-amber-400"
          borderAccent="from-amber-500 to-orange-400"
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={stats.activeUsers}
          change={23.5}
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
          borderAccent="from-emerald-500 to-teal-400"
        />
      </div>

      {/* ── Charts Row ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Activity Overview
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Content processed this week
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-gray-500 dark:text-gray-400">Videos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <span className="text-gray-500 dark:text-gray-400">Audio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-gray-500 dark:text-gray-400">
                  Downloads
                </span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activityData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradVideos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAudio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="gradDownloads"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  className="text-gray-100 dark:text-gray-800"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="videos"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#gradVideos)"
                />
                <Area
                  type="monotone"
                  dataKey="audio"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  fill="url(#gradAudio)"
                />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fill="url(#gradDownloads)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Usage Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Storage
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {stats.storageUsed} GB of {stats.storageTotal} GB used
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {storagePercent}%
            </div>
          </div>

          {/* Donut Chart */}
          <div className="flex-1 flex items-center justify-center py-2">
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} GB`, name]}
                    contentStyle={{
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <HardDrive className="w-4 h-4 text-gray-400 mb-0.5" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.storageUsed}
                </span>
                <span className="text-[10px] text-gray-400">GB used</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2.5 mt-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value} GB
                </span>
              </div>
            ))}
          </div>

          {/* Upgrade */}
          <button className="mt-4 w-full py-2.5 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-medium text-sm rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
            Upgrade Storage
          </button>
        </div>
      </div>

      {/* ── Activity & Quick Actions Row ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Your latest actions
              </p>
            </div>
            <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            {recentActivities.map((activity, i) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={i === recentActivities.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions + Performance */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className="group relative p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left"
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-2.5 shadow-sm`}
                  >
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {action.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              System Health
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Processing
                  </span>
                </div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  98.5%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                    <Timer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Time
                  </span>
                </div>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  1.2s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40">
                    <Layers className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Jobs
                  </span>
                </div>
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  12
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40">
                    <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    API Uptime
                  </span>
                </div>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  99.9%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bar Chart Row ────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Weekly Comparison
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Videos vs Audio processed per day
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span className="text-gray-500 dark:text-gray-400">Videos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded bg-violet-300 dark:bg-violet-400" />
              <span className="text-gray-500 dark:text-gray-400">Audio</span>
            </div>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activityData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-100 dark:text-gray-800"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="videos"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="audio"
                fill="#c4b5fd"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
