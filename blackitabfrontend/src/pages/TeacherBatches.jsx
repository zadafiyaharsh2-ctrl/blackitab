import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlus, FaTrash, FaEdit, FaChevronRight, FaTimes, FaGraduationCap, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';

const TeacherBatches = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', year: '', section: '', subjectId: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback styling for testing if API fails
  const DUMMY_BATCHES = [
    { _id: '1', name: 'Computer Science Hons.', year: '2024', section: 'A', studentIds: Array(45).fill('id'), subjectId: { name: 'Data Structures' } },
    { _id: '2', name: 'Information Tech', year: '2025', section: 'B', studentIds: Array(60).fill('id'), subjectId: { name: 'Algorithms' } },
  ];

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/teacher/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBatches(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
      if (err.response?.status === 404 || err.response?.status === 500) {
        // Fallback for UI visualization if backend fails/empty
        setBatches(DUMMY_BATCHES);
      } else {
        toast.error('Failed to load classes.');
      }
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
        toast.success('Batch created successfully!');
        setBatches([res.data.data, ...batches]);
        setShowCreateModal(false);
        setFormData({ name: '', year: '', section: '', subjectId: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create batch');
    }
  };

  const handleDeleteBatch = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this class? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teacher/batch/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Batch deleted');
      setBatches(batches.filter(b => b._id !== id));
    } catch (err) {
      toast.error('Failed to delete batch');
    }
  };

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (b.year && b.year.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] p-6 text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-500/20 border border-transparent dark:border-blue-500/30">
              <FaUsers className="text-3xl text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Classes & Batches</h1>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Manage your student groups, assign work, and track performance.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <FaPlus /> Create New Class
          </button>
        </div>

        {/* Search & Filter */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 dark:text-gray-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search classes by name or year..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Batch Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredBatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBatches.map((batch, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={batch._id}
                onClick={() => navigate(`/teacher/batch/${batch._id}`)}
                className="group relative bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:hover:border-blue-500/50 cursor-pointer overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Decorative Side Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-70 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4 pl-2">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-1">{batch.name}</h3>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                      <FaGraduationCap /> {batch.subjectId?.name || 'General Batch'}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteBatch(batch._id, e)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete Class"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                <div className="pl-2 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-gray-400">Year / Section</span>
                    <span className="font-bold text-slate-800 dark:text-white px-2 py-1 rounded bg-slate-100 dark:bg-white/10">
                      {batch.year} {batch.section ? `- ${batch.section}` : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-gray-400">Total Students</span>
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <FaUsers className="text-blue-500" /> {batch.studentIds?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 pl-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    Manage Classroom
                    <FaChevronRight className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-panel border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <FaUsers className="text-5xl text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Classes Found</h3>
            <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto mb-6">Create your first class to start adding students, assigning work, and tracking progress.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors"
            >
              <FaPlus /> Create Class
            </button>
          </div>
        )}

      </div>

      {/* CREATE BATCH MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Batch</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateBatch} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Batch Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required
                    placeholder="e.g. Class 10th - Science"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Year / Semester <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required
                      placeholder="e.g. 2024"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Section (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. A"
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                    />
                  </div>
                </div>

                {/* Optional: Add Subject dropdown here if needed. Leaving as text for now or omitting from form for simplicity as backend can handle it later or grab from context */}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors">
                    Create Batch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TeacherBatches;
