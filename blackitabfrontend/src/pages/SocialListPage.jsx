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
    <div className="relative overflow-hidden font-sans text-gray-900 dark:text-white min-h-[80vh]">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full transition-colors group">
            <FaArrowLeft size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
          <h1 className="text-3xl font-bold capitalize text-blue-600 dark:text-blue-400 text-glow">{type}</h1>
        </div>

        {/* Content */}
        <div className="glass-panel border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl bg-white/50 dark:bg-white/5 backdrop-blur-md">
          {loading ? (
             <div className="flex justify-center py-20">
                 <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
             </div>
          ) : error ? (
             <div className="text-center text-red-400 py-20 font-medium">{error}</div>
          ) : users.length === 0 ? (
             <div className="text-center text-gray-500 py-20 font-medium text-lg">No users found</div>
          ) : (
             <div className="divide-y divide-gray-200 dark:divide-white/5">
               {users.map(u => (
                 <div key={u._id} className="flex items-center justify-between py-5 hover:bg-gray-50 dark:hover:bg-white/5 px-4 -mx-4 rounded-xl transition-all cursor-pointer group" onClick={() => navigate(`/profile/${u._id}`)}>
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-105 transition-transform">
                          {u.name?.charAt(0).toUpperCase()}
                       </div>
                       <div>
                          <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{u.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{u.followerCount || 0} followers</div>
                       </div>
                    </div>

                    {/* Action Button */}
                    {(currentUser?._id || currentUser?.id) !== (u._id || u.id) && (
                      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-3">
                         <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/messages/${u._id}`); }}
                            className="p-3 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-white/10"
                            title="Message"
                         >
                            <FaEnvelope size={16} />
                         </button>

                         {u.isFollowing ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleUnfollow(u._id); }}
                              className="px-6 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-bold transition-all text-gray-600 dark:text-gray-300"
                            >
                              Following
                            </button>
                         ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleFollow(u._id); }}
                              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:scale-105"
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
    </div>
  );
};

export default SocialListPage;
