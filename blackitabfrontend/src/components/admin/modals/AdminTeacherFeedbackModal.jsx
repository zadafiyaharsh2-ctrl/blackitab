import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner, FaComments, FaStar, FaUserGraduate } from 'react-icons/fa';
import API_URL from '../../../config';
import { CustomToast } from '../../../utils/CustomToast';

const AdminTeacherFeedbackModal = ({ isOpen, onClose, teacher, adminToken }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/feedback/admin/teacher/${teacher._id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch {
      CustomToast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [teacher, adminToken]);

  useEffect(() => {
    if (isOpen && teacher) fetchFeedback();
  }, [isOpen, teacher, fetchFeedback]);

  if (!isOpen) return null;

  return (
    <>
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="glass-panel w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0 bg-white/[0.02]">
          <div>
             <h3 className="font-bold text-white text-lg">Feedback: {teacher?.name}</h3>
             <p className="text-xs text-gray-400">Viewing unfiltered feedback records</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"><FaTimes /></button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center items-center py-20"><FaSpinner className="animate-spin text-3xl text-purple-500" /></div>
          ) : feedbacks.length === 0 ? (
             <div className="text-center py-20 bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
                <FaComments className="text-4xl text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No feedback entries found for this teacher.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {feedbacks.map(fb => (
                  <div key={fb._id} className="bg-white/[0.04] p-5 rounded-xl border border-white/10 relative group hover:border-purple-500/30 transition-colors">
                    {fb.isAnonymous && (
                       <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/20">
                         ANONYMOUS SUBMISSION
                       </div>
                    )}
                    <div className="flex gap-3 mb-4">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {fb.studentId?.profileImage ? (
                             <img src={fb.studentId.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                             <FaUserGraduate className="text-gray-400" />
                          )}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">
                             {fb.studentId?.name || 'Unknown Student'}
                             {fb.isAnonymous && <span className="text-gray-500 font-normal ml-1">(Hidden from Teacher)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                             {fb.studentId?.email ? `${fb.studentId.email} • ` : ''}
                             {new Date(fb.createdAt).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex gap-1 mb-3">
                       {[1,2,3,4,5].map(s => <FaStar key={s} className={`text-sm ${s <= fb.rating ? 'text-yellow-400' : 'text-gray-700'}`} />)}
                    </div>
                    
                    {fb.batchId && (
                       <div className="mb-3">
                         <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                           Batch: {fb.batchId.name} {fb.batchId.classCode ? `(${fb.batchId.classCode})` : ''}
                         </span>
                       </div>
                    )}
                    
                    <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                       <p className="text-sm text-gray-300 italic">
                         "{fb.comment || "No text feedback provided."}"
                       </p>
                    </div>
                  </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminTeacherFeedbackModal;
