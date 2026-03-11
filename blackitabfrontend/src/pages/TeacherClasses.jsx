import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaPlus, FaTrash, FaChevronRight, FaTimes, FaGraduationCap, FaSearch, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', year: '', section: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/teacher/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBatches(res.data.data);
    } catch (err) {
      toast.error('Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/teacher/batch`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Class created!');
        setBatches([res.data.data, ...batches]);
        setShowCreateModal(false);
        setFormData({ name: '', year: '', section: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleDeleteBatch = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this class? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teacher/batch/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Class deleted');
      setBatches(batches.filter(b => b._id !== id));
    } catch {
      toast.error('Failed to delete class');
    }
  };

  const filteredBatches = batches.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.year && b.year.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaUsers className="text-gray-400" />
            Classes &amp; Batches
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your student groups</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100"
        >
          <FaPlus className="text-xs" /> New Class
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search classes…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/[0.02] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Batch List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <FaSpinner className="animate-spin text-2xl text-gray-400" />
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
          <FaUsers className="text-3xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">{searchQuery ? 'No classes match your search.' : 'No classes yet. Create your first one.'}</p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg"
            >
              <FaPlus className="inline mr-1 text-xs" /> Create Class
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBatches.map((batch) => (
            <div
              key={batch._id}
              onClick={() => navigate(`/teacher/batch/${batch._id}`)}
              className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{batch.name}</h3>
                    {batch.classCode && (
                      <span className="text-[10px] font-mono bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded shrink-0">{batch.classCode}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <FaGraduationCap /> {batch.subjectId?.name || 'General'}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteBatch(batch._id, e)}
                  className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{batch.year} {batch.section ? `· ${batch.section}` : ''}</span>
                <span className="flex items-center gap-1">
                  <FaUsers className="text-gray-400" /> {batch.studentIds?.length || 0}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                <span>Manage</span>
                <FaChevronRight className="text-xs" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Create New Class</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateBatch} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Name <span className="text-red-500">*</span></label>
                <input
                  type="text" required
                  placeholder="e.g. Class 10 – Science"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year <span className="text-red-500">*</span></label>
                  <input
                    type="text" required
                    placeholder="e.g. 2024"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
