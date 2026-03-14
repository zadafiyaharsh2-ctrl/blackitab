import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClipboardList, FaPlus, FaTrash, FaChevronRight, FaTimes, FaCalendarAlt, FaSearch, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';
import DeleteConfirmationModal from '../components/shared/DeleteConfirmationModal';

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batchId: '',
    dueDate: '',
    totalMarks: 100
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deletion Modal State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    assignmentId: null,
    assignmentTitle: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [assignRes, batchRes] = await Promise.all([
        axios.get(`${API_URL}/api/teacher/assignments`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/teacher/batches`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (assignRes.data.success) setAssignments(assignRes.data.data);
      if (batchRes.data.success) setBatches(batchRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        questionIds: [], // Add question selection later
        status: 'published'
      };
      const res = await axios.post(`${API_URL}/api/teacher/assignment`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Assignment created successfully!');
        setAssignments([res.data.data, ...assignments]);
        setShowCreateModal(false);
        setFormData({ title: '', description: '', batchId: '', dueDate: '', totalMarks: 100 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const openDeleteModal = (assignment, e) => {
    e.stopPropagation();
    setDeleteModalState({
      isOpen: true,
      assignmentId: assignment._id,
      assignmentTitle: assignment.title
    });
  };

  const executeDeleteAssignment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teacher/assignment/${deleteModalState.assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Assignment deleted');
      setAssignments(assignments.filter(a => a._id !== deleteModalState.assignmentId));
      setDeleteModalState({ isOpen: false, assignmentId: null, assignmentTitle: '' });
    } catch (err) {
      toast.error('Failed to delete assignment');
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] p-6 text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-yellow-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-yellow-100 dark:bg-yellow-500/20 border border-transparent dark:border-yellow-500/30">
              <FaClipboardList className="text-3xl text-yellow-700 dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Assignments</h1>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Create and grade assignments for your classes.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-yellow-500/30 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            <FaPlus /> create Assignment
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 dark:text-gray-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search assignments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all shadow-sm"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment._id}
                onClick={() => navigate(`/teacher/assignment/${assignment._id}`)}
                className="group relative bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-xl dark:hover:border-yellow-500/50 cursor-pointer overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-yellow-400 to-orange-500 opacity-70 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4 pl-2">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">{assignment.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 w-fit">
                      {assignment.status.toUpperCase()}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => openDeleteModal(assignment, e)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                <div className="pl-2 space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <FaUsers className="text-slate-400" /> 
                    <span>Batch: {assignment.batchId?.name || 'Unknown Class'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <FaCalendarAlt className="text-slate-400" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white mt-2">
                    Total Marks: {assignment.totalMarks}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 pl-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-orange-600 dark:text-orange-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                    View Submissions & Grade
                    <FaChevronRight className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-panel border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <FaClipboardList className="text-5xl text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Assignments Created</h3>
            <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto mb-6">Start by creating an assignment for your class.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:gray-100 transition-colors"
            >
              <FaPlus /> Create Assignment
            </button>
          </div>
        )}

      </div>

      {/* CREATE MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Assignment</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <FaTimes size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required
                    placeholder="e.g. Chapter 1 Homework"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea 
                    placeholder="Provide instructions here..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Target Class / Batch <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.batchId}
                    onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:text-white"
                  >
                    <option value="" disabled>Select a class</option>
                    {batches.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.year})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Due Date <span className="text-red-500">*</span></label>
                    <input 
                      type="date" required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">Total Marks <span className="text-red-500">*</span></label>
                    <input 
                      type="number" required min="1"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({...formData, totalMarks: Number(e.target.value)})}
                      className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold transition-all shadow-lg hover:shadow-orange-500/30">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, assignmentId: null, assignmentTitle: '' })}
        onConfirm={executeDeleteAssignment}
        itemName={deleteModalState.assignmentTitle}
        itemType="Assignment"
        warningText="All student submissions, grades, and associated files for this assignment will be permanently lost."
      />
    </div>
  );
};

export default TeacherAssignments;
