import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaRobot, FaChartBar, FaUser, FaSignOutAlt, FaBars, FaStore, FaSuitcase, FaBook, FaLaptopCode, FaTrophy, FaMoon, FaSun, FaSchool, FaGraduationCap, FaListUl, FaBell, FaSearch } from 'react-icons/fa';
import { MdReportProblem } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import GlobalSearch from './GlobalSearch';
import axios from 'axios';
import API_URL from '../config';

const Sidebar = ({ onLogout, isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  // Poll unread notification count every 30s
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/social/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setUnreadCount(res.data.count);
      } catch { }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Ctrl+K / Cmd+K opens global search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/social', label: 'Social', icon: <FaUsers /> },
    { path: '/ask-ai', label: 'Ask AI', icon: <FaRobot className="text-purple-400" /> },
    { path: '/ai-questions', label: 'AI Questions', icon: <FaGraduationCap className="text-emerald-400" /> },
    { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },
    { path: '/school-analytics', label: 'School Analytics', icon: <FaSchool /> },
    { path: '/problems', label: 'Problems', icon: <MdReportProblem /> },
    { path: '/contest', label: 'Contest', icon: <FaTrophy /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FaTrophy className="text-yellow-400" /> },
    { path: '/theory', label: 'Theory', icon: <FaBook /> },
    { path: '/ide', label: 'Projects', icon: <FaLaptopCode /> },
    { path: '/playlists', label: 'Playlists', icon: <FaListUl /> },
    { path: '/store', label: 'Store', icon: <FaStore /> },
    { path: '/jobs', label: 'Jobs', icon: <FaSuitcase /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> },
  ];

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className={`bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 backdrop-blur-md shadow-xl h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} z-50`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          {isOpen && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <Logo showText={true} className="w-8 h-8" textSize="text-xl" />
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"
          >
            <FaBars />
          </button>
        </div>

        {/* Search button */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setSearchOpen(true)}
            className={`w-full flex items-center ${isOpen ? 'px-3 py-2 gap-2' : 'justify-center py-3'} text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors`}
            title="Search (Ctrl+K)"
          >
            <FaSearch className="flex-shrink-0" />
            {isOpen && <span className="flex-1 text-left">Search...</span>}
            {isOpen && <kbd className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono text-gray-400">⌘K</kbd>}
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 mt-1">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`relative flex items-center ${isOpen ? 'px-4 py-2' : 'px-2 py-3 justify-center'} rounded-md text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <span className={`relative ${isOpen ? 'mr-3' : ''}`}>
                    {item.icon}
                    {/* Notification badge on Notifications link */}
                    {item.path === '/notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                    )}
                  </span>
                  {isOpen && (
                    <span className="flex-1">{item.label}</span>
                  )}
                  {/* Badge count when sidebar open */}
                  {isOpen && item.path === '/notifications' && unreadCount > 0 && (
                    <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold min-w-[1.25rem] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {/* Notifications shortcut */}
          <Link
            to="/notifications"
            className={`w-full flex items-center ${isOpen ? 'px-4 py-2 justify-start gap-3' : 'px-2 py-3 justify-center'} text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 rounded-md transition-colors relative`}
          >
            <span className="relative flex-shrink-0">
              <FaBell />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
              )}
            </span>
            {isOpen && <span>Notifications</span>}
            {isOpen && unreadCount > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold min-w-[1.25rem] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${isOpen ? 'px-4 py-2 justify-start' : 'px-2 py-3 justify-center'} text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 rounded-md transition-colors`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <FaSun className={isOpen ? 'mr-3' : ''} /> : <FaMoon className={isOpen ? 'mr-3' : ''} />}
            {isOpen && (isDark ? 'Light Mode' : 'Dark Mode')}
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${isOpen ? 'px-4 py-2 justify-start' : 'px-2 py-3 justify-center'} text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-colors`}
          >
            <FaSignOutAlt className={isOpen ? 'mr-3' : ''} />
            {isOpen && 'Logout'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
