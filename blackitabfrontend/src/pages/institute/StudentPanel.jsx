import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  UsersIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';

const StudentPanel = () => {
  const navigate = useNavigate();
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    batchYear: '',
    departments: ''
  });
  const [saving, setSaving] = useState(false);

  // Generic Confirmation Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    action: null,
    id: null,
    title: '',
    message: ''
  });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institute/members');
      if (res.data.success) {
        const studs = res.data.data.filter(m => m.role === 'student');
        setStudents(studs);
        setFilteredStudents(studs);
      }
    } catch (error) {
      CustomToast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredStudents(students); return; }
    const query = searchQuery.toLowerCase();
    setFilteredStudents(students.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.departments && s.departments.some(d => d.toLowerCase().includes(query)))
    ));
  }, [searchQuery, students]);

  const executeRemove = async (id) => {
    try {
      const res = await api.delete(`/institute/members/${id}`);
      if (res.data.success) { CustomToast.success(res.data.message); fetchStudents(); }
    } catch (error) {
      CustomToast.error('Failed to remove student');
    }
  };

  const handleRemove = (id) => {
    setConfirmState({
      isOpen: true,
      action: executeRemove,
      id: id,
      title: 'Remove Student',
      message: 'Are you sure you want to remove this student from the institute?'
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return CustomToast.error('Name, email, and password are required');
    setSaving(true);
    try {
      const payload = { ...formData, role: 'student', departments: formData.departments.split(',').map(d => d.trim()).filter(d => d) };
      const res = await api.post('/institute/members', payload);
      if (res.data.success) {
        CustomToast.success(res.data.message);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', password: '', batchYear: '', departments: '' });
        fetchStudents();
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to add student');
    } finally { setSaving(false); }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({ batchYear: student.batchYear || '', departments: student.departments ? student.departments.join(', ') : '' });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { batchYear: formData.batchYear, departments: formData.departments.split(',').map(d => d.trim()).filter(d => d) };
      const res = await api.put(`/institute/members/${editingStudent._id}/role`, payload);
      if (res.data.success) {
        CustomToast.success('Student updated successfully');
        setIsEditModalOpen(false);
        fetchStudents();
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to update student');
    } finally { setSaving(false); }
  };

  if (loading) return <PageShimmer variant="table" />;

  const groupedStudents = filteredStudents.reduce((acc, s) => {
    const batch = s.batchYear ? String(s.batchYear).trim() : '';
    const depts = (s.departments && s.departments.length > 0) ? s.departments.join(', ').trim() : '';
    let key = 'No Batch & Department';
    if (batch && !depts) key = `Batch: ${batch} — No Department`;
    else if (!batch && depts) key = `No Batch — Dept: ${depts}`;
    else if (batch && depts) key = `Batch: ${batch} — Dept: ${depts}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groupedStudents).sort((a, b) => {
    if (a === 'No Batch & Department') return 1;
    if (b === 'No Batch & Department') return -1;
    return a.localeCompare(b);
  });

  const inputCls = 'w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-gray-400" />
            Student Panel
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">View and manage students enrolled in your institute</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search students..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
          {user?.role === 'institute' && (
            <button
              onClick={() => { setFormData({ name: '', email: '', password: '', batchYear: '', departments: '' }); setIsAddModalOpen(true); }}
              className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold flex items-center gap-1.5 shrink-0"
            >
              <PlusIcon className="w-4 h-4" /> Add Student
            </button>
          )}
        </div>
      </div>

      {/* Table Groups */}
      {Object.keys(groupedStudents).length === 0 ? (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl text-center py-12 bg-white dark:bg-white/[0.02]">
          <UsersIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {searchQuery ? 'No students found matching your search.' : 'No students enrolled in the institute yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedKeys.map(key => (
            <div key={key} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{key}</h3>
                <span className="text-xs text-gray-400">{groupedStudents[key].length} student{groupedStudents[key].length !== 1 ? 's' : ''}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-100 dark:border-white/5">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-5 py-2.5 uppercase tracking-wider">Student</th>
                      <th className="px-5 py-2.5 uppercase tracking-wider">Batch</th>
                      <th className="px-5 py-2.5 uppercase tracking-wider">Departments</th>
                      <th className="px-5 py-2.5 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {groupedStudents[key].map(s => (
                      <tr
                        key={s._id}
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => navigate(`/institute/student/${s._id}`)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-bold shrink-0">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</p>
                              <p className="text-xs text-gray-500">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {s.batchYear || <span className="italic text-gray-400">Not set</span>}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {s.departments?.length > 0 ? (
                              s.departments.map(d => (
                                <span key={d} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs text-gray-600 dark:text-gray-400">{d}</span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {(user?.role === 'institute' || user?.role === 'hod') && (
                            <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => openEditModal(s)}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors"
                                title="Edit"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              {user?.role === 'institute' && (
                                <button
                                  onClick={() => handleRemove(s._id)}
                                  className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-500/30 transition-colors"
                                  title="Remove"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="font-semibold text-gray-900 dark:text-white">Add New Student</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputCls} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputCls} placeholder="student@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password *</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputCls} placeholder="Min 6 characters" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Year</label>
                  <input type="text" value={formData.batchYear} onChange={e => setFormData({...formData, batchYear: e.target.value})} className={inputCls} placeholder="2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departments</label>
                  <input type="text" value={formData.departments} onChange={e => setFormData({...formData, departments: e.target.value})} className={inputCls} placeholder="CS, IT" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h2 className="font-semibold text-gray-900 dark:text-white">Edit Student</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{editingStudent.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{editingStudent.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Year</label>
                <input type="text" value={formData.batchYear} onChange={e => setFormData({...formData, batchYear: e.target.value})} className={inputCls} placeholder="2024" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departments (comma separated)</label>
                <input type="text" value={formData.departments} onChange={e => setFormData({...formData, departments: e.target.value})} className={inputCls} placeholder="Computer Science, Mathematics" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
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

export default StudentPanel;
