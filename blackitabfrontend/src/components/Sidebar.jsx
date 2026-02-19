import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaHome, FaUsers, FaRobot, FaChartBar, FaUser, FaSignOutAlt, FaBars, FaStore, FaBriefcase, FaSuitcase, FaBook, FaCode, FaLaptopCode, FaTrophy, FaMoon, FaSun, FaSchool, FaGraduationCap, FaListUl, FaMoneyBillWave } from 'react-icons/fa';
import { MdReportProblem } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const Sidebar = ({ onLogout, isOpen, setIsOpen }) => {
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/social', label: 'Social', icon: <FaUsers /> },
    // { path: '/ai', label: 'AI', icon: <FaRobot /> },
    { path: '/ask-ai', label: 'Ask AI', icon: <FaRobot className="text-purple-400" /> },
    { path: '/ai-questions', label: 'AI Questions', icon: <FaGraduationCap className="text-emerald-400" /> },
    { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },
    { path: '/school-analytics', label: 'School Analytics', icon: <FaSchool /> },
    { path: '/problems', label: 'Problems', icon: <MdReportProblem /> },
    { path: '/contest', label: 'Contest', icon: <FaTrophy /> },
    { path: '/theory', label: 'Theory', icon: <FaBook /> },

    { path: '/ide', label: 'Projects', icon: <FaLaptopCode /> },
    { path: '/playlists', label: 'Playlists', icon: <FaListUl /> },
    { path: '/store', label: 'Store', icon: <FaStore /> },
    { path: '/jobs', label: 'Jobs', icon: <FaSuitcase /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> },
  ];

  return (
    <div className={`${isDark ? 'bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-md border-r shadow-xl h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} z-50`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
        {isOpen && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo showText={true} className="w-8 h-8" textSize="text-xl" />
          </Link>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 ${isDark ? 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'} rounded-md transition-colors`}
        >
          <FaBars />
        </button>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center ${isOpen ? 'px-4 py-2' : 'px-2 py-3 justify-center'} rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-gray-900 dark:text-white shadow-lg shadow-blue-600/20'
                    : isDark ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={isOpen ? 'mr-3' : ''}>{item.icon}</span>
                {isOpen && item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={`p-4 border-t ${isDark ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200'} space-y-2`}>
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
  );
};

export default Sidebar;
