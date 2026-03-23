import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCommentDots, FaStar, FaUserGraduate, FaQuestionCircle, FaSearch } from 'react-icons/fa';
import API_URL from '../config';

const TeacherFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Only include class feedback, or just filter out realtime and quiz_end based on search
  const filteredFeedbacks = feedbacks.filter(f => {
    // Exclude quiz and realtime feedback as per user request
    if (f.feedbackType === 'quiz_end' || f.feedbackType === 'realtime') return false;
    
    const matchesSearch = 
      (f.comment && f.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.studentId?.name && f.studentId.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
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
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-[#0061FF]/20 selection:text-gray-900">
      
      <div className="max-w-[80rem] mx-auto space-y-10">
        
        {/* Header & Stats Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-sm">
              <FaCommentDots className="text-[#0061FF] text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Performance Reviews
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Class Feedback
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 max-w-xl leading-relaxed">
              Review qualitative and quantitative evaluations from your students, automatically organized by your active classes.
            </p>
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm flex items-center justify-around h-full min-h-[140px]">
            <div className="text-center group flex flex-col items-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter group-hover:text-amber-500 transition-colors">
                  {stats.avg}
                </span>
                <FaStar className="text-amber-400 text-2xl -mt-2" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Rating</span>
            </div>
            
            <div className="w-px h-16 bg-gray-100 dark:bg-white/10"></div>
            
            <div className="text-center group flex flex-col items-center">
              <div className="flex items-center justify-center mb-1">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter group-hover:text-[#0061FF] transition-colors">
                  {stats.total}
                </span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Reviews</span>
            </div>
          </div>

        </div>

        {/* Search Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-y border-gray-100 dark:border-white/5 py-6">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-sm" />
            </div>
            <input 
              type="text" 
              placeholder="Search feedback content or student..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-full py-3 pl-11 pr-4 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF]/50 transition-all shadow-sm"
            />
          </div>
        </div>


        {/* Feedback List Grid grouped by batch */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-10 h-10 border-4 border-[#0061FF]/20 border-t-[#0061FF] rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing Results</p>
            </div>
          ) : filteredFeedbacks.length > 0 ? (
            <div className="space-y-16">
              {Object.entries(
                filteredFeedbacks.reduce((acc, fb) => {
                  const batchName = fb.batchId ? `${fb.batchId.name} ${fb.batchId.classCode ? '('+fb.batchId.classCode+')' : ''}` : 'General / Unassigned';
                  if (!acc[batchName]) acc[batchName] = [];
                  acc[batchName].push(fb);
                  return acc;
                }, {})
              ).map(([batchName, batchFeedbacks]) => (
                <div key={batchName} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-white/10">
                     <span className="w-2 h-6 bg-[#0061FF] rounded-full shrink-0" />
                     <h2 className="text-2xl font-black text-gray-900 dark:text-white">{batchName}</h2>
                     <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 text-xs font-bold rounded-lg border border-gray-200 dark:border-white/5">
                        {batchFeedbacks.length}
                     </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                    {batchFeedbacks.map((item) => (
                      <div
                        key={item._id || Math.random()}
                        className="group relative bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-[#0061FF]/30 dark:hover:border-[#0061FF]/30 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          {/* Header: User & Rating */}
                          <div className="flex justify-between items-start mb-6 gap-4">
                            
                            <div className="flex items-center gap-3 min-w-0">
                               {item.studentId?.profileImage ? (
                                <img src={item.studentId.profileImage} alt="Student" className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" />
                               ) : (
                                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-lg font-black text-gray-600 dark:bg-white/10 dark:text-gray-300 border border-gray-200 dark:border-white/10 shadow-sm">
                                  {item.studentId?.name ? item.studentId.name[0].toUpperCase() : 'S'}
                                </div>
                               )}
                              <div className="min-w-0 truncate">
                                <h4 className="font-bold text-gray-900 dark:text-white tracking-tight text-sm truncate">{item.studentId?.name || 'Anonymous Student'}</h4>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-500 truncate mt-0.5">
                                  {item.studentId?.email && <span className="truncate">{item.studentId.email}</span>}
                                  {item.studentId?.email && <span>•</span>}
                                  <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-black/40 px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-white/5 flex-shrink-0 shadow-inner">
                              {renderStars(item.rating)}
                            </div>
                          </div>

                          {/* Comment Body */}
                          <div className="mb-8">
                            <p className={`text-[15px] leading-relaxed font-serif text-pretty ${item.comment ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-500 italic'}`}>
                              "{item.comment || 'No written contextual feedback was provided.'}"
                            </p>
                          </div>
                        </div>

                        {/* Tags Footer */}
                        <div className="pt-5 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-2 mt-auto">
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                            {getTypeLabel(item.feedbackType)}
                          </span>
                          
                          {item.questionId && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 flex items-center gap-1.5">
                              <FaQuestionCircle className="text-[11px]" /> Targeted Q.
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] shadow-sm max-w-3xl mx-auto flex flex-col items-center justify-center animate-in fade-in">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                <FaCommentDots className="text-3xl text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">No Feedback Found</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
                No evaluations match your current search criteria. Try adjusting the parameters or clearing the search box.
              </p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default TeacherFeedback;
