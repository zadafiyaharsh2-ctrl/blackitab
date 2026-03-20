import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'SOCIAL', path: '/social' },
    { name: 'DASHBOARD', path: '/dashboard' },
    { name: 'PROBLEMS', path: '/problems' },
    { name: 'PROFILE', path: '/profile' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-[#050505]/80 shadow-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Company Name */}
          <div className="flex items-center">
            <Link to="/dashboard">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 cursor-pointer hover:opacity-80 transition-opacity">
                RANKLEN
              </h1>
            </Link>
          </div>

          {/* Right Side - Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-sm dark:shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-white/10 dark:hover:text-blue-400'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
