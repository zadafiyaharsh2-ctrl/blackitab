import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  AcademicCapIcon, 
  DocumentTextIcon, 
  CheckBadgeIcon, 
  BellIcon, 
  BuildingOffice2Icon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';

const InstituteSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Force reload to clear states
  };

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    const fetchJoinRequests = async () => {
      try {
        const res = await api.get('/institute/join-requests');
        if (res.data.success) {
          setPendingRequestsCount(res.data.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch join requests count', error);
      }
    };

    if (user && (user.role === 'institute' || user.role === 'hod')) {
      fetchJoinRequests();
      // Optional: Set up an interval to refresh the count periodically (e.g., every minute)
      const intervalId = setInterval(fetchJoinRequests, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user?.role]);

  const navItems = [
    { name: 'Dashboard', path: '/institute/dashboard', icon: HomeIcon },
    { name: 'Teacher\'s Panel', path: '/institute/teachers', icon: AcademicCapIcon },
    { name: 'Student Panel', path: '/institute/students', icon: UsersIcon },
    { name: 'Theory Checking', path: '/institute/theory', icon: DocumentTextIcon },
    { name: 'Question Checker', path: '/institute/questions', icon: CheckBadgeIcon },
    { name: 'Join Requests', path: '/institute/join-requests', icon: UsersIcon },
    { name: 'Notifications', path: '/institute/notifications', icon: BellIcon },
    { name: 'Departments', path: '/institute/departments', icon: BookOpenIcon },
    { name: 'Profile', path: '/institute/profile', icon: BuildingOffice2Icon },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 glass-panel !rounded-none border-r border-gray-200 dark:border-white/10
        shadow-[4px_0_24px_-4px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_30px_-5px_rgba(255,255,255,0.02)] 
        bg-white/95 dark:bg-[#000000]/80 backdrop-blur-xl
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand/Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200/50 dark:border-white/10 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 dark:bg-white/5 pointer-events-none" />
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              I
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white drop-shadow-sm">InstitutePanel</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/20">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-2">
            Management
          </div>
          {navItems.map((item) => {
            const isActive = window.location.pathname === item.path || (window.location.pathname.startsWith(item.path) && item.path !== '/institute');
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/institute'}
                onClick={() => setIsOpen(false)}
                className={`
                  relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group
                  ${isActive 
                    ? 'text-white shadow-sm font-bold bg-blue-600 dark:bg-blue-500' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 relative z-10 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors'
                  }`} />
                  <span className="relative z-10">{item.name}</span>
                </div>
                {item.name === 'Join Requests' && pendingRequestsCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                    isActive 
                      ? 'bg-white text-blue-600' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {pendingRequestsCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Info & Logout (Bottom) */}
        <div className="p-4 border-t border-gray-200/50 dark:border-white/10 shrink-0 bg-gray-50/50 dark:bg-[#000000]">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold uppercase shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:bg-white/10 dark:hover:text-yellow-400 transition-colors group"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-yellow-400 transition-colors" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-yellow-600 transition-colors" />
            )}
            <span className="group-hover:dark:text-yellow-400 transition-colors">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-white/10 dark:hover:text-red-400 transition-colors group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default InstituteSidebar;
