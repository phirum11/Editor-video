import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Video,
  Mic,
  Volume2,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  TrendingUp,
  Folder,
  Share2,
  HelpCircle,
  LogOut,
  Zap,
  BarChart3,
  FileText,
  Users,
  Layers
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, theme, onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const location = useLocation();

  // Notify parent of collapse state changes
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarFavorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (path) => {
    const newFavorites = favorites.includes(path)
      ? favorites.filter((p) => p !== path)
      : [...favorites, path];

    setFavorites(newFavorites);
    localStorage.setItem('sidebarFavorites', JSON.stringify(newFavorites));
  };

  // Menu items
  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
      badge: null,
      tooltip: 'Dashboard overview'
    },
    {
      path: '/video-editor',
      icon: Video,
      label: 'Video Editor',
      badge: 'PRO',
      tooltip: 'Edit videos with AI'
    },
    {
      path: '/speech-to-text',
      icon: Mic,
      label: 'Speech to Text',
      badge: 'NEW',
      tooltip: 'Convert speech to text'
    },
    {
      path: '/text-to-speech',
      icon: Volume2,
      label: 'Text to Speech',
      badge: null,
      tooltip: 'Generate speech from text'
    },
    {
      path: '/downloader',
      icon: Download,
      label: 'Downloader',
      badge: 'HOT',
      tooltip: 'Download from 1000+ sites'
    }
  ];

  const bottomItems = [
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      tooltip: 'Application settings'
    },
    {
      path: '/help',
      icon: HelpCircle,
      label: 'Help & Support',
      tooltip: 'Get help'
    }
  ];

  // Recent items (would come from actual usage data)
  const recentItems = [
    { path: '/video-editor', label: 'Video Editor', time: '2 min ago' },
    { path: '/downloader', label: 'Downloader', time: '15 min ago' },
    { path: '/speech-to-text', label: 'Speech to Text', time: '1 hour ago' }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo area */}
        <div
          className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} border-b border-gray-200 dark:border-gray-800`}
        >
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Studio Pro
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition hidden lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Navigation */}
        <nav className="h-[calc(100%-4rem)] overflow-y-auto py-4">
          {/* Main menu */}
          <div className="space-y-1 px-2">
            {menuItems.map((item) => (
              <div key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition relative ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <item.icon className={`w-5 h-5 ${isCollapsed ? '' : ''}`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            item.badge === 'PRO'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                              : item.badge === 'NEW'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(item.path);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                      >
                        <Star
                          className={`w-3 h-3 ${
                            favorites.includes(item.path)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </>
                  )}
                </NavLink>

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.tooltip || item.label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Favorites section */}
          {favorites.length > 0 && !isCollapsed && (
            <>
              <div className="mt-6 px-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Star className="w-4 h-4" />
                  <span>Favorites</span>
                </div>
              </div>
              <div className="mt-2 space-y-1 px-2">
                {favorites.map((path) => {
                  const item = menuItems.find((i) => i.path === path);
                  if (!item) return null;
                  return (
                    <NavLink
                      key={path}
                      to={path}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}

          {/* Recent items */}
          {!isCollapsed && (
            <>
              <div className="mt-6 px-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Recent</span>
                </div>
              </div>
              <div className="mt-2 space-y-1 px-2">
                {recentItems.map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.path}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                  >
                    <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-blue-500 transition" />
                    <span className="text-sm flex-1">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </NavLink>
                ))}
              </div>
            </>
          )}

          {/* Analytics section */}
          {!isCollapsed && (
            <div className="mt-6 px-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4">
                <BarChart3 className="w-8 h-8 text-white mb-2" />
                <h4 className="text-white font-semibold text-sm">
                  Pro Analytics
                </h4>
                <p className="text-white/80 text-xs mt-1">
                  Get detailed insights
                </p>
                <button className="mt-3 px-3 py-1 bg-white text-blue-600 text-xs rounded-lg hover:bg-blue-50 transition">
                  Upgrade
                </button>
              </div>
            </div>
          )}

          {/* Bottom items */}
          <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            {bottomItems.map((item) => (
              <div key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </NavLink>
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.tooltip || item.label}
                  </div>
                )}
              </div>
            ))}

            {/* Logout (always visible) */}
            <button
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 mt-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition`}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
