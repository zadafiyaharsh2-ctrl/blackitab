import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'SOCIAL', path: '/social' },
    { name: 'DASHBOARD', path: '/dashboard' },
    // { name: 'AI', path: '/ai' },
    { name: 'ANALYTICS', path: '/analytics' },
    { name: 'PROBLEMS', path: '/problems' },
    { name: 'PROFILE', path: '/profile' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Company Name */}
          <div className="flex items-center">
            <Link to="/dashboard">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                Blackitab
              </h1>
            </Link>
          </div>

          {/* Right Side - Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
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

