import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaChalkboardTeacher, FaUsers, FaClipboardList, FaCalendarAlt,
  FaStar, FaCommentDots, FaChartLine, FaSpinner, FaPlusCircle,
  FaFileAlt, FaGraduationCap, FaAward, FaCalendarDay, FaChevronRight
} from 'react-icons/fa';
import API from '../../config';
import PageShimmer from '../../components/shared/PageShimmer';

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/teacher/dashboard`, { headers });
      setDashboard(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageShimmer variant="dashboard" />;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-[#f8f9fa] dark:bg-black font-sans">
      <p className="text-red-500 font-semibold">{error}</p>
      <button onClick={fetchDashboard} className="px-6 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
        Retry Connection
      </button>
    </div>
  );

  const d = dashboard || {};

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] font-sans pb-24 transition-colors overflow-x-hidden">
      
      {/* Editorial Header Array */}
      <div className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 px-6 sm:px-10 lg:px-14 max-w-[90rem] mx-auto border-b border-gray-200 dark:border-white/10">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#0061FF]/3 to-transparent blur-[120px] pointer-events-none rounded-bl-full -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-6 shadow-sm">
              <FaChalkboardTeacher className="text-[#0061FF] dark:text-[#a5c3ff]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                Administration Hub
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Welcome back, <br className="hidden sm:block" />
              <span className="text-[#0061FF] dark:text-[#a5c3ff]">{user.name || 'Teacher'}</span>
            </h1>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link to="/question-management" className="px-6 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-[#0061FF]/30 dark:hover:border-[#a5c3ff]/30 flex items-center gap-2.5 transition-all shadow-sm">
              <FaPlusCircle className="text-[#0061FF] dark:text-[#a5c3ff]" />
              <span>Question Bank</span>
            </Link>
            <Link to="/school-analytics" className="px-6 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-[#0061FF]/30 dark:hover:border-[#a5c3ff]/30 flex items-center gap-2.5 transition-all shadow-sm">
              <FaChartLine className="text-[#0061FF] dark:text-[#a5c3ff]" />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-14 py-10 space-y-10">
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'My Batches', value: d.batchCount || 0, icon: <FaUsers />, link: '/teacher/batches' },
            { label: 'Questions', value: d.questionCount || 0, icon: <FaClipboardList />, link: '/question-management' },
            { label: 'Assignments', value: d.assignmentCount || 0, icon: <FaFileAlt /> },
            { label: 'Exams', value: d.examCount || 0, icon: <FaCalendarAlt /> },
          ].map((card, i) => {
            const Wrapper = card.link ? Link : 'div';
            const wrapperProps = card.link ? { to: card.link } : {};
            return (
              <Wrapper key={i} {...wrapperProps} className="group flex-1">
                <div className={`border border-gray-200 dark:border-white/10 rounded-[1.5rem] bg-white dark:bg-white/[0.02] p-6 lg:p-8 transition-all duration-300 ${card.link ? 'cursor-pointer hover:border-[#0061FF]/40 dark:hover:border-[#a5c3ff]/40 hover:-translate-y-1 hover:shadow-sm' : 'cursor-default'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#f8f9fa] dark:bg-white/5 border border-gray-100 dark:border-transparent flex items-center justify-center group-hover:bg-[#0061FF]/5 dark:group-hover:bg-[#0061FF]/20 transition-colors">
                      <div className="text-xl text-[#0061FF] dark:text-[#a5c3ff]">{card.icon}</div>
                    </div>
                    {card.link && <FaChevronRight className="text-gray-300 dark:text-gray-600 text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                  </div>
                  <p className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none mb-1 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{card.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{card.label}</p>
                </div>
              </Wrapper>
            );
          })}
        </div>

        {/* Split Screen Dashboard Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column (2/3): Profile & Performance */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Review / Ratings Billboard */}
            <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 sm:p-10 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 dark:bg-amber-400/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 md:gap-14">
                <div className="flex-shrink-0 text-center">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-center items-center gap-1.5"><FaStar className="text-amber-400 text-xs" /> Student Rating</h3>
                  <div className="text-6xl sm:text-7xl font-black tracking-tighter text-amber-500 leading-none">{d.studentRating?.average ? Number(d.studentRating.average).toFixed(1) : '0.0'}</div>
                  <div className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2">out of 5.0</div>
                </div>

                <div className="flex-1 w-full space-y-4 pt-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-2xl font-extrabold text-gray-900 dark:text-white">Performance Metrics</div>
                      <div className="text-[13px] font-medium text-gray-500 mt-1">Based on {d.studentRating?.totalReviews || 0} student reviews</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-[#f8f9fa] dark:bg-white/5 rounded-full h-3 border border-gray-100 dark:border-transparent overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${((d.studentRating?.average || 0) / 5) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Metadata & Info */}
            <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 sm:p-10 shadow-sm">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FaGraduationCap className="text-gray-300 dark:text-gray-500 text-sm" /> Professional Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Administrative Role</p>
                  <p className="font-extrabold text-gray-900 dark:text-white text-lg">
                    {d.role === 'hod' ? 'Head of Department' : d.role === 'institute_admin' ? 'Institute Admin' : 'Senior Teacher'}
                  </p>
                </div>
                
                {d.specialization && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Specialization</p>
                    <p className="font-extrabold text-gray-900 dark:text-white text-lg">{d.specialization}</p>
                  </div>
                )}
                
                {d.teacherSince && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Teaching Since</p>
                    <p className="font-extrabold text-gray-900 dark:text-white text-lg">{new Date(d.teacherSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Institute Scores Ribbon */}
            {d.instituteScores?.length > 0 && (
              <div className="border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] p-8 shadow-sm">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FaAward className="text-gray-300 dark:text-gray-500 text-sm" /> Verified Evaluation Scores
                </h3>
                <div className="flex flex-wrap gap-4">
                  {d.instituteScores.map((s, i) => (
                    <div key={i} className="flex-1 min-w-[120px] bg-[#f8f9fa] dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-5 text-center">
                      <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">{s.score}<span className="text-sm font-semibold text-gray-400">/100</span></p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">{s.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (1/3): Quick Administrative Actions */}
          <div className="lg:col-span-1 border border-gray-200 dark:border-white/10 rounded-[2rem] bg-white dark:bg-white/[0.02] overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8 pb-4 border-b border-gray-100 dark:border-white/5 bg-[#f8f9fa]/50 dark:bg-[#0a0a0a]">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Rapid Actions</h3>
              <p className="text-[13px] font-medium text-gray-500 mt-1">Jump directly to your workflows.</p>
            </div>
            
            <div className="flex flex-col p-2">
              {[
                { label: 'Manage Batches', desc: 'Create and view student groups', icon: <FaUsers />, link: '/teacher/batches' },
                { label: 'Take Attendance', desc: 'Mark daily attendance', icon: <FaCalendarDay />, link: '/teacher/attendance' },
                { label: 'Question Bank', desc: 'Manage & generate questions', icon: <FaClipboardList />, link: '/question-management' },
                { label: 'Question Paper', desc: 'Export questions as PDF', icon: <FaFileAlt />, link: '/question-paper' },
                { label: 'School Analytics', desc: 'Monitor student performance', icon: <FaChartLine />, link: '/school-analytics' },
              ].map((action, i) => (
                <Link key={i} to={action.link} className="group p-4 rounded-[1.25rem] hover:bg-[#f8f9fa] dark:hover:bg-white/5 flex items-center gap-4 transition-all">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#0061FF]/30 dark:group-hover:border-white/30 transition-colors shadow-sm">
                    <div className="text-[#0061FF] dark:text-[#a5c3ff] text-lg">{action.icon}</div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{action.label}</p>
                    <p className="text-[12px] font-medium text-gray-500 mt-0.5">{action.desc}</p>
                  </div>
                  <FaChevronRight className="text-gray-300 dark:text-gray-600 text-xs translate-x-0 group-hover:translate-x-1 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-all" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
