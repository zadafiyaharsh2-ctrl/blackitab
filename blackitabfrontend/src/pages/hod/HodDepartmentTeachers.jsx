import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaUserTie, FaStar, FaChalkboardTeacher, FaBookOpen, FaQuestionCircle, FaArrowRight, FaChartLine } from 'react-icons/fa';
import PageShimmer from '../../components/shared/PageShimmer';

const HodDepartmentTeachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersRes, analyticsRes] = await Promise.all([
        api.get('/teacher/department/teachers').catch(() => ({ data: { success: true, data: [] } })),
        api.get('/teacher/department/analytics').catch(() => ({ data: { success: true, data: null } }))
      ]);
      if (teachersRes.data.success) setTeachers(teachersRes.data.data || []);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch department data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageShimmer variant="cards" />;

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-white relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="glass-panel p-6 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-transparent dark:border-purple-500/30">
              <FaUserTie className="text-3xl text-purple-700 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Department Teachers</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and manage teachers in your department
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 border border-gray-200 dark:border-white/10 rounded-2xl text-center">
              <div className="text-3xl font-black text-purple-500 dark:text-purple-400">{teachers.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Teachers</div>
            </div>
            <div className="glass-panel p-5 border border-gray-200 dark:border-white/10 rounded-2xl text-center">
              <div className="text-3xl font-black text-blue-500 dark:text-blue-400">{analytics.totalTheories || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Theories</div>
            </div>
            <div className="glass-panel p-5 border border-gray-200 dark:border-white/10 rounded-2xl text-center">
              <div className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{analytics.totalQuestions || 0}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Questions</div>
            </div>
            <div className="glass-panel p-5 border border-gray-200 dark:border-white/10 rounded-2xl text-center">
              <div className="text-3xl font-black text-yellow-500 dark:text-yellow-400 flex items-center justify-center gap-1">
                {analytics.avgRating?.toFixed(1) || '—'} <FaStar className="text-xl" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">Avg Rating</div>
            </div>
          </div>
        )}

        {/* Teachers Grid */}
        {teachers.length === 0 ? (
          <div className="text-center py-24 glass-panel border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
            <FaChalkboardTeacher className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Teachers Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              No teachers are currently assigned to your department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                onClick={() => navigate(`/hod/teacher/${teacher._id}`)}
                className="group cursor-pointer glass-panel border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                    {teacher.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                      {teacher.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{teacher.email}</p>
                  </div>
                  <FaArrowRight className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                      <FaBookOpen className="text-blue-400 text-xs" /> {teacher.theoryCount || 0}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Theories</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                      <FaQuestionCircle className="text-emerald-400 text-xs" /> {teacher.questionCount || 0}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-yellow-500">
                      <FaStar className="text-xs" /> {teacher.avgRating?.toFixed(1) || '—'}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Rating</div>
                  </div>
                </div>

                {teacher.specialization && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                    <span className="text-xs font-medium px-2.5 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-lg">
                      {teacher.specialization}
                    </span>
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

export default HodDepartmentTeachers;
