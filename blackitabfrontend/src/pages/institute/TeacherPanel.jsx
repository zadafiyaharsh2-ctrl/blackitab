import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

import {
  AcademicCapIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';

import AddTeacherModal from '../../components/institute/modals/AddTeacherModal';
import EditTeacherModal from '../../components/institute/modals/EditTeacherModal';

const TeacherPanel = () => {
  const navigate = useNavigate();
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    } catch {
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
        setFormData({ name: '', email: '', role: 'teacher' });
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
    } catch {
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

  if (loading) return <PageShimmer variant="table" />;

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
                  <tr key={t._id} onClick={() => navigate(`/institute/teacher/${t._id}`)} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
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
                            onClick={(e) => { e.stopPropagation(); setEditTeacher(t); setIsEditModalOpen(true); }}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemove(t._id); }}
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

      <AddTeacherModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddSubmit} 
        formData={formData} 
        setFormData={setFormData} 
        inputCls={inputCls} 
      />

      <EditTeacherModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSubmit={handleEditSubmit} 
        editTeacher={editTeacher} 
        setEditTeacher={setEditTeacher} 
        institute={institute} 
        toggleDepartment={toggleDepartment} 
        inputCls={inputCls} 
      />

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

export default TeacherPanel;
