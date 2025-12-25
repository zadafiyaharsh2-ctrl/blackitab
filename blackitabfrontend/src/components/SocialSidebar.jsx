import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaRobot, FaEnvelope, FaWallet, FaPlusSquare, FaUser, FaSignOutAlt, FaBars, FaSun, FaMoon, FaUserFriends, FaUserPlus, FaStar, FaBell } from 'react-icons/fa'; // Added specific icons
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const SocialSidebar = ({ onLogout, isOpen, setIsOpen, user, leftOffset = 0 }) => { // Accepting user prop and leftOffset
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  // Helper to get ID for links
  const userId = user?._id || user?.id;

  const navItems = [
    // 1. Follower
    { path: `/network/${userId}/followers`, label: 'Followers', icon: <FaUserFriends /> },
    // 2. Following
    { path: `/network/${userId}/following`, label: 'Following', icon: <FaUserPlus /> }, // Using UserPlus as placeholder for Following
    // 3. Subscription
    { path: `/network/${userId}/subscribers`, label: 'Subscription', icon: <FaStar /> },
    // 4. Notifications
    { path: '/notifications', label: 'Notifications', icon: <FaBell /> },
    // 5. Message
    { path: '/messages', label: 'Message', icon: <FaEnvelope /> },
    // 6. My Earning
    { path: '/earnings', label: 'My Earning', icon: <FaWallet /> },
    // 6. Add Post
    { path: '/create-post', label: 'Add Post', icon: <FaPlusSquare /> },
    // 7. Profile
    { path: '/profile', label: 'Profile', icon: <FaUser /> },

  ];

  return (
    <div 
      style={{ left: leftOffset }}
      className={`${isDark ? 'bg-gray-900/95 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-md border-r shadow-xl h-screen fixed top-0 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} z-40`}
    >
      <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
        {isOpen && (
          <Link to="/social" className="flex items-center gap-2">
            <Logo showText={true} className="w-8 h-8" textSize="text-xl" />
            <span className="text-xs font-mono text-blue-400">SOCIAL</span>
          </Link>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 ${isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'} rounded-md transition-colors`}
        >
          <FaBars />
        </button>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center ${isOpen ? 'px-4 py-2' : 'px-2 py-3 justify-center'} rounded-md text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
