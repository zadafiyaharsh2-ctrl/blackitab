/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaFileAlt, FaClock, FaCalendarAlt, FaChalkboardTeacher, FaTrophy
} from 'react-icons/fa';
import API_URL from '../../config';
import toast from 'react-hot-toast';
import PageShimmer from '../../components/shared/PageShimmer';
import usePageTitle from '../../hooks/usePageTitle';

const StudentExamDetail = () => {
  const { classId, examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);

  usePageTitle(exam ? exam.title : 'Exam Detail');

  useEffect(() => {
    fetchExamDetail();
  }, [classId, examId]);

  const fetchExamDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/user/batches/${classId}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setExam(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load exam details');
      navigate(`/classes/${classId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageShimmer variant="detail" />;
  if (!exam) return null;

  const teacherName = exam.teacherId?.name || 'Unknown Teacher';
  const batchName = exam.batchId?.name || 'Class';
  
  // Basic states
  const now = new Date();
  const scheduledDate = exam.scheduledAt ? new Date(exam.scheduledAt) : null;
  
  let isOngoing = exam.status === 'ongoing';
  if (exam.status === 'scheduled' && scheduledDate) {
    if (now >= scheduledDate) {
        // Evaluate if passing start time constitutes ongoing
        const endTime = new Date(scheduledDate.getTime() + (exam.duration || 60) * 60000);
        if (now <= endTime) {
           isOngoing = true;
        }
    }
  }

  const isCompleted = exam.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pt-20">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent -mr-20 -mt-20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => navigate(`/classes/${classId}`)}
          className="relative z-10 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <FaArrowLeft className="text-[10px]" /> Back to {batchName}
        </button>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${isCompleted ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : isOngoing ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
              <FaFileAlt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border ${
                  isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                  isOngoing ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' : 
                  'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                }`}>
                  {isCompleted ? 'Completed' : isOngoing ? 'Active Now' : 'Upcoming'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white capitalize">{exam.title}</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FaChalkboardTeacher className="text-gray-400" /> Planned by {teacherName}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
             {isOngoing ? (
               <button 
                onClick={() => navigate(`/exam/${exam._id}`)} 
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex gap-2 items-center"
               >
                 Take Exam
               </button>
             ) : (
               <button disabled className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 rounded-xl text-sm font-semibold shadow-sm cursor-not-allowed border border-gray-200 dark:border-white/5">
                 Exam Not Active
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <FaCalendarAlt className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Date & Time</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{scheduledDate ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(scheduledDate) : 'TBD'}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
            <FaClock className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Duration</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.duration} minutes</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
            <FaTrophy className="text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Total Marks</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.totalMarks} pts</p>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm lg:col-span-2">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <FaFileAlt className="text-gray-400" /> Instructions & Details
        </h2>
        
        <div className="prose dark:prose-invert max-w-none prose-sm leading-relaxed text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#000000]/50 rounded-xl p-5 border border-gray-100 dark:border-white/5 whitespace-pre-wrap font-serif">
          {exam.description || 'No special instructions provided by the teacher for this exam.'}
        </div>
      </div>

    </div>
  );
};

export default StudentExamDetail;
