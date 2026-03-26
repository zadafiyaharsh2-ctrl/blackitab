import React from 'react';
import { FaStar, FaGraduationCap, FaAward } from 'react-icons/fa';

const TeacherProfileMetrics = ({ d }) => {
  return (
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
  );
};

export default TeacherProfileMetrics;
