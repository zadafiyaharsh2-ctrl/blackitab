import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaCommentDots, FaStar, FaUserTie, FaSearch, FaChevronDown, FaChevronUp, FaClock, FaUsers, FaSpinner } from 'react-icons/fa';

const HodFeedbackOverview = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/department/feedback').catch(() => ({ data: { success: true, data: [] } }));
      if (res.data.success) setFeedbacks(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch department feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group feedback by teacher
  const groupedByTeacher = useMemo(() => {
    const map = {};
    feedbacks.forEach(fb => {
      const tid = fb.teacherId?._id || 'unknown';
      if (!map[tid]) {
        map[tid] = {
          teacher: fb.teacherId || { name: 'Unknown Teacher', email: '' },
          feedbacks: [],
          totalRating: 0,
          count: 0,
        };
      }
      map[tid].feedbacks.push(fb);
      map[tid].totalRating += fb.rating || 0;
      map[tid].count += 1;
    });

    // Calculate avg rating
    Object.values(map).forEach(group => {
      group.avgRating = group.count > 0 ? (group.totalRating / group.count).toFixed(1) : '—';
    });

    return map;
  }, [feedbacks]);

  // Filter by search
  const filteredTeacherIds = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return Object.keys(groupedByTeacher).filter(tid => {
      const group = groupedByTeacher[tid];
      return (
        group.teacher.name?.toLowerCase().includes(query) ||
        group.teacher.email?.toLowerCase().includes(query) ||
        group.feedbacks.some(fb => fb.comment?.toLowerCase().includes(query))
      );
    });
  }, [groupedByTeacher, searchQuery]);

  // Overall stats
  const overallStats = useMemo(() => {
    if (feedbacks.length === 0) return { avg: 0, total: 0, teachers: 0 };
    const total = feedbacks.length;
    const avg = (feedbacks.reduce((acc, fb) => acc + (fb.rating || 0), 0) / total).toFixed(1);
    const teachers = Object.keys(groupedByTeacher).length;
    return { avg, total, teachers };
  }, [feedbacks, groupedByTeacher]);

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} size={12} />
  ));

  const toggleTeacher = (tid) => {
    setExpandedTeacher(prev => prev === tid ? null : tid);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-white relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-transparent dark:border-purple-500/30">
                <FaCommentDots className="text-3xl text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">Department Feedback</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  View all student feedback for teachers in your department
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm flex items-center justify-around">
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-1">
                {overallStats.avg} <FaStar className="text-yellow-400 text-xl" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Avg Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">{overallStats.total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Reviews</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">{overallStats.teachers}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Teachers</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by teacher name or feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm"
          />
        </div>

        {/* Teacher-wise Feedback */}
        {filteredTeacherIds.length === 0 ? (
          <div className="text-center py-24 glass-panel border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
            <FaCommentDots className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Feedback Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              No feedback available for your department teachers yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeacherIds.map(tid => {
              const group = groupedByTeacher[tid];
              const isExpanded = expandedTeacher === tid;
              return (
                <div key={tid} className="glass-panel border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Teacher Header — clickable */}
                  <button
                    onClick={() => toggleTeacher(tid)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                        {group.teacher.name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {group.teacher.name || 'Unknown Teacher'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{group.teacher.email || ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-200 dark:border-yellow-500/20">
                          <FaStar className="text-yellow-500 text-sm" />
                          <span className="font-bold text-yellow-700 dark:text-yellow-400">{group.avgRating}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-500/20">
                          <FaUsers className="text-blue-500 text-sm" />
                          <span className="font-bold text-blue-700 dark:text-blue-400">{group.count}</span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <FaChevronUp className="text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Feedback List */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-white/5 p-6 pt-4 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          {group.count} Feedback{group.count !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => navigate(`/hod/teacher/${tid}`)}
                          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          View Full Performance →
                        </button>
                      </div>

                      {group.feedbacks.map((fb, i) => (
                        <div key={fb._id || i} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-xs font-bold text-white">
                                {fb.studentId?.name ? fb.studentId.name[0].toUpperCase() : 'S'}
                              </div>
                              <div>
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {fb.studentId?.name || 'Anonymous Student'}
                                </span>
                                <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                  <FaClock className="text-[8px]" />
                                  {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-black/40 px-2 py-1 rounded-lg border border-gray-200 dark:border-white/5">
                              {renderStars(fb.rating)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic mt-2">
                            "{fb.comment || 'No comment provided.'}"
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {fb.feedbackType && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                                {fb.feedbackType === 'quiz_end' ? 'Quiz Feedback' : fb.feedbackType === 'realtime' ? 'Live Feedback' : fb.feedbackType === 'class' ? 'Class Feedback' : 'General'}
                              </span>
                            )}
                            {fb.batchId && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                {fb.batchId.name} {fb.batchId.classCode ? `(${fb.batchId.classCode})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HodFeedbackOverview;
