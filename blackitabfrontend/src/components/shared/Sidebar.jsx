import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaRobot, FaChartBar, FaUser, FaListAlt, FaSignOutAlt, FaBars, FaBook, FaTrophy, FaMoon, FaSun, FaSchool, FaGraduationCap, FaListUl, FaBell, FaSearch, FaCalendarDay, FaBuilding, FaUserTie, FaUserGraduate, FaFileAlt, FaClipboardCheck, FaUserPlus, FaSitemap } from 'react-icons/fa';
import { MdReportProblem } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import GlobalSearch from './GlobalSearch';
import axios from 'axios';
import API_URL from '../../config';

const Sidebar = ({ onLogout, isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingJoinRequests, setPendingJoinRequests] = useState(0);

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

  useEffect(() => {
    if (!canAccessInstitute) return;
    const fetchJoinRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/institute/join-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setPendingJoinRequests(res.data.data.length);
      } catch { }
    };
    fetchJoinRequests();
    const interval = setInterval(fetchJoinRequests, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const userRole = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'student'; } catch { return 'student'; }
  })();

  const canAccessTeacher = ['teacher', 'hod', 'institute'].includes(userRole);
  const canAccessInstitute = userRole === 'institute';

  const navItems = [
    

    ...(canAccessTeacher ? [
      { path: '/teacher-dashboard', label: 'Teacher Dashboard', icon: <FaSchool /> },
      { path: '/teacher/batches', label: 'Classes & Batches', icon: <FaUsers /> },
      { path: '/teacher/attendance', label: 'Attendance', icon: <FaCalendarDay /> },
      { path: '/question-management', label: 'Question Bank', icon: <FaListUl /> },
      { path: '/ask-ai', label: 'Ask AI', icon: <FaRobot /> },
      { path: '/teacher/tests', label: 'Tests', icon: <FaListAlt /> },
      { path: '/school-analytics', label: 'School Analytics', icon: <FaSchool /> },
    ] : []),
    // ...(canAccessTeacher ? [] : [
    //   { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    // ]),
    
    // { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },

    { path: '/problems', label: 'Problems', icon: <MdReportProblem /> },
    { path: '/contest', label: 'Contest', icon: <FaTrophy /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
    { path: '/theory', label: 'Theory', icon: <FaBook /> },
  ];

  const instituteNavItems = canAccessInstitute ? [
    { path: '/institute/dashboard', label: 'Dashboard', icon: <FaBuilding /> },
    { path: '/institute/teachers', label: "Teacher's Panel", icon: <FaUserTie /> },
    { path: '/institute/students', label: 'Student Panel', icon: <FaUserGraduate /> },
    { path: '/institute/theory', label: 'Theory Checking', icon: <FaFileAlt /> },
    { path: '/institute/questions', label: 'Question Checker', icon: <FaClipboardCheck /> },
    { path: '/institute/join-requests', label: 'Join Requests', icon: <FaUserPlus />, badge: pendingJoinRequests },
    { path: '/institute/notifications', label: 'Notifications', icon: <FaBell /> },
    { path: '/institute/departments', label: 'Departments', icon: <FaSitemap /> },
    { path: '/institute/profile', label: 'Institute Profile', icon: <FaSchool /> },
  ] : [];

  const sidebarWidth = isOpen ? 280 : 80;

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <div
        style={{ width: sidebarWidth }}
        className="fixed left-0 top-0 h-screen z-50 flex flex-col glass-panel !rounded-none border-r border-gray-200 dark:border-white/10 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_30px_-5px_rgba(255,255,255,0.02)] bg-white/95 dark:bg-[#000000]/80 backdrop-blur-xl overflow-hidden"
      >
        <div className="h-20 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 dark:bg-white/5 pointer-events-none" />

          {isOpen && (
            <div className="flex items-center gap-2">
              <Logo showText={true} className="w-8 h-8" textSize="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-sm" />
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-white/10 relative z-10"
          >
            <FaBars />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-6 pb-2">
          <button
            onClick={() => setSearchOpen(true)}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-4 py-3' : 'justify-center py-3'} bg-gray-100/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-gray-500 dark:text-white rounded-xl border border-gray-200/50 dark:border-white/10 shadow-inner group flex-shrink-0 relative overflow-hidden focus:outline-none`}
            title="Search (Ctrl+K)"
          >
            <div className="flex items-center gap-3">
              <FaSearch className="drop-shadow-sm" />
              {isOpen && <span className="text-sm font-bold">Search...</span>}
            </div>
            {isOpen && <kbd className="text-[10px] bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md font-mono text-gray-400 dark:text-white/70 shadow-sm">Ctrl+K</kbd>}
          </button>
        </div>

        {/* Role Badge */}
        {isOpen && userRole !== 'student' && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5">
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
              return (
                <li key={item.path}>
                  <Link to={item.path}>
                    <div className={`relative flex items-center ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'} rounded-xl text-sm font-semibold overflow-hidden group ${
                      isActive
                        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm font-bold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10'
                    }`}>
                      <span className={`relative z-10 text-lg ${isOpen ? 'mr-4' : ''} ${isActive ? 'text-white' : ''}`}>
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="flex-1 whitespace-nowrap z-10">{item.label}</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Institute Section */}
          {instituteNavItems.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {isOpen && (
                <li className="px-2 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Institute</span>
                </li>
              )}
              {!isOpen && <li className="border-t border-gray-200 dark:border-white/10 mx-2 my-2" />}
              {instituteNavItems.map((item) => {
                const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
                return (
                  <li key={item.path}>
                    <Link to={item.path}>
                      <div className={`relative flex items-center ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'} rounded-xl text-sm font-semibold overflow-hidden group ${
                        isActive
                          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm font-bold'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10'
                      }`}>
                        <span className={`relative z-10 text-lg ${isOpen ? 'mr-4' : ''} ${isActive ? 'text-white' : ''}`}>
                          {item.icon}
                        </span>
                        {isOpen && (
                          <>
                            <span className="flex-1 whitespace-nowrap z-10">{item.label}</span>
                            {item.badge > 0 && (
                              <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                              }`}>{item.badge}</span>
                            )}
                          </>
                        )}
                        {!isOpen && item.badge > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-200/50 dark:border-white/10 space-y-2 bg-gray-50/50 dark:bg-[#000000]">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${isOpen ? 'px-4 py-3 justify-start gap-4' : 'px-0 py-3 justify-center'} text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:bg-white/10 dark:hover:text-yellow-400 rounded-xl group`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="text-lg drop-shadow-sm">
              {isDark ? <FaSun /> : <FaMoon />}
            </span>
            {isOpen && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button
            onClick={onLogout}
            className={`w-full flex items-center ${isOpen ? 'px-4 py-3 justify-start gap-4' : 'px-0 py-3 justify-center'} text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-white/10 dark:hover:text-red-400 rounded-xl group mt-2`}
          >
            <span className="text-lg drop-shadow-sm"><FaSignOutAlt /></span>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
