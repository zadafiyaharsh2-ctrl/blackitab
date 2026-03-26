import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';

import AddStudentModal from '../../components/institute/pages/studentPanel/AddStudentModal';
import EditStudentModal from '../../components/institute/pages/studentPanel/EditStudentModal';
import StudentTableGroup from '../../components/institute/pages/studentPanel/StudentTableGroup';

const StudentPanel = () => {
  const navigate = useNavigate();
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institute, setInstitute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    batchYear: '',
    department: ''
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
      const [membersRes, instRes] = await Promise.all([
        api.get('/institute/members'),
        api.get('/institute/my')
      ]);
      if (membersRes.data.success) {
        const studs = membersRes.data.data.filter(m => m.role === 'student');
        setStudents(studs);
        setFilteredStudents(studs);
      }
      if (instRes.data.success) {
        setInstitute(instRes.data.data);
      }
    } catch (error) {
      CustomToast.error('Failed to load data');
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
    if (!formData.name || !formData.email) return CustomToast.error('Name and email are required');
    setSaving(true);
    try {
      const payload = { ...formData, role: 'student', departments: formData.department ? [formData.department] : [] };
      const res = await api.post('/institute/members', payload);
      if (res.data.success) {
        CustomToast.success(res.data.message);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', batchYear: '', department: '' });
        fetchStudents();
      }
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to add student');
    } finally { setSaving(false); }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({ batchYear: student.batchYear || '', department: (student.departments && student.departments.length > 0) ? student.departments[0] : '' });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { batchYear: formData.batchYear, departments: formData.department ? [formData.department] : [] };
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
              onClick={() => { setFormData({ name: '', email: '', batchYear: '', department: '' }); setIsAddModalOpen(true); }}
              className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold flex items-center gap-1.5 shrink-0"
            >
              <PlusIcon className="w-4 h-4" /> Add Student
            </button>
          )}
        </div>
      </div>

      {/* Table Groups */}
      <StudentTableGroup
        groupedStudents={groupedStudents}
        searchQuery={searchQuery}
        sortedKeys={sortedKeys}
        user={user}
        navigate={navigate}
        openEditModal={openEditModal}
        handleRemove={handleRemove}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        handleAddSubmit={handleAddSubmit}
        formData={formData}
        setFormData={setFormData}
        institute={institute}
        saving={saving}
        inputCls={inputCls}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editingStudent={editingStudent}
        handleEditSubmit={handleEditSubmit}
        formData={formData}
        setFormData={setFormData}
        institute={institute}
        saving={saving}
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

export default StudentPanel;
