import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

import { 
  DocumentTextIcon, 
  TrashIcon, 
  PencilIcon, 
  PlusIcon,
  XMarkIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
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

  const canEdit = (theoryOwnerId) => {
    if (user.role === 'institute') return true;
    if (user._id === theoryOwnerId.toString()) return true;
    return false;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <DocumentTextIcon className="w-6 h-6 text-orange-500" />
            Theory Checking
          </h1>
          <p className="text-gray-500 text-sm">Upload and manage study materials and notes for students</p>
        </div>
        
        {['institute', 'hod', 'teacher'].includes(user?.role) && (
          <button
            onClick={() => openModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Upload Material
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theories.length === 0 ? (
          <div className="col-span-full p-8 text-center glass-panel border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No theory materials uploaded yet.</p>
          </div>
        ) : (
          theories.map(t => (
            <div key={t._id} className="glass-panel border-gray-200 dark:border-white/10 rounded-2xl p-5 flex flex-col h-full hover:border-orange-500/50 transition-colors shadow-sm group">
              <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight line-clamp-2" title={t.title}>{t.title}</h3>
                {['institute', 'hod', 'teacher'].includes(user?.role) && canEdit(t.uploadedBy?._id || t.uploadedBy) && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openModal(t)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="p-1.5 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-md text-xs font-medium">
                  {t.subject}
                </span>
                {t.department && (
                  <span className="px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-md text-xs font-medium">
                    {t.department}
                  </span>
                )}
              </div>

              <div className="flex-1">
                {t.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{t.content}</p>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  By {t.uploadedBy?.name || 'Unknown'}
                </div>
                {t.fileUrl && (
                  <a 
                    href={t.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    View File
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingTheory ? 'Edit Material' : 'Upload Material'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="theoryForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="E.g. Chapter 1: Introduction to Mechanics"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                    <input
                      type="text" required
                      value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <select
                      value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="">All Departments</option>
                      {institute?.departments?.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File URL (Google Drive, PDF link, etc.)</label>
                  <input
                    type="url"
                    value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description / Short Content (Optional)</label>
                  <textarea
                    rows={4}
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-y"
                    placeholder="Add any notes or short text content here..."
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-white/10 shrink-0 flex gap-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-800 dark:text-white font-medium transition-colors border border-gray-300 dark:border-white/10">Cancel</button>
              <button type="submit" form="theoryForm" className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">
                {editingTheory ? 'Save Changes' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TheoryChecking;
