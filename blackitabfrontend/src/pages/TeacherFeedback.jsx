import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCommentDots, FaStar, FaUserGraduate, FaQuestionCircle, FaSearch, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';

const TeacherFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, quiz_end, realtime, general

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      // Replace with actual endpoint to get teacher's feedbacks
      const res = await axios.get(`${API_URL}/api/feedback/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: { success: true, data: [] } }));
      
      setFeedbacks(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (feedbacks.length === 0) return { avg: 0, total: 0, fiveStar: 0 };
    const total = feedbacks.length;
    const avg = (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1);
    const fiveStar = feedbacks.filter(f => f.rating === 5).length;
    return { avg, total, fiveStar };
  };

  const stats = getStats();

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = 
      (f.comment && f.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.studentId?.name && f.studentId.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || f.feedbackType === filterType;
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-slate-300 dark:text-gray-600'}
        size={14}
      />
    ));
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'quiz_end': return 'Quiz Feedback';
      case 'realtime': return 'Live Feedback';
      case 'class': return 'Class Feedback';
      default: return 'General';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] p-6 text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-rose-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col justify-center glass-panel p-6 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-rose-100 dark:bg-rose-500/20 border border-transparent dark:border-rose-500/30">
                <FaCommentDots className="text-3xl text-rose-700 dark:text-rose-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Student Feedback</h1>
                <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Review feedback on your teaching, quizzes, and content.</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center justify-around">
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                {stats.avg} <FaStar className="text-yellow-400 text-xl" />
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Avg Rating</div>
            </div>
            <div className="w-px h-12 bg-slate-200 dark:bg-white/10"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Reviews</div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 dark:text-gray-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search feedback..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 snap-x custom-scrollbar">
            {['all', 'general', 'quiz_end', 'realtime', 'class'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`snap-center px-6 py-4 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                  filterType === type 
                    ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                {type === 'all' ? 'All Feedback' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeedbacks.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item._id || index}
                className="group relative bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:hover:border-rose-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold text-white shadow-inner border border-white/10">
                      {item.studentId?.name ? item.studentId.name[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.studentId?.name || 'Anonymous Student'}</h4>
                      <div className="text-xs text-slate-500 dark:text-gray-500 font-mono mt-0.5">
                        {item.studentId?.email ? `${item.studentId.email} • ` : ''}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                   
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                    {renderStars(item.rating)}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-700 dark:text-gray-300 italic">
                    "{item.comment || 'No written feedback provided.'}"
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                    {getTypeLabel(item.feedbackType)}
                  </span>
                  {item.batchId && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      Batch: {item.batchId.name} {item.batchId.classCode ? `(${item.batchId.classCode})` : ''}
                    </span>
                  )}
                  {item.questionId && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                      <FaQuestionCircle /> Question Ref
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-panel border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <FaCommentDots className="text-5xl text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Feedback Found</h3>
            <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto mb-6">You don't have any feedback matching your current filters.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherFeedback;
