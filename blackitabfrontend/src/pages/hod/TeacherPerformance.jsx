import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { FaArrowLeft, FaStar, FaBookOpen, FaQuestionCircle, FaUsers, FaCommentDots, FaCalendarCheck, FaChartLine, FaCheckCircle, FaClock } from 'react-icons/fa';

const TeacherPerformance = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Determine if this is accessed from institute or hod context
  const isInstituteContext = location.pathname.startsWith('/institute');

  useEffect(() => {
    fetchTeacherDetail();
  }, [teacherId]);

  const fetchTeacherDetail = async () => {
    try {
      setLoading(true);
      // Use HOD endpoint for department-scoped view, or institute endpoint
      const endpoint = isInstituteContext
        ? `/institute/teachers/${teacherId}/feedback`
        : `/teacher/department/teacher/${teacherId}/detail`;

      const res = await api.get(endpoint).catch(() => ({ data: { success: false } }));

      if (res.data.success) {
        setTeacher(res.data.data);
      } else {
        // Fallback: try the other endpoint
        const fallbackEndpoint = isInstituteContext
          ? `/teacher/department/teacher/${teacherId}/detail`
          : `/institute/teachers/${teacherId}/feedback`;
        const fallbackRes = await api.get(fallbackEndpoint).catch(() => ({ data: { success: false } }));
        if (fallbackRes.data.success) setTeacher(fallbackRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch teacher detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <FaChartLine className="text-5xl text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Teacher Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Could not load performance data for this teacher.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { key: 'theories', label: 'Theories', icon: <FaBookOpen /> },
    { key: 'questions', label: 'Questions', icon: <FaQuestionCircle /> },
    { key: 'feedback', label: 'Feedback', icon: <FaCommentDots /> },
  ];

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-600"} size={12} />
  ));

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-white relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Back Button + Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full transition-colors group"
          >
            <FaArrowLeft className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
          <h1 className="text-2xl font-black">Teacher Performance</h1>
        </div>

        {/* Teacher Info Card */}
        <div className="glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
              {teacher.name?.charAt(0).toUpperCase() || 'T'}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black">{teacher.name || 'Unknown Teacher'}</h2>
              <p className="text-gray-500 dark:text-gray-400">{teacher.email || ''}</p>
              {teacher.specialization && (
                <span className="inline-block mt-2 text-xs font-medium px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-lg">
                  {teacher.specialization}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-200 dark:border-yellow-500/20">
              <FaStar className="text-yellow-500" />
              <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{teacher.avgRating?.toFixed(1) || '—'}</span>
              <span className="text-xs text-yellow-600 dark:text-yellow-500 ml-1">({teacher.totalReviews || 0} reviews)</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="text-center">
              <div className="text-2xl font-black text-blue-500 dark:text-blue-400">{teacher.theoryCount || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Theories Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{teacher.questionCount || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Questions Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-500 dark:text-orange-400">{teacher.postCount || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-rose-500 dark:text-rose-400">{teacher.batchCount || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Batches</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              {(teacher.recentActivity?.length > 0) ? (
                <div className="space-y-3">
                  {teacher.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'theory' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                        activity.type === 'question' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                        'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
                      }`}>
                        {activity.type === 'theory' ? <FaBookOpen /> : activity.type === 'question' ? <FaQuestionCircle /> : <FaCheckCircle />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title || 'Activity'}</p>
                        <p className="text-xs text-gray-500">{activity.date ? new Date(activity.date).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No recent activity data available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'theories' && (
          <div className="space-y-4">
            {(teacher.theories?.length > 0) ? teacher.theories.map((theory, i) => (
              <div key={theory._id || i} className="glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base">{theory.title || 'Untitled Theory'}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{theory.description || theory.content?.substring(0, 100) || ''}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${
                    theory.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                    theory.status === 'rejected' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20' :
                    'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                  }`}>
                    {theory.status || 'pending'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span><FaClock className="inline mr-1" />{theory.createdAt ? new Date(theory.createdAt).toLocaleDateString() : ''}</span>
                  <span>{theory.subject || ''}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 glass-panel border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                <FaBookOpen className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No theories found for this teacher.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4">
            {(teacher.questions?.length > 0) ? teacher.questions.map((q, i) => (
              <div key={q._id || i} className="glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base">{q.questionText || q.question || 'Untitled Question'}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {q.subject && <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded">{q.subject}</span>}
                      {q.difficulty && <span className="text-[10px] font-medium px-2 py-0.5 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 rounded">{q.difficulty}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${
                    q.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                    'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
                  }`}>
                    {q.status || 'pending'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 glass-panel border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                <FaQuestionCircle className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No questions found for this teacher.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-4">
            {(teacher.feedbacks?.length > 0 || teacher.feedback?.length > 0) ? (teacher.feedbacks || teacher.feedback || []).map((fb, i) => (
              <div key={fb._id || i} className="glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-rose-500/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold text-white border border-white/10">
                      {fb.studentId?.name ? fb.studentId.name[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{fb.studentId?.name || 'Anonymous'}</h4>
                      <span className="text-xs text-gray-500">{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-black/40 px-2 py-1 rounded-lg border border-gray-200 dark:border-white/5">
                    {renderStars(fb.rating)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{fb.comment || 'No comment provided.'}"</p>
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                    {fb.feedbackType === 'quiz_end' ? 'Quiz Feedback' : fb.feedbackType === 'realtime' ? 'Live Feedback' : 'General'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 glass-panel border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                <FaCommentDots className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No feedback found for this teacher.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPerformance;
