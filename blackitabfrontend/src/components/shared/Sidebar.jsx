import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaRobot, FaUser, FaListAlt, FaSignOutAlt, FaBars, FaBook, FaTrophy, FaMoon, FaSun, FaSchool, FaGraduationCap, FaListUl, FaBell, FaSearch, FaCalendarDay, FaBuilding, FaUserTie, FaUserGraduate, FaFileAlt, FaClipboardCheck, FaUserPlus, FaSitemap, FaClipboardList, FaCommentDots, FaPenFancy } from 'react-icons/fa';
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
  const [, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingJoinRequests, setPendingJoinRequests] = useState(0);

  const { role: userRole = 'student', instituteId = null } = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const canAccessTeacher = ['teacher', 'hod'].includes(userRole);
  const canAccessHod = userRole === 'hod';
  const canAccessInstitute = userRole === 'institute';
  const hasInstitute = Boolean(instituteId);
  const INSTITUTE_REQUIRED_FOR_CLASSES_MESSAGE = 'You must join an institute before joining any class.';

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/social/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setUnreadCount(res.data.count);
      } catch {
        // No-op: unread badge is optional UI data.
      }
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
      } catch {
        // No-op: join request badge is optional UI data.
      }
    };
    fetchJoinRequests();
    const interval = setInterval(fetchJoinRequests, 60000);
    return () => clearInterval(interval);
  }, [canAccessInstitute]);

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
    ...(canAccessTeacher ? [
      { path: '/teacher-dashboard', label: 'Teacher Dashboard', icon: <FaSchool /> },
      ...(hasInstitute ? [
        { path: '/teacher/batches', label: 'Classes & Batches', icon: <FaUsers /> },
        { path: '/teacher/attendance', label: 'Attendance', icon: <FaCalendarDay /> },
      ] : []),
      { path: '/question-management', label: 'Question Bank', icon: <FaListUl /> },
      { path: '/ask-ai', label: 'Ask AI', icon: <FaRobot /> },
      { path: '/teacher/tests', label: 'Tests', icon: <FaListAlt /> },
      { path: '/teacher/content', label: 'Theory Content', icon: <FaPenFancy /> },
      ...(hasInstitute ? [
        { path: '/teacher/feedback', label: 'Feedback', icon: <FaCommentDots /> },
      ] : []),
      { path: '/school-analytics', label: 'School Analytics', icon: <FaSchool /> },
    ] : []),
    ...( userRole === 'student' ? [
      { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
      { path: '/classes', label: 'My Classes', icon: <FaUsers /> },
      { path: '/ask-ai', label: 'Ask AI', icon: <FaRobot /> },
      { path: '/problems', label: 'Problems', icon: <MdReportProblem /> },
      { path: '/contest', label: 'Contest', icon: <FaTrophy /> },
      { path: '/leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
      { path: '/theory', label: 'Theory', icon: <FaBook /> },
    ] : [])
  ];

  // HOD-only department management links
  const hodNavItems = canAccessHod ? [
    { path: '/hod/teachers', label: 'Dept. Teachers', icon: <FaUserTie /> },
    { path: '/hod/content-review', label: 'Content Review', icon: <FaClipboardCheck /> },
    { path: '/hod/attendance', label: 'Dept. Attendance', icon: <FaCalendarDay /> },
  ] : [];

  const instituteNavItems = canAccessInstitute ? [
    { path: '/institute/dashboard', label: 'Dashboard', icon: <FaBuilding /> },
    { path: '/institute/teachers', label: "Teacher's Panel", icon: <FaUserTie /> },
    { path: '/institute/students', label: 'Student Panel', icon: <FaUserGraduate /> },
    { path: '/hod/attendance', label: 'Attendance', icon: <FaCalendarDay /> },
    { path: '/institute/theory', label: 'Theory Checking', icon: <FaFileAlt /> },
    { path: '/institute/questions', label: 'Question Checker', icon: <FaClipboardCheck /> },
    { path: '/institute/join-requests', label: 'Join Requests', icon: <FaUserPlus />, badge: pendingJoinRequests },
    { path: '/institute/departments', label: 'Departments', icon: <FaSitemap /> },
    { path: '/institute/profile', label: 'Institute Profile', icon: <FaSchool /> },
  ] : [];

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleNavItemClick = (event, path) => {
    if (userRole === 'student' && path === '/classes' && !hasInstitute) {
      event.preventDefault();
      navigate('/profile', {
        state: {
          openJoinInstituteModal: true,
          instituteRequiredMessage: INSTITUTE_REQUIRED_FOR_CLASSES_MESSAGE
        }
      });
      handleNavClick();
      return;
    }

    handleNavClick();
  };

  const isProfileActive = location.pathname === '/profile' || location.pathname.startsWith('/profile/');

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <div
        className={`fixed left-0 top-0 h-screen z-50 flex flex-col font-sans border-r border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[4px_0_30px_-5px_rgba(255,255,255,0.02)] bg-white/95 dark:bg-[#000000]/80 backdrop-blur-xl overflow-hidden transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
          isOpen
            ? 'translate-x-0 opacity-100 w-[280px]'
            : '-translate-x-full opacity-100 pointer-events-none md:pointer-events-auto md:translate-x-0 w-[80px]'
        }`}
      >
        <div className="h-20 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-4 relative overflow-hidden">
          {isOpen && (
            <div className="flex items-center gap-2">
              <Logo showText={true} className="w-8 h-8" textSize="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white" />
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 bg-gray-50/80 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white hover:text-gray-900 rounded-xl transition-colors relative z-10 mx-auto md:mx-0"
          >
            <FaBars className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-6 pb-2">
          <button
            onClick={() => setSearchOpen(true)}
            className={`w-full flex items-center ${isOpen ? 'justify-between px-3 py-2.5' : 'justify-center py-2.5'} bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 dark:hover:text-white rounded-xl border border-gray-200/50 dark:border-white/10 transition-colors group flex-shrink-0 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20`}
            title="Search (Ctrl+K)"
          >
            <div className={`flex items-center gap-3 ${!isOpen ? 'text-lg' : ''}`}>
              <FaSearch className="w-4 h-4 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" />
              {isOpen && <span className="text-[13px] font-semibold tracking-wide">Search...</span>}
            </div>
            {isOpen && <kbd className="text-[10px] bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 px-1.5 py-0.5 rounded font-mono font-bold text-gray-400 dark:text-gray-500 shadow-sm">Ctrl K</kbd>}
          </button>
        </div>

        {/* Role Badge */}
        {isOpen && userRole !== 'student' && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-white/5">
              {userRole === 'institute' ? '🏛 Institute Admin' :
               userRole === 'hod' ? '🎓 Head of Department' :
               userRole === 'teacher' ? '📚 Teacher' : userRole}
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-gray-300 dark:hover:scrollbar-thumb-white/20">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
              return (
                <li key={item.path}>
                  <Link to={item.path} onClick={(event) => handleNavItemClick(event, item.path)}>
                    <div className={`relative flex items-center ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'} rounded-xl text-[13px] overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0061FF]/10 text-[#0061FF] dark:bg-[#0061FF]/20 dark:text-[#a5c3ff] font-bold tracking-tight'
                        : 'text-gray-500 font-semibold tracking-wide dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}>
                      <span className={`relative z-10 text-[16px] ${isOpen ? 'mr-3' : ''} ${isActive ? 'text-[#0061FF] dark:text-[#a5c3ff]' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className="flex-1 whitespace-nowrap z-10 leading-tight">{item.label}</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Join Institute Prompt for Teachers */}
          {canAccessTeacher && !hasInstitute && isOpen && (
            <div className="mx-2 mt-4 p-3.5 rounded-xl border border-blue-100 dark:border-[#0061FF]/20 bg-blue-50/50 dark:bg-[#0061FF]/5">
              <p className="text-[11px] font-bold text-blue-700 dark:text-[#a5c3ff] mb-1 uppercase tracking-widest flex items-center gap-1.5">
                <FaBuilding className="w-3 h-3" /> No Institute
              </p>
              <p className="text-[11px] text-blue-600/80 dark:text-[#a5c3ff]/70 leading-relaxed font-medium">
                Link to your institute to access collaborative tools and attendance.
              </p>
            </div>
          )}

          {/* HOD Department Section */}
          {hodNavItems.length > 0 && (
            <ul className="mt-6 space-y-1.5">
              {isOpen && (
                <li className="px-4 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Department Control</span>
                </li>
              )}
              {!isOpen && <li className="border-t border-gray-100 dark:border-white/10 mx-4 my-3" />}
              {hodNavItems.map((item) => {
                const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
                return (
                  <li key={item.path}>
                    <Link to={item.path}>
                      <div className={`relative flex items-center ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'} rounded-xl text-[13px] overflow-hidden transition-all duration-200 ${
                        isActive
                          ? 'bg-[#0061FF]/10 text-[#0061FF] dark:bg-[#0061FF]/20 dark:text-[#a5c3ff] font-bold tracking-tight'
                          : 'text-gray-500 font-semibold tracking-wide dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}>
                        <span className={`relative z-10 text-[16px] ${isOpen ? 'mr-3' : ''} ${isActive ? 'text-[#0061FF] dark:text-[#a5c3ff]' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-white'}`}>
                          {item.icon}
                        </span>
                        {isOpen && (
                          <span className="flex-1 whitespace-nowrap z-10 leading-tight">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Institute Section */}
          {instituteNavItems.length > 0 && (
            <ul className="mt-6 space-y-1.5">
              {isOpen && (
                <li className="px-4 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Console Admin</span>
                </li>
              )}
              {!isOpen && <li className="border-t border-gray-100 dark:border-white/10 mx-4 my-3" />}
              {instituteNavItems.map((item) => {
                const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
              return (
                <li key={item.path}>
                    <Link to={item.path} onClick={handleNavClick}>
                      <div className={`relative flex items-center ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'} rounded-xl text-[13px] overflow-hidden transition-all duration-200 ${
                        isActive
                          ? 'bg-[#0061FF]/10 text-[#0061FF] dark:bg-[#0061FF]/20 dark:text-[#a5c3ff] font-bold tracking-tight'
                          : 'text-gray-500 font-semibold tracking-wide dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}>
                        <span className={`relative z-10 text-[16px] ${isOpen ? 'mr-3' : ''} ${isActive ? 'text-[#0061FF] dark:text-[#a5c3ff]' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-white'}`}>
                          {item.icon}
                        </span>
                        {isOpen && (
                          <>
                            <span className="flex-1 whitespace-nowrap z-10 leading-tight">{item.label}</span>
                            {item.badge > 0 && (
                              <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                isActive ? 'bg-white text-[#0061FF]' : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                              }`}>{item.badge}</span>
                            )}
                          </>
                        )}
                        {!isOpen && item.badge > 0 && (
                          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-gray-900 dark:bg-white border-2 border-white dark:border-[#0f0f0f]" />
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
        <div className="p-4 border-t border-gray-200/50 dark:border-white/10 bg-gray-50 dark:bg-transparent">
          <Link
            to="/profile"
            onClick={handleNavClick}
            className={`w-full flex items-center ${isOpen ? 'px-3 py-3 justify-start gap-3' : 'px-0 py-3 justify-center'} text-[13px] font-semibold tracking-wide rounded-xl transition-colors ${
              isProfileActive
                ? 'bg-[#0061FF]/10 text-[#0061FF] dark:bg-[#0061FF]/20 dark:text-[#a5c3ff] font-bold tracking-tight'
                : 'text-gray-500 font-semibold tracking-wide dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
            title="Profile"
          >
            <span className={`text-[16px] ${isProfileActive ? 'text-[#0061FF] dark:text-[#a5c3ff]' : 'text-gray-400 dark:text-gray-500'}`}><FaUser /></span>
            {isOpen && <span>Profile Settings</span>}
          </Link>

          <div className="flex gap-2 mt-2 w-full">
            <button
              onClick={toggleTheme}
              className={`flex-1 flex items-center ${isOpen ? 'justify-start gap-3 px-3 py-3' : 'justify-center py-3'} text-[13px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="text-[16px] text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-white">
                {isDark ? <FaSun /> : <FaMoon />}
              </span>
              {isOpen && <span>{isDark ? 'Light' : 'Dark'}</span>}
            </button>

            <button
              onClick={onLogout}
              className={`flex-1 flex items-center ${isOpen ? 'justify-start gap-3 px-3 py-3' : 'justify-center py-3'} text-[13px] font-semibold tracking-wide text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-white/5 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors`}
              title="Logout"
            >
              <span className="text-[16px] text-gray-400 dark:text-gray-500"><FaSignOutAlt /></span>
              {isOpen && <span>Log out</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
