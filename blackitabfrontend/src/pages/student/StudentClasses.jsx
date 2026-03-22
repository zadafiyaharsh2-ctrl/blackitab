import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaChalkboardTeacher, FaCalendarAlt, 
  FaPlus, FaTimes, FaSpinner, FaChevronRight
} from 'react-icons/fa';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import API_URL from '../../config';
import toast from 'react-hot-toast';

const INSTITUTE_REQUIRED_FOR_CLASSES_MESSAGE = 'You must join an institute before joining any class.';

const ClassCard = ({ batch }) => {
  const navigate = useNavigate();
  const teachers = batch.teacherIds?.map(t => t.name).join(', ') || 'Not assigned';

  return (
    <div 
      onClick={() => navigate(`/classes/${batch._id}`)}
      className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02] cursor-pointer hover:border-blue-500/30 dark:hover:border-blue-500/50 transition-all hover:shadow-md group"
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-900 group-hover:bg-blue-600 dark:bg-white dark:group-hover:bg-blue-500 transition-colors flex items-center justify-center text-white dark:text-gray-900 font-bold text-lg shrink-0 shadow-sm">
            {batch.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{batch.name}</h3>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1.5"><FaChalkboardTeacher /> {teachers}</span>
              {batch.year && <span className="flex items-center gap-1.5"><FaCalendarAlt /> Year {batch.year}</span>}
              {batch.section && <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md">Section {batch.section}</span>}
            </div>
          </div>
        </div>
        <div className="text-gray-400 group-hover:text-blue-500 transition-colors flex items-center gap-1.5 text-sm font-semibold mr-2 bg-gray-50 dark:bg-white/5 py-1.5 px-3 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10">
          View Details <FaChevronRight className="text-xs" />
        </div>
      </div>
    </div>
  );
};

const StudentClasses = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })();

    const isStudentWithoutInstitute = storedUser?.role === 'student' && !storedUser?.instituteId;

    if (isStudentWithoutInstitute) {
      setLoading(false);
      navigate('/profile', {
        state: {
          openJoinInstituteModal: true,
          instituteRequiredMessage: INSTITUTE_REQUIRED_FOR_CLASSES_MESSAGE
        }
      });
      return;
    }

    fetchBatches();
  }, [navigate]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/user/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBatches(res.data.data);
    } catch {
      toast.error('Failed to load your classes');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    setJoining(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/user/batch/join`, { classCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowJoinModal(false);
        setClassCode('');
        fetchBatches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join class');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-[#0061FF]/20 selection:text-gray-900">
      
      <div className="max-w-[75rem] mx-auto space-y-10">

        {/* Master Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-sm">
              <AcademicCapIcon className="w-3 h-3 text-[#0061FF] dark:text-[#a5c3ff]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Academic Portfolio
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              My Classes
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 max-w-lg">
              Access your enrolled active learning environments, review attendance records, and track your academic progress.
            </p>
          </div>
          
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-shrink-0 group flex items-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-[#0061FF] dark:hover:bg-[#0061FF] dark:hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[#0061FF]/20"
          >
            <FaPlus className="text-[10px] transform group-hover:rotate-90 transition-transform" /> Join New Class
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-[#0061FF]/10 dark:border-white/5 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#0061FF] border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 animate-pulse">Synchronizing Enrollments...</p>
            </div>

          ) : batches.length === 0 ? (
            
            /* Empty State */
            <div className="text-center py-24 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] shadow-sm max-w-3xl mx-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                <FaUsers className="text-3xl text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">No Active Enrollments</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto mb-8">
                You have not yet joined any classes for this academic session. Enter a 6-digit access code provided by your instructor to begin.
              </p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-8 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#0061FF]/30 dark:hover:border-[#0061FF]/30 hover:bg-white dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm focus:outline-none"
              >
                Enter Access Code
              </button>
            </div>

          ) : (
            
            /* Classes Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {batches.map((batch, idx) => {
                const teachers = batch.teacherIds?.map(t => t.name).join(', ') || 'Unassigned Educator';
                
                return (
                  <div 
                    key={batch._id || idx}
                    onClick={() => navigate(`/classes/${batch._id}`)}
                    className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 hover:border-[#0061FF]/30 dark:hover:border-[#0061FF]/40 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-[#0061FF]/5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0061FF]/0 to-[#0061FF]/5 dark:to-[#0061FF]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex items-start justify-between gap-4 mb-8">
                       <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 group-hover:bg-[#0061FF] dark:group-hover:bg-[#0061FF] dark:group-hover:text-white flex items-center justify-center text-xl font-black shadow-md border border-gray-800 dark:border-gray-200 flex-shrink-0 transition-colors duration-300 transform group-hover:-rotate-3">
                         {batch.name?.charAt(0).toUpperCase()}
                       </div>
                       
                       <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:border-[#0061FF]/30 group-hover:bg-[#0061FF]/5 group-hover:text-[#0061FF] dark:group-hover:bg-[#0061FF]/10 dark:group-hover:text-[#a5c3ff] transition-all flex-shrink-0 mt-1">
                          <FaChevronRight className="text-[10px] transform group-hover:translate-x-0.5 transition-transform" />
                       </div>
                    </div>

                    <div className="min-w-0 mb-6">
                      <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white truncate group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors tracking-tight mb-2">
                        {batch.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <FaChalkboardTeacher className="text-[10px]" />
                        <span className="truncate">{teachers}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-100 dark:border-white/5 mt-auto">
                      {batch.year && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <FaCalendarAlt /> Year {batch.year}
                        </span>
                      )}
                      {batch.section && (
                        <span className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          Sec {batch.section}
                        </span>
                      )}
                    </div>

                    {/* View Details Hint */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0061FF] dark:text-[#a5c3ff]">
                        Enter Space
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Join Class Modal Window */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowJoinModal(false)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
            
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">Access Secured Space</h3>
              <button 
                onClick={() => setShowJoinModal(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 transition-colors focus:outline-none"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
            
            <form onSubmit={handleJoin} className="p-8 space-y-8">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 text-center">
                  Authentication Code
                </label>
                <input
                  type="text"
                  placeholder="------"
                  value={classCode}
                  onChange={e => setClassCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border-2 border-gray-200 dark:border-white/10 rounded-2xl px-4 py-4 text-2xl font-black text-gray-900 dark:text-white font-mono tracking-[0.3em] text-center focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm uppercase placeholder-gray-300 dark:placeholder-gray-700"
                />
              </div>
              
              <div className="text-center space-y-1">
                 <p className="text-xs font-semibold text-gray-500">
                    A 6-digit alphanumeric code is required.
                 </p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Approval pending instructor review.
                 </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={joining || classCode.length !== 6}
                  className="w-full py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-[#0061FF] dark:hover:bg-[#0061FF] dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md focus:outline-none"
                >
                  {joining ? <FaSpinner className="animate-spin text-sm" /> : null} 
                  {joining ? 'Authenticating...' : 'Request Access'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowJoinModal(false)}
                  className="w-full py-3.5 bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none"
                >
                  Cancel Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentClasses;
