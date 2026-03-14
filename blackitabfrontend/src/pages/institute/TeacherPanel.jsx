import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import {
  AcademicCapIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { FaStar, FaUserGraduate, FaSpinner } from 'react-icons/fa';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';

const TeacherPanel = () => {
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedTeacherForFeedback, setSelectedTeacherForFeedback] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher'
  });

  // Generic Confirmation Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    action: null,
    id: null,
    title: '',
    message: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, instRes] = await Promise.all([
        api.get('/institute/members'),
        api.get('/institute/my')
      ]);
      if (membersRes.data.success) {
        setTeachers(membersRes.data.data.filter(m => m.role === 'teacher' || m.role === 'hod'));
      }
      if (instRes.data.success) {
        setInstitute(instRes.data.data);
      }
    } catch (error) {
      CustomToast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/institute/members', formData);
      if (res.data.success) {
        CustomToast.success(res.data.message);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', password: '', role: 'teacher' });
        fetchData();
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to add teacher');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/institute/members/${editTeacher._id}/role`, {
        role: editTeacher.role,
        departments: editTeacher.departments
      });
      if (res.data.success) {
        CustomToast.success('Teacher updated successfully');
        setIsEditModalOpen(false);
        setEditTeacher(null);
        fetchData();
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to update teacher');
    }
  };

  const executeRemove = async (id) => {
    try {
      const res = await api.delete(`/institute/members/${id}`);
      if (res.data.success) { CustomToast.success(res.data.message); fetchData(); }
    } catch (error) {
      CustomToast.error('Failed to remove teacher');
    }
  };

  const handleRemove = (id) => {
    setConfirmState({
      isOpen: true,
      action: executeRemove,
      id: id,
      title: 'Remove Teacher',
      message: 'Are you sure you want to remove this teacher from the institute?'
    });
  };

  const toggleDepartment = (dept) => {
    const current = editTeacher.departments || [];
    setEditTeacher({
      ...editTeacher,
      departments: current.includes(dept) ? current.filter(d => d !== dept) : [...current, dept]
    });
  };

  if (loading) return <LoadingSpinner />;

  const inputCls = 'w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-gray-400" />
            Teacher Panel
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage institute teachers and HODs</p>
        </div>
        {user?.role === 'institute' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold flex items-center gap-1.5 self-start md:self-auto"
          >
            <PlusIcon className="w-4 h-4" /> Add Teacher
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-100 dark:border-white/5">
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Teacher</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Departments</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-10 text-center text-sm text-gray-500">No teachers found in the institute.</td>
                </tr>
              ) : (
                teachers.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-bold shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        t.role === 'hod'
                          ? 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                      }`}>
                        {t.role === 'hod' ? 'HOD' : 'Teacher'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.departments?.length > 0 ? (
                          t.departments.map(d => (
                            <span key={d} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs text-gray-600 dark:text-gray-400">{d}</span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">None assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {user?.role === 'institute' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedTeacherForFeedback(t); setIsFeedbackModalOpen(true); }}
                            className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-500/30 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            title="View Feedback"
                          >
                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditTeacher(t); setIsEditModalOpen(true); }}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(t._id)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-500/30 transition-colors"
                            title="Remove"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Add New Teacher</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" required minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={inputCls}>
                  <option value="teacher">Teacher</option>
                  <option value="hod">HOD</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold">Add Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {isEditModalOpen && editTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">Edit Teacher</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <form id="editTeacherForm" onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={editTeacher.role}
                    onChange={e => setEditTeacher({...editTeacher, role: e.target.value})}
                    className={inputCls}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="hod">HOD</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Departments</label>
                  <div className="space-y-2">
                    {institute?.departments?.length > 0 ? (
                      institute.departments.map(dept => (
                        <label key={dept} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                            checked={(editTeacher.departments || []).includes(dept)}
                            onChange={() => toggleDepartment(dept)}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-200">{dept}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No departments created in Institute Profile yet.</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 shrink-0 flex gap-3">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button type="submit" form="editTeacherForm" className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {isFeedbackModalOpen && selectedTeacherForFeedback && (
        <TeacherFeedbackModal 
          isOpen={isFeedbackModalOpen} 
          onClose={() => { setIsFeedbackModalOpen(false); setSelectedTeacherForFeedback(null); }} 
          teacher={selectedTeacherForFeedback} 
        />
      )}

      <SimpleConfirmationModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false, id: null, action: null })}
        onConfirm={() => {
        if (confirmState.action && confirmState.id) {
            confirmState.action(confirmState.id);
        }
        setConfirmState({ ...confirmState, isOpen: false, id: null, action: null });
        }}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Confirm"
        isDanger={true}
      />
    </div>
  );
};

const TeacherFeedbackModal = ({ isOpen, onClose, teacher }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && teacher) {
      fetchFeedback();
    }
  }, [isOpen, teacher]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/feedback/institute/teacher/${teacher._id}`);
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (error) {
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

export default TeacherPanel;
