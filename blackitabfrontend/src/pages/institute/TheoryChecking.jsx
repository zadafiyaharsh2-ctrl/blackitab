import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import { 
  DocumentTextIcon, 
  PlusIcon
} from '@heroicons/react/24/outline';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';

import TheoryCard from '../../components/institute/pages/theoryChecking/TheoryCard';
import TheoryModal from '../../components/institute/pages/theoryChecking/TheoryModal';

const TheoryChecking = () => {
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const [theories, setTheories] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheory, setEditingTheory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    department: '',
    fileUrl: '',
    content: ''
  });

  // Generic Confirmation Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    action: null,
    id: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [theoryRes, instRes] = await Promise.all([
        api.get('/institute/theory'),
        api.get('/institute/my')
      ]);

      if (theoryRes.data.success) setTheories(theoryRes.data.data);
      if (instRes.data.success) setInstitute(instRes.data.data);
    } catch (error) {
      CustomToast.error('Failed to load theory materials');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (theory = null) => {
    if (theory) {
      setEditingTheory(theory);
      setFormData({
        title: theory.title,
        subject: theory.subject,
        department: theory.department || '',
        fileUrl: theory.fileUrl || '',
        content: theory.content || ''
      });
    } else {
      setEditingTheory(null);
      setFormData({ title: '', subject: '', department: '', fileUrl: '', content: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTheory) {
        const res = await api.put(`/institute/theory/${editingTheory._id}`, formData);
        if (res.data.success) {
          CustomToast.success(res.data.message);
        }
      } else {
        const res = await api.post('/institute/theory', formData);
        if (res.data.success) {
          CustomToast.success(res.data.message);
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const executeDelete = async (id) => {
    try {
      const res = await api.delete(`/institute/theory/${id}`);
      if (res.data.success) {
        CustomToast.success(res.data.message);
        fetchData();
      }
    } catch (error) {
      CustomToast.error('Failed to delete material');
    }
  };

  const handleDelete = (id) => {
    setConfirmState({
      isOpen: true,
      action: executeDelete,
      id: id,
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material?'
    });
  };

  const canEdit = (theoryOwnerId) => {
    if (user.role === 'institute') return true;
    if (user._id === theoryOwnerId.toString()) return true;
    return false;
  };

  if (loading) return <PageShimmer variant="table" />;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <DocumentTextIcon className="w-6 h-6 text-[#063669] dark:text-[#a7c8ff]" />
            Theory Checking
          </h1>
          <p className="text-gray-500 text-sm">Upload and manage study materials and notes for students</p>
        </div>
        
        {['institute', 'hod', 'teacher'].includes(user?.role) && (
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-br from-[#063669] to-[#274e82] hover:opacity-90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold tracking-wide transition-all shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            Upload Material
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theories.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none rounded-2xl">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No theory materials uploaded yet.</p>
          </div>
        ) : (
          theories.map(t => (
            <TheoryCard 
              key={t._id}
              theory={t}
              user={user}
              canEdit={canEdit}
              openModal={openModal}
              handleDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Upload/Edit Modal */}
      <TheoryModal 
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editingTheory={editingTheory}
        handleSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        institute={institute}
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

export default TheoryChecking;
