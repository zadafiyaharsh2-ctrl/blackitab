import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSpinner, FaFire, FaUserFriends, FaImage } from 'react-icons/fa';
import API_URL from '../../config';
import Post from '../../components/student/Post';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/posts/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error('Feed error:', err);
      // If it's a 404, it might mean the endpoint is different or empty
      setError('Failed to load social feed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts(prev => prev.filter(p => p._id !== deletedId));
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FaUserFriends className="text-blue-500" />
            Social Feed
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">See what your network is sharing and discussing</p>
        </div>
        <Link 
          to="/create-post"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 shrink-0"
        >
          <FaPlus /> Create Post
        </Link>
      </div>

      {/* Mini Create Post Prompt (Like Facebook/LinkedIn) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-8 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
          U
        </div>
        <Link 
          to="/create-post"
          className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 px-4 py-3 rounded-full text-sm text-left transition-colors"
        >
          Share something with your network...
        </Link>
        <Link to="/create-post" className="p-3 text-green-500 hover:bg-green-500/10 rounded-full transition-colors">
          <FaImage size={20} />
        </Link>
      </div>

      {/* Feed Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FaSpinner className="animate-spin text-4xl mb-4 text-blue-500" />
            <p>Loading your feed...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-500">
            <p>{error}</p>
            <button onClick={fetchFeed} className="mt-4 px-6 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition font-medium">Try Again</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFire className="text-3xl text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">It's quiet here...</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Follow more people to see their posts, or create one yourself to get started!</p>
            <Link 
              to="/create-post"
              className="inline-block bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-medium transition-colors border border-gray-200 dark:border-gray-700"
            >
              Write your first post
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            {posts.map(post => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Post post={post} onPostDeleted={handlePostDeleted} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
