import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaPlus, FaTrash, FaChevronRight, FaTimes, FaGraduationCap, FaSearch, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../../config';

import DeleteConfirmationModal from '../../components/shared/DeleteConfirmationModal';

const TeacherClasses = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', year: '', section: '', department: '' });
  const [instituteDepartments, setInstituteDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deletion Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    batchId: null,
    batchName: ''
  });

  useEffect(() => {
    fetchBatches();
    fetchInstituteDepartments();
  }, []);

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

  const fetchInstituteDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/institute/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const departments = Array.isArray(res.data.data?.departments)
          ? res.data.data.departments
              .map((dept) => (typeof dept === 'string' ? dept.trim() : ''))
              .filter(Boolean)
          : [];
        setInstituteDepartments(departments);
      }
    } catch {
      setInstituteDepartments([]);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formData.department) {
      toast.error('Department is required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/teacher/batch`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Class created!');
        setBatches([res.data.data, ...batches]);
        setShowCreateModal(false);
        setFormData({ name: '', year: '', section: '', department: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    }
  };

  const openDeleteModal = (batch, e) => {
    e.stopPropagation();
    setDeleteModalState({
      isOpen: true,
      batchId: batch._id,
      batchName: batch.name
    });
  };

  const executeDeleteBatch = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teacher/batch/${deleteModalState.batchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Class deleted');
      setBatches(batches.filter(b => b._id !== deleteModalState.batchId));
      setDeleteModalState({ isOpen: false, batchId: null, batchName: '' });
    } catch {
      toast.error('Failed to delete class');
    }
  };

  const filteredBatches = batches.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.year && b.year.toLowerCase().includes(searchQuery.toLowerCase())) ||
    ((b.department || b.departmentId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-[#0061FF]/20 selection:text-gray-900">
      
      <div className="max-w-[75rem] mx-auto space-y-10">

        {/* Master Header */}
         <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-sm">
              <FaUsers className="text-[#0061FF] dark:text-[#a5c3ff] text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Instructional Cohorts
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Classes & Batches
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 max-w-lg">
              Manage your academic groups. Create new batches, oversee enrolled learners, and generate secure access codes.
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 group flex items-center gap-2 px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-[#0061FF] dark:hover:bg-[#0061FF] dark:hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[#0061FF]/20"
          >
            <FaPlus className="text-[10px] transform group-hover:rotate-90 transition-transform" /> New Class
          </button>
        </div>

        {/* Search & Actions Area */}
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-white/[0.02] p-2 pr-6 rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-sm sticky top-6 z-10 backdrop-blur-md max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search classes, codes, or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-[#0061FF]/10 dark:border-white/5 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#0061FF] border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 animate-pulse">Syncing Cohorts...</p>
            </div>

          ) : filteredBatches.length === 0 ? (
            
            /* Empty State */
            <div className="text-center py-24 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] shadow-sm max-w-3xl mx-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                <FaUsers className="text-3xl text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                {searchQuery ? 'No Matches Found' : 'No Classes Registered'}
              </h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto mb-8">
                 {searchQuery 
                    ? `We couldn't find any cohorts matching "${searchQuery}". Please adjust your parameters.` 
                    : 'You have not initialized any classes yet. Create your first instructional grouping to begin.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#0061FF]/30 dark:hover:border-[#0061FF]/30 hover:bg-white dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm focus:outline-none"
                >
                  Create Your First Class
                </button>
              )}
            </div>

          ) : (
            
            /* Batches Grid */
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {filteredBatches.map((batch, idx) => (
                <div 
                  key={batch._id || idx}
                  onClick={() => navigate(`/teacher/batch/${batch._id}`)}
                  className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 hover:border-[#0061FF]/30 dark:hover:border-[#0061FF]/40 rounded-[2.5rem] p-6 sm:p-8 shadow-sm hover:shadow-[#0061FF]/5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  
                  {/* Hover Graphic */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0061FF]/0 to-[#0061FF]/5 dark:to-[#0061FF]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Header Row: Title & Action */}
                   <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0 pr-4">
                         <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white truncate group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors tracking-tight leading-none mb-2">
                           {batch.name}
                         </h3>
                         {batch.classCode && (
                           <span className="inline-block mt-1 text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] px-2 py-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md shadow-sm select-all">
                             {batch.classCode}
                           </span>
                         )}
                      </div>
                      
                      {/* Delete Action (Top Right, Subtle) */}
                      <button
                        onClick={(e) => openDeleteModal(batch, e)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:text-gray-600 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors flex-shrink-0 focus:outline-none"
                        title="Delete Class"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                   </div>
                   
                   {/* Meta Details */}
                   <div className="mb-8 space-y-1.5 min-h-[40px]">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 truncate">
                        <FaGraduationCap className="text-[10px]" /> {batch.subjectId?.name || 'General Subject'}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-500 truncate">
                        {batch.department || batch.departmentId?.name || 'No Dept. Assigned'}
                      </p>
                   </div>

                  {/* Footer Row: Stats & CTA */}
                  <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-white/5 mt-auto">
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <FaUsers className="text-[#0061FF] dark:text-[#a5c3ff] text-[10px]" /> 
                        {batch.studentIds?.length || 0}
                      </span>
                      {batch.year && (
                        <span className="px-2 py-1 text-[10px] font-bold text-gray-400">
                          {batch.year} {batch.section && `• Sec ${batch.section}`}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#0061FF] transition-colors pr-1">
                      Manage <FaChevronRight className="transform group-hover:translate-x-0.5 transition-transform" />
                    </div>

                  </div>

                </div>
              ))}
            </div>

          )}
        </div>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
            
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">Initialize Cohort</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 transition-colors focus:outline-none"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
            
            <form onSubmit={handleCreateBatch} className="p-8 space-y-6">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Class Name <span className="text-[#0061FF]">*</span>
                </label>
                <input
                  type="text" required
                  placeholder="e.g. Adv. Physics 101"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                  className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Academic Year <span className="text-[#0061FF]">*</span>
                  </label>
                  <input
                    type="text" required
                    placeholder="e.g. 2024"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm placeholder-gray-400"
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Department Jurisdiction <span className="text-[#0061FF]">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Department</option>
                    {instituteDepartments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                </div>
                {instituteDepartments.length === 0 && (
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mt-2">
                    No departments available. Contact Institute Admin.
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="flex-1 py-3.5 bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={instituteDepartments.length === 0}
                  className="flex-1 py-3.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-[#0061FF] dark:hover:bg-[#0061FF] dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md focus:outline-none"
                >
                  Create Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Layer */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, batchId: null, batchName: '' })}
        onConfirm={executeDeleteBatch}
        itemName={deleteModalState.batchName}
        itemType="Class"
        warningText="This action is irreversible. It will expunge all enrolled students, assignments, and historical attendance records tied to this cohort."
      />
    </div>
  );
};

export default TeacherClasses;
