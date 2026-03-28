import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaFileAlt, FaUserGraduate, FaCalendarAlt, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';

const TeacherTestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamDetail();
  }, [id]);

  const fetchExamDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/teacher/exam/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setExam(res.data.data.exam);
        setResults(res.data.data.results || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load test details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin w-10 h-10 border-4 border-[#0061FF] border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-[#0061FF]/20 selection:text-gray-900">
      
      <div className="max-w-[72rem] mx-auto space-y-10">
        
        {/* Top Navigation & Header */}
        <div>
          <button 
            onClick={() => navigate('/teacher/tests')}
            className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#0061FF] dark:hover:text-[#a5c3ff] transition-colors mb-6 focus:outline-none"
          >
            <span className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-[#0061FF]/5 group-hover:border-[#0061FF]/30 transition-all">
              <FaArrowLeft className="text-xs" />
            </span>
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                {exam.title}
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-3 max-w-2xl leading-relaxed">
                {exam.description || 'No additional instructions provided for this assessment.'}
              </p>
            </div>
            
            <div className="flex-shrink-0">
               <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ${
                  exam.status === 'ongoing' ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                  exam.status === 'completed' ? 'bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20' :
                  'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                }`}>
                  {exam.status}
              </span>
            </div>
          </div>
        </div>

        {/* Master Info Card */}
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Scheduled */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                <FaCalendarAlt className="text-xs" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Scheduled Date</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </p>
            </div>

            {/* Time */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                <FaClock className="text-xs" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Duration</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                {exam.duration} <span className="text-sm font-medium text-gray-500">Mins</span>
              </p>
            </div>

            {/* Total Marks */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                <FaFileAlt className="text-xs" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Max Score</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                {exam.totalMarks} <span className="text-sm font-medium text-gray-500">Pts</span>
              </p>
            </div>
            
            {/* Participants */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                <FaUserGraduate className="text-xs" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Participants</span>
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                {results.length} <span className="text-sm font-medium text-gray-500">Submissions</span>
              </p>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Performance Roster
              <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold">
                {results.length}
              </span>
            </h3>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] shadow-sm flex flex-col items-center justify-center animate-in fade-in">
              <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                <FaUserGraduate className="text-2xl text-gray-300 dark:text-gray-600" />
              </div>
              <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">No Submissions Yet</h4>
              <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
                Students have not completed this assessment. Results will populate here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr animate-in fade-in slide-in-from-bottom-4">
              {results.map((res) => (
                <div
                  key={res._id || Math.random()}
                  className="group relative bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-[#0061FF]/30 dark:hover:border-[#a5c3ff]/30 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Rank 1 Crown */}
                  {res.rank === 1 && (
                    <div className="absolute top-0 right-0 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-[1.5rem] shadow-sm flex items-center gap-1.5 border-b border-l border-amber-200 dark:border-amber-500/30">
                      Rank #1
                    </div>
                  )}

                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-sm ${
                          res.rank === 1 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' 
                            : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                        }`}>
                        {res.studentId?.name ? res.studentId.name[0].toUpperCase() : 'S'}
                      </div>
                      <div className="min-w-0 pr-12">
                        <h4 className="font-extrabold text-gray-900 dark:text-white tracking-tight truncate">{res.studentId?.name || 'Unknown Student'}</h4>
                        <p className="text-[11px] font-medium text-gray-500 truncate">{res.studentId?.email || 'No email provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Submitted {res.submittedAt ? new Date(res.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Final Score</p>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black tracking-tight leading-none ${
                           (res.score / exam.totalMarks) >= 0.8 ? 'text-emerald-500' :
                           (res.score / exam.totalMarks) >= 0.5 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {res.score || 0}
                        </span>
                        <span className="text-sm font-bold text-gray-400">/ {exam.totalMarks}</span>
                      </div>
                    </div>
                    
                    {res.rank && res.rank !== 1 && (
                      <div className="text-[11px] font-bold text-gray-500 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        Rank #{res.rank}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherTestDetail;
