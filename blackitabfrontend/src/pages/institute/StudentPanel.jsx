import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import { 
  UsersIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';

const StudentPanel = () => {
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    batchYear: '',
    departments: '' // Comma separated string for input
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

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
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query) ||
      (s.departments && s.departments.some(d => d.toLowerCase().includes(query)))
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student from the institute? They will lose access to institute specific features.')) return;
    try {
      const res = await api.delete(`/institute/members/${id}`);
      if (res.data.success) {
        CustomToast.success(res.data.message);
        fetchStudents();
      }
    } catch (error) {
      CustomToast.error('Failed to remove student');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return CustomToast.error('Name, email, and password are required');
    }
    
    setSaving(true);
    try {
      const payload = {
        ...formData,
        role: 'student',
        departments: formData.departments.split(',').map(d => d.trim()).filter(d => d)
      };
      
      const res = await api.post('/institute/members', payload);
      if (res.data.success) {
        CustomToast.success(res.data.message);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', password: '', batchYear: '', departments: '' });
        fetchStudents();
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      batchYear: student.batchYear || '',
      departments: student.departments ? student.departments.join(', ') : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        batchYear: formData.batchYear,
        departments: formData.departments.split(',').map(d => d.trim()).filter(d => d)
      };
      
      const res = await api.put(`/institute/members/${editingStudent._id}/role`, payload);
      if (res.data.success) {
        CustomToast.success('Student updated successfully');
        setIsEditModalOpen(false);
        fetchStudents();
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <UsersIcon className="w-6 h-6 text-emerald-500" />
            Student Panel
          </h1>
          <p className="text-gray-500 text-sm">View and manage students enrolled in your institute</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          {user?.role === 'institute' && (
            <button
              onClick={() => {
                setFormData({ name: '', email: '', password: '', batchYear: '', departments: '' });
                setIsAddModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors shadow-sm"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-sm">
                <th className="p-4 font-semibold">Student</th>
                <th className="hidden sm:table-cell p-4 font-semibold">Batch</th>
                <th className="hidden md:table-cell p-4 font-semibold">Departments</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    {searchQuery ? 'No students found matching your search.' : 'No students enrolled in the institute yet.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-bold">{s.name}</p>
                          <p className="text-gray-500 text-xs">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell p-4">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {s.batchYear || <span className="text-gray-400 dark:text-gray-500 italic">Not set</span>}
                      </span>
                    </td>
                    <td className="hidden md:table-cell p-4">
                      <div className="flex flex-wrap gap-1">
                        {s.departments?.length > 0 ? (
                          s.departments.map(d => (
                            <span key={d} className="px-2 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-xs text-gray-600 dark:text-gray-400">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {(user?.role === 'institute' || user?.role === 'hod') && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 rounded-lg transition-colors border border-blue-200 dark:border-blue-500/20"
                            title="Edit Student"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          {user?.role === 'institute' && (
                            <button
                              onClick={() => handleRemove(s._id)}
                              className="p-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 rounded-lg transition-colors border border-red-200 dark:border-red-500/20"
                              title="Remove from Institute"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Student</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Must be at least 6 characters"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Year</label>
                  <input
                    type="text"
                    value={formData.batchYear}
                    onChange={e => setFormData({...formData, batchYear: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="e.g. 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departments</label>
                  <input
                    type="text"
                    value={formData.departments}
                    onChange={e => setFormData({...formData, departments: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="CS, IT (comma separated)"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Student Details</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
              <p className="font-bold text-gray-900 dark:text-white">{editingStudent.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{editingStudent.email}</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Year</label>
                <input
                  type="text"
                  value={formData.batchYear}
                  onChange={e => setFormData({...formData, batchYear: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g. 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departments (Comma separated)</label>
                <input
                  type="text"
                  value={formData.departments}
                  onChange={e => setFormData({...formData, departments: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="e.g. Computer Science, Mathematics"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPanel;
