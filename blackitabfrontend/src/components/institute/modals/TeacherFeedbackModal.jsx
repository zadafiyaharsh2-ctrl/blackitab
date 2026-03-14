import React, { useState, useEffect } from 'react';
import { FaUserGraduate, FaStar, FaSpinner } from 'react-icons/fa';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../../utils/api';
import { CustomToast } from '../../../utils/CustomToast';

const TeacherFeedbackModal = ({ isOpen, onClose, teacher }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && teacher) {
      fetchFeedback();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teacher]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/feedback/institute/teacher/${teacher._id}`);
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch {
      CustomToast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Student Feedback for {teacher?.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto bg-gray-50 dark:bg-[#000000] flex-1">
          {loading ? (
             <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-2xl text-blue-500" /></div>
          ) : feedbacks.length === 0 ? (
             <div className="text-center py-10 text-gray-500">No feedback found for this teacher.</div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {feedbacks.map(fb => (
                  <div key={fb._id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-3">
                          {fb.studentId?.profileImage ? (
                            <img src={fb.studentId.profileImage} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400"><FaUserGraduate className="text-sm" /></div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{fb.studentId?.name || 'Anonymous Student'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {fb.studentId?.email ? `${fb.studentId.email} • ` : ''}
                                {new Date(fb.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                       </div>
                       <div className="flex gap-0.5">
                         {[1,2,3,4,5].map(s => <FaStar key={s} className={`text-sm ${s <= fb.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`} />)}
                       </div>
                    </div>
                    {fb.batchId && (
                       <div className="mb-3">
                         <span className="text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded inline-block">
                           Batch: {fb.batchId.name} {fb.batchId.classCode ? `(${fb.batchId.classCode})` : ''}
                         </span>
                       </div>
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                      "{fb.comment || "No comment provided."}"
                    </p>
                  </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherFeedbackModal;
