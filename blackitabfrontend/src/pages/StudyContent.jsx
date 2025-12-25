import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { FaPlay, FaUser, FaEye, FaHeart, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StudyContent = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudyContent();
  }, []);

  const fetchStudyContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/posts/study-content`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setContent(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching study content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎓 Study Content</h1>
          <p className="text-gray-400">Educational videos and learning materials from our community</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content by title or description..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading study content...</p>
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer group hover:border-purple-500/50 transition-all"
                onClick={() => navigate(`/content/${item._id}`)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  {item.mediaType === 'video' ? (
                    <video src={item.mediaUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Play Icon Overlay */}
                  {item.mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-purple-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaPlay className="text-white ml-1" size={20} />
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                      {item.user?.profileImage ? (
                        <img src={item.user.profileImage} alt={item.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FaUser size={14} className="text-gray-400" />
                      )}
                    </div>
                    <span className="text-xs text-white font-medium">{item.user?.name}</span>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaHeart size={12} />
                      <span>{item.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaEye size={12} />
                      <span>Views</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Study Content Yet</h3>
            <p className="text-gray-400 mb-6">Be the first to share educational content!</p>
            <button
              onClick={() => navigate('/create-post')}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Create Study Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyContent;
