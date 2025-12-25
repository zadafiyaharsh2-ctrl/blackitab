import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import API_URL from '../config';

const SocialListPage = () => {
  const { userId, type } = useParams(); // type should be 'followers' or 'following'
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get current user from local storage for "Am I following them?" logic
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchList();
  }, [userId, type]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'followers' 
          ? `${API_URL}/api/social/followers/${userId}`
          : `${API_URL}/api/social/following/${userId}`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load list.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/social/follow/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      setUsers(prev => prev.map(u => u._id === targetId ? { ...u, isFollowing: true } : u));
    } catch (err) {
      console.error(err);
      alert('Error following user');
    }
  };

  const handleUnfollow = async (targetId) => {
    if(!window.confirm("Unfollow this user?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/social/unfollow/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      setUsers(prev => prev.map(u => u._id === targetId ? { ...u, isFollowing: false } : u));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white font-sans relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold capitalize">{type}</h1>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {loading ? (
           <div className="flex justify-center py-10">
               <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
           </div>
        ) : error ? (
           <div className="text-center text-red-400 py-10">{error}</div>
        ) : users.length === 0 ? (
           <div className="text-center text-gray-500 py-10">No users found</div>
        ) : (
           <div className="divide-y divide-gray-800">
             {users.map(u => (
               <div key={u._id} className="flex items-center justify-between py-4 hover:bg-white/5 px-2 rounded-lg transition-colors cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold shadow-lg">
                        {u.name?.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-sm text-gray-400">{u.followerCount || 0} followers</div>
                     </div>
                  </div>

                  {/* Action Button */}
                  {currentUser._id !== u._id && (
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                       <button 
                          onClick={() => navigate(`/messages/${u._id}`)}
                          className="p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700"
                          title="Message"
                       >
                          <FaEnvelope size={14} />
                       </button>

                       {u.isFollowing ? (
                          <button 
                            onClick={() => handleUnfollow(u._id)}
                            className="px-5 py-2 rounded-full border border-gray-600 hover:border-red-500 hover:text-red-500 text-sm font-medium transition-all"
                          >
                            Following
                          </button>
                       ) : (
                          <button 
                            onClick={() => handleFollow(u._id)}
                            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-md"
                          >
                            Follow
                          </button>
                       )}
                    </div>
                  )}
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default SocialListPage;
