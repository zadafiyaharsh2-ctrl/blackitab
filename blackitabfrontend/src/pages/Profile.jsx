import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // If unauthorized, redirect to login
          if (error.response && error.response.status === 401) {
            navigate('/login');
          }
        }
      } else {
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Profile</h1>
        {user && (
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">User Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-300">Name:</span>
                  <span className="ml-2 text-gray-400">{user.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-300">Email:</span>
                  <span className="ml-2 text-gray-400">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-300">User ID:</span>
                  <span className="ml-2 text-gray-400">{user.id}</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

