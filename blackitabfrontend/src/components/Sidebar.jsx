import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaUsers, FaRobot, FaChartBar, FaUser, FaSignOutAlt, FaBars, FaStore, FaSuitcase, FaBook, FaLaptopCode, FaTrophy, FaMoon, FaSun, FaSchool, FaGraduationCap, FaListUl, FaBell, FaSearch } from 'react-icons/fa';
import { MdReportProblem } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import GlobalSearch from './GlobalSearch';
import axios from 'axios';
import API_URL from '../config';

/**
 * Sidebar — Role-aware navigation.
 *
 * Visibility rules:
 * ─────────────────
 * • ALL users    → Dashboard, Social, Ask AI, AI Questions, Analytics,
 *                  Problems, Contest, Leaderboard, Theory, Projects,
 *                  Playlists, Store, Jobs, Profile
 *
 * • teacher+     → Teacher Panel, Create Question, My Questions, School Analytics
 * • institute_admin → Institute Panel (includes everything teacher can see)
 * • hod          → same as teacher (TeacherDashboard shows HOD sections)
 *
 * • System Admin → completely separate at /admin/login — NO sidebar link.
 */
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

  // ── Current user's role ──
  const userRole = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'student'; } catch { return 'student'; }
  })();

  const canAccessTeacher = ['teacher', 'hod', 'institute_admin'].includes(userRole);
  const canAccessInstitute = userRole === 'institute_admin';

  // ── Build nav items based on role ──
  const navItems = [
    // Everyone sees these
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/social', label: 'Social', icon: <FaUsers /> },
    { path: '/ask-ai', label: 'Ask AI', icon: <FaRobot /> },
    { path: '/ai-questions', label: 'AI Questions', icon: <FaGraduationCap className="text-emerald-400" /> },
    { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },

    // Teacher / HOD / Institute Admin only
    ...(canAccessTeacher ? [
      { path: '/teacher-dashboard', label: 'Teacher Panel', icon: <FaSchool className="text-indigo-400" /> },
      { path: '/create-question', label: 'Create Question', icon: <FaGraduationCap className="text-teal-400" /> },
      { path: '/my-questions', label: 'My Questions', icon: <FaListUl className="text-cyan-400" /> },
      { path: '/school-analytics', label: 'School Analytics', icon: <FaSchool /> },
    ] : []),

    // Institute Admin only
    ...(canAccessInstitute ? [
      { path: '/institute-dashboard', label: 'Institute Panel', icon: <FaSchool className="text-orange-400" /> },
    ] : []),

    // Everyone sees these
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

  // NOTE: No /admin link here — System Admin has a completely separate
  // login at /admin/login that is not discoverable from the main app.

  const sidebarWidth = isOpen ? 280 : 80;

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <motion.div
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen z-50 flex flex-col glass-panel border-r border-gray-200/20 dark:border-gray-800/50 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_30px_-5px_rgba(168,85,247,0.1)]"
      >
        <div className="h-20 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-4 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-white/10 dark:bg-slate-900/20 pointer-events-none" />

          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2">
                <Logo showText={true} className="w-8 h-8" textSize="text-2xl font-bold text-slate-900 dark:text-slate-100" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors shadow-sm ring-1 ring-gray-200 dark:ring-gray-700/50 relative z-10">
            <FaBars />
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-4 pt-6 pb-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setSearchOpen(true)}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-4 py-3' : 'justify-center py-3'} bg-gray-100/80 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl border border-gray-200/50 dark:border-gray-700/50 transition-all shadow-inner group`}
            title="Search (Ctrl+K)">
            <div className="flex items-center gap-3">
              <FaSearch className="group-hover:text-blue-500 transition-colors" />
              {isOpen && <span className="text-sm font-medium">Search...</span>}
            </div>
            {isOpen && <kbd className="text-[10px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded-md font-mono text-gray-400 shadow-sm">Ctrl+K</kbd>}
          </motion.button>
        </div>

        {/* Role Badge */}
        {isOpen && userRole !== 'student' && (
          <div className="px-4 pb-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              userRole === 'institute_admin' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
              userRole === 'hod' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
              userRole === 'teacher' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              'bg-gray-500/10 text-gray-400 border border-gray-500/20'
            }`}>
              {userRole === 'institute_admin' ? '🏛 Institute Admin' :
               userRole === 'hod' ? '🎓 Head of Department' :
               userRole === 'teacher' ? '📚 Teacher' : userRole}
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800 hover:scrollbar-thumb-slate-500/50">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
              return (
                <li key={item.path}>
                  <Link to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: isOpen ? 4 : 0 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'} rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                      }`}>
                      {isActive && (
                        <motion.div layoutId="active-nav-bg"
                          className="absolute inset-0 bg-blue-600 dark:bg-blue-500 rounded-xl -z-10" />
                      )}
                      <span className={`relative z-10 text-lg ${isOpen ? 'mr-4' : ''} ${isActive ? 'text-white' : 'group-hover:text-blue-500 transition-colors'}`}>
                        {item.icon}
                      </span>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                            className="flex-1 whitespace-nowrap z-10">{item.label}</motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 space-y-2 bg-gray-50/50 dark:bg-black/20">
          <Link to="/notifications">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center ${isOpen ? 'px-4 py-3 justify-start gap-4' : 'px-0 py-3 justify-center'} text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-colors relative group`}>
              <span className="relative flex-shrink-0 text-lg group-hover:text-blue-500">
                <FaBell />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full" />}
              </span>
              {isOpen && <span>Notifications</span>}
              {isOpen && unreadCount > 0 && (
                <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full px-2 py-0.5 font-semibold shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </motion.div>
          </Link>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={toggleTheme}
            className={`w-full flex items-center ${isOpen ? 'px-4 py-3 justify-start gap-4' : 'px-0 py-3 justify-center'} text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-500 rounded-xl transition-colors group`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <span className="text-lg group-hover:text-yellow-500 transition-colors">
               {isDark ? <FaSun /> : <FaMoon />}
            </span>
            {isOpen && (isDark ? 'Light Mode' : 'Dark Mode')}
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className={`w-full flex items-center ${isOpen ? 'px-4 py-3 justify-start gap-4' : 'px-0 py-3 justify-center'} text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors group mt-2`}>
            <span className="text-lg group-hover:text-red-500 transition-colors"><FaSignOutAlt /></span>
            {isOpen && 'Logout'}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
