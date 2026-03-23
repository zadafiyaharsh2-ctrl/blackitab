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
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-indigo-500/20 selection:text-indigo-900">
      
      <div className="max-w-[75rem] mx-auto space-y-10">
        
        {/* Header & Master KPI Segment */}
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between border-b border-gray-200 dark:border-white/10 pb-8">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-sm">
              <FaUserTie className="text-indigo-600 dark:text-indigo-400 text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Department Directory
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Faculty Roster
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 max-w-xl leading-relaxed">
              Oversee and manage the educators assigned to your academic department. Review aggregate metrics regarding content creation and evaluations.
            </p>
          </div>

          {/* KPI Dashboard */}
          {analytics && (
            <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Headcount', value: teachers.length, icon: null },
                { label: 'Publications', value: analytics.totalTheories || 0, icon: null },
                { label: 'Assessments', value: analytics.totalQuestions || 0, icon: null },
                { label: 'Global Rating', value: analytics.avgRating ? analytics.avgRating.toFixed(1) : '—', icon: <FaStar className="text-amber-400 text-sm -mt-1" /> }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center justify-center min-w-[110px] group transition-all hover:border-indigo-500/30">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-2xl font-black text-gray-900 dark:text-white tracking-tighter group-hover:text-indigo-600 transition-colors">
                    {kpi.value} {kpi.icon}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teachers Grid */}
        <div className="min-h-[400px]">
          {teachers.length === 0 ? (
            <div className="text-center py-24 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] shadow-sm max-w-3xl mx-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                <FaChalkboardTeacher className="text-3xl text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Directory Empty</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
                No faculty members have been explicitly routed or assigned to your department's jurisdiction at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {teachers.map((teacher, idx) => (
                <div
                  key={teacher._id || idx}
                  onClick={() => navigate(`/hod/teacher/${teacher._id}`)}
                  className="group relative bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/5 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Top Block: Profile */}
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xl font-black shadow-inner border border-indigo-200 dark:border-indigo-500/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        {teacher.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 pr-4">
                        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight">
                          {teacher.name}
                        </h3>
                        <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">{teacher.email}</p>
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:border-indigo-500/30 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400 transition-all flex-shrink-0 mt-1 shadow-sm">
                      <FaArrowRight className="text-[10px] transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Middle Block: Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    
                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1.5 text-base font-black text-gray-900 dark:text-white">
                        <FaBookOpen className="text-sky-500 text-[10px]" /> 
                        {teacher.theoryCount || 0}
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Theories</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1.5 text-base font-black text-gray-900 dark:text-white">
                        <FaQuestionCircle className="text-emerald-500 text-[10px]" /> 
                        {teacher.questionCount || 0}
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Questions</span>
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1.5 text-base font-black text-gray-900 dark:text-white">
                        <FaStar className="text-amber-500 text-[10px] -mt-0.5" /> 
                        {teacher.avgRating?.toFixed(1) || '—'}
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rating</span>
                    </div>

                  </div>

                  {/* Bottom Block: Specialization */}
                  {teacher.specialization && (
                    <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10">
                      <div className="inline-flex items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 rounded-full shadow-sm max-w-full truncate">
                          {teacher.specialization}
                        </span>
                      </div>
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

export default HodDepartmentTeachers;
