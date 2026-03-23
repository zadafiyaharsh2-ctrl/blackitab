import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaChalkboardTeacher, FaCalendarAlt, FaCheckCircle,
  FaTimesCircle, FaClock, FaArrowLeft, FaStar
} from 'react-icons/fa';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const AttendanceBar = ({ percent }) => {
  const color = percent >= 75 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent ?? 0}%` }} />
    </div>
  );
};

const ClassDetailHeader = ({ batch, summary, onBack, onFeedback }) => {
  const teachers = batch.teacherIds?.map(t => t.name).join(', ') || 'Not assigned';

  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
      >
        <FaArrowLeft className="text-[10px]" /> Back to Classes
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
          <AcademicCapIcon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{batch.name}</h1>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 font-medium"><FaChalkboardTeacher className="text-gray-400" /> {teachers}</span>
            {batch.year && <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-gray-400" /> Year {batch.year}</span>}
            {batch.section && <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md font-medium text-gray-600 dark:text-gray-300">Sec {batch.section}</span>}
            {batch.classCode && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md font-mono text-gray-600 dark:text-gray-300 text-[11px]">
                {batch.classCode}
              </span>
            )}
          </div>
        </div>
      </div>
            
      {summary && (
        <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">My Attendance</span>
            <span className={`text-sm font-bold ${
              summary.attendancePercent >= 75 ? 'text-emerald-600 dark:text-emerald-400' :
              summary.attendancePercent >= 50 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {summary.attendancePercent !== null ? `${summary.attendancePercent}%` : 'No data'}
            </span>
          </div>
          <AttendanceBar percent={summary.attendancePercent} />
          <div className="flex gap-6 mt-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><FaCheckCircle className="text-emerald-500 text-[10px]" /> {summary.present} Present</span>
            <span className="flex items-center gap-1.5"><FaTimesCircle className="text-red-500 text-[10px]" /> {summary.absent} Absent</span>
            {summary.late > 0 && <span className="flex items-center gap-1.5"><FaClock className="text-amber-500 text-[10px]" /> {summary.late} Late</span>}
          </div>
        </div>
      )}

      <button
        onClick={onFeedback}
        className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors font-medium"
      >
        <FaStar className="text-yellow-400 text-[10px]" /> Rate your teachers
      </button>
    </div>
  );
};

export default ClassDetailHeader;
