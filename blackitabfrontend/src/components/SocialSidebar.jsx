import { Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaWallet, FaPlusSquare, FaUser, FaBars, FaUserFriends, FaUserPlus, FaStar, FaBell } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const SocialSidebar = ({ onLogout, isOpen, setIsOpen, user, leftOffset = 0 }) => {
  const location = useLocation();
  const { isDark } = useTheme();

  const userId = user?._id || user?.id;

  const navItems = [
    { path: `/network/${userId}/followers`, label: 'Followers', icon: <FaUserFriends /> },
    { path: `/network/${userId}/following`, label: 'Following', icon: <FaUserPlus /> },
    { path: `/network/${userId}/subscribers`, label: 'Subscription', icon: <FaStar /> },
    { path: '/notifications', label: 'Notifications', icon: <FaBell /> },
    { path: '/messages', label: 'Message', icon: <FaEnvelope /> },
    { path: '/earnings', label: 'My Earning', icon: <FaWallet /> },
    { path: '/create-post', label: 'Add Post', icon: <FaPlusSquare /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> },
  ];

  return (
    <div
      style={{ left: leftOffset }}
      className={`bg-white dark:bg-gray-900/95 border-r border-gray-200 dark:border-gray-800 backdrop-blur-md shadow-xl h-screen fixed top-0 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} z-40`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {isOpen && (
          <Link to="/social" className="flex items-center gap-2">
            <Logo showText={true} className="w-8 h-8" textSize="text-xl" />
            <span className="text-xs font-mono text-blue-400">SOCIAL</span>
          </Link>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"
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
                className={`flex items-center ${isOpen ? 'px-4 py-2' : 'px-2 py-3 justify-center'} rounded-md text-sm font-medium transition-all duration-200 ${location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <span className={isOpen ? 'mr-3' : ''}>{item.icon}</span>
                {isOpen && item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SocialSidebar;
