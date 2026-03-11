import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaUsers, FaRobot, FaChartBar, FaUser, FaListAlt, FaClipboardList, FaSignOutAlt, FaBars, FaBook, FaTrophy, FaMoon, FaSun, FaSchool, FaGraduationCap, FaListUl, FaBell, FaSearch, FaCalendarDay, FaCommentDots, FaPenFancy } from 'react-icons/fa';
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
 * • ALL users    → Dashboard, Social, Ask AI, Analytics,
 *                  Problems, Contest, Leaderboard, Theory, Profile
 *
 * • teacher+     → AI Questions, Teacher Panel, Create Question,
 *                  My Questions, School Analytics, Question Paper
 * • institute → Institute Panel (+ everything teacher can see)
 * • hod          → same as teacher (TeacherDashboard shows HOD sections)
 *
 * Removed (Coming Soon): Projects, Playlists, Store, Jobs
 * System Admin → completely separate at /admin/login — NO sidebar link.
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

  const canAccessTeacher = ['teacher', 'hod', 'institute'].includes(userRole);
  const canAccessInstitute = userRole === 'institute';

  // ── Build nav items based on role ──
  const navItems = [
    // ─── Everyone sees these ───
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/ask-ai', label: 'Ask AI', icon: <FaRobot /> },
    { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },

    // ─── Teacher / HOD / Institute Admin only ───
    ...(canAccessTeacher ? [
      { path: '/teacher-dashboard', label: 'Teacher Panel', icon: <FaSchool className="text-indigo-400" /> },
      { path: '/teacher/batches', label: 'Classes & Batches', icon: <FaUsers className="text-blue-400" /> },
      { path: '/teacher/attendance', label: 'Attendance', icon: <FaCalendarDay className="text-purple-400" /> },
      { path: '/teacher/assignments', label: 'Assignments', icon: <FaClipboardList className="text-yellow-400" /> },
      { path: '/question-management', label: 'Question Bank', icon: <FaListUl className="text-cyan-400" /> },
      { path: '/teacher/tests', label: 'Tests', icon: <FaListAlt className="text-green-400" /> }, // Added Tests link
      { path: '/teacher/content', label: 'Theory Content', icon: <FaPenFancy className="text-pink-400" /> },
      { path: '/teacher/feedback', label: 'Feedback', icon: <FaCommentDots className="text-rose-400" /> },
      { path: '/school-analytics', label: 'School Analytics', icon: <FaSchool /> },
    ] : []),

    // ─── Institute Admin only ───
    ...(canAccessInstitute ? [
      { path: '/institute-dashboard', label: 'Institute Panel', icon: <FaSchool className="text-orange-400" /> },
    ] : []),

    // ─── Everyone sees these ───
    { path: '/problems', label: 'Problems', icon: <MdReportProblem /> },
    { path: '/contest', label: 'Contest', icon: <FaTrophy /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FaTrophy className="text-yellow-400" /> },
    { path: '/notifications', label: 'Notifications', icon: <FaBell className="text-red-400" />, mobileOnly: true },
    { path: '/theory', label: 'Theory', icon: <FaBook /> },
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
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col glass-panel !rounded-none border-r border-gray-200 dark:border-white/10 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_30px_-5px_rgba(255,255,255,0.02)] bg-white/95 dark:bg-[#000000]/80 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:w-[80px]'
        }`}
      >
        <div className="h-20 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-4 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-white/10 dark:bg-white/5 pointer-events-none" />

          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2">
                <Logo showText={true} className="w-8 h-8" textSize="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-sm" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors shadow-sm ring-1 ring-gray-200 dark:ring-white/10 relative z-10">
            <FaBars />
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-4 pt-6 pb-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setSearchOpen(true)}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-4 py-3' : 'justify-center py-3'} bg-gray-100/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-gray-500 dark:text-white rounded-xl border border-gray-200/50 dark:border-white/10 transition-all shadow-inner group flex-shrink-0 relative overflow-hidden focus:outline-none`}
            title="Search (Ctrl+K)">
            <div className="flex items-center gap-3">
              <FaSearch className="group-hover:text-blue-500 transition-colors drop-shadow-sm" />
              {isOpen && <span className="text-sm font-bold">Search...</span>}
            </div>
            {isOpen && <kbd className="text-[10px] bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md font-mono text-gray-400 dark:text-white/70 shadow-sm">Ctrl+K</kbd>}
          </motion.button>
        </div>

        {/* Role Badge */}
        {isOpen && userRole !== 'student' && (
          <div className="px-4 pb-2">
            <div className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
              userRole === 'institute' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_8px_rgba(249,115,22,0.1)]' :
              userRole === 'hod' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.1)]' :
              userRole === 'teacher' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]' :
              'bg-white/5 text-gray-400 border border-white/10'
            }`}>
              {userRole === 'institute' ? '🏛 Institute Admin' :
               userRole === 'hod' ? '🎓 Head of Department' :
               userRole === 'teacher' ? '📚 Teacher' : userRole}
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/20 hover:scrollbar-thumb-slate-500/50">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
              if (item.mobileOnly) {
                return (
                  <li key={item.path} className="md:hidden">
                    <Link to={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.02, x: isOpen ? 4 : 0 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex items-center ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'} rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group ${
                          isActive
                            ? 'text-white shadow-sm font-bold'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10'
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
              }
              return (
                <li key={item.path}>
                  <Link to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: isOpen ? 4 : 0 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'} rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group ${
                        isActive
                          ? 'text-white shadow-sm font-bold'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10'
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
        <div className="p-4 border-t border-gray-200/50 dark:border-white/10 space-y-2 bg-gray-50/50 dark:bg-[#000000]">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={toggleTheme}
            className={`w-full flex items-center ${isOpen ? 'px-4 py-3 justify-start gap-4' : 'px-0 py-3 justify-center'} text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:bg-white/10 dark:hover:text-yellow-400 rounded-xl transition-colors group`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <span className="text-lg group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors drop-shadow-sm">
               {isDark ? <FaSun /> : <FaMoon />}
            </span>
            {isOpen && <span className="group-hover:dark:text-yellow-400 transition-colors">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className={`w-full flex items-center ${isOpen ? 'px-4 py-3 justify-start gap-4' : 'px-0 py-3 justify-center'} text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-white/10 dark:hover:text-red-400 rounded-xl transition-colors group mt-2`}>
            <span className="text-lg group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors drop-shadow-sm"><FaSignOutAlt /></span>
            {isOpen && <span className="group-hover:dark:text-red-400 transition-colors">Logout</span>}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
