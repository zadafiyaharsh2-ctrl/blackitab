import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import { 
  AcademicCapIcon, 
  TrashIcon, 
  PencilIcon, 
  PlusIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';

const TeacherPanel = () => {
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);

  // New Teacher Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, instRes] = await Promise.all([
        api.get('/institute/members'),
        api.get('/institute/my')
      ]);

      if (membersRes.data.success) {
        // Filter only teachers and HODs
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
      // 1. Update role if changed
      await api.put(`/institute/members/${editTeacher._id}/role`, { role: editTeacher.role });

      // 2. We can update departments by hijacking the role endpoint if we modified it in the backend, or a generic put. 
      // Fortunately we modified changeMemberRole in backend to also accept `departments` in the same endpoint!
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

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this teacher from the institute?')) return;
    try {
      const res = await api.delete(`/institute/members/${id}`);
      if (res.data.success) {
        CustomToast.success(res.data.message);
        fetchData();
      }
    } catch (error) {
      CustomToast.error('Failed to remove teacher');
    }
  };

  const toggleDepartment = (dept) => {
    const current = editTeacher.departments || [];
    if (current.includes(dept)) {
      setEditTeacher({ ...editTeacher, departments: current.filter(d => d !== dept) });
    } else {
      setEditTeacher({ ...editTeacher, departments: [...current, dept] });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <AcademicCapIcon className="w-6 h-6 text-orange-500" />
            Teacher Panel
          </h1>
          <p className="text-gray-500 text-sm">Manage institute teachers and HODs</p>
        </div>
        {user?.role === 'institute' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Add Teacher
          </button>
        )}
      </div>

      <div className="glass-panel border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm">
              <th className="p-4 font-semibold">Teacher</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Departments</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No teachers found in the institute.</td>
                </tr>
              ) : (
                teachers.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-bold">{t.name}</p>
                          <p className="text-gray-500 text-xs">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold uppercase ${
                        t.role === 'hod' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {t.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {t.departments?.length > 0 ? (
                          t.departments.map(d => (
                            <span key={d} className="px-2 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs text-gray-600 dark:text-gray-400">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">None assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {user?.role === 'institute' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditTeacher(t);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg transition-colors border border-gray-200 dark:border-white/10"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(t._id)}
                            className="p-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg transition-colors border border-red-200 dark:border-red-500/20"
                            title="Remove from Institute"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Teacher</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email" required
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password" required minLength="6"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="teacher">Teacher</option>
                  <option value="hod">HOD</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white font-medium transition-colors border border-gray-200 dark:border-white/10">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">Add Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {isEditModalOpen && editTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Teacher</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
                <form id="editTeacherForm" onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      value={editTeacher.role} onChange={e => setEditTeacher({...editTeacher, role: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="teacher">Teacher</option>
                      <option value="hod">HOD</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Departments</label>
                    <div className="space-y-2">
                        {institute?.departments?.length > 0 ? (
                            institute.departments.map(dept => (
                                <label key={dept} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500 bg-white dark:bg-gray-800" 
                                        checked={(editTeacher.departments || []).includes(dept)}
                                        onChange={() => toggleDepartment(dept)}
                                    />
                                    <span className="text-gray-700 dark:text-gray-200">{dept}</span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No departments created in Institute Profile yet.</p>
                        )}
                    </div>
                  </div>
                </form>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-white/10 shrink-0 flex gap-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md rounded-b-2xl">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-800 dark:text-white font-medium transition-colors border border-gray-300 dark:border-white/10">Cancel</button>
                <button type="submit" form="editTeacherForm" className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherPanel;
