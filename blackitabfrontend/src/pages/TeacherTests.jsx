import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaListAlt, FaPlus, FaTrash, FaChevronRight, FaTimes, FaCalendarAlt, FaSearch, FaUsers, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';
import SimpleConfirmationModal from '../components/shared/SimpleConfirmationModal';

const TeacherTests = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batchId: '',
    scheduledAt: '',
    duration: 60,
    totalMarks: 100
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, examId: null, examTitle: '' });

  useEffect(() => {
    console.log('Admin Dashboard Frontend Route: /admin/dashboard');
    console.log('Admin Dashboard Backend Route: /api/admin which includes /stats and other management endpoints');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [examRes, batchRes] = await Promise.all([
        axios.get(`${API_URL}/api/teacher/exams`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/teacher/batches`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (examRes.data.success) setExams(examRes.data.data);
      if (batchRes.data.success) setBatches(batchRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load tests.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        questionIds: [], // Add question selection interface later or in details
        status: 'scheduled'
      };
      const res = await axios.post(`${API_URL}/api/teacher/exam`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Test scheduled successfully!');
        setExams([res.data.data, ...exams]);
        setShowCreateModal(false);
        setFormData({ title: '', description: '', batchId: '', scheduledAt: '', duration: 60, totalMarks: 100 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create test');
    }
  };

  const openDeleteModal = (exam, e) => {
    e.stopPropagation();
    setDeleteModalState({ isOpen: true, examId: exam._id, examTitle: exam.title });
  };

  const executeDeleteExam = async () => {
    if (!deleteModalState.examId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teacher/exam/${deleteModalState.examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(prev => prev.filter(ex => ex._id !== deleteModalState.examId));
      toast.success('Test deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete test');
    } finally {
      setDeleteModalState({ isOpen: false, examId: null, examTitle: '' });
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-[#0061FF]/20 selection:text-gray-900">
      
      <div className="max-w-[80rem] mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-sm">
              <FaListAlt className="text-[#0061FF] dark:text-[#a5c3ff] text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Evaluation Center
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Tests & Exams
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 max-w-xl">
              Schedule, monitor, and manage the assessments for your active classes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-sm" />
              </div>
              <input 
                type="text" 
                placeholder="Search exams..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF]/50 transition-all shadow-sm"
              />
            </div>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0061FF] hover:bg-[#004bcc] text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-[#0061FF]/20"
            >
              <FaPlus className="text-xs" /> Schedule
            </button>
          </div>
        </div>

        {/* Dynamic State: Grid vs Empty vs Loading */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-32 animate-in fade-in">
              <div className="w-12 h-12 rounded-full border-4 border-[#0061FF]/20 border-t-[#0061FF] animate-spin mb-4"></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Records...</p>
            </div>
          ) : filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {filteredExams.map((exam) => (
                <div
                  key={exam._id}
                  onClick={() => navigate(`/teacher/test/${exam._id}`)}
                  className="group relative bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-[#0061FF]/30 dark:hover:border-[#a5c3ff]/30 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0061FF]/0 to-[#0061FF]/5 dark:to-[#0061FF]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div>
                    {/* Top Row: Title & Delete */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">
                        {exam.title}
                      </h3>
                      <button 
                        onClick={(e) => openDeleteModal(exam, e)}
                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                        title="Delete Exam"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        exam.status === 'ongoing' ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                        exam.status === 'completed' ? 'bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20' :
                        'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                      }`}>
                        {exam.status}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-6 flex justify-center"><FaUsers className="text-gray-400" /></div>
                        <span className="font-medium line-clamp-1 truncate">{exam.batchId?.name || 'Unassigned Batch'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-6 flex justify-center"><FaCalendarAlt className="text-gray-400" /></div>
                        <span className="font-medium truncate">{exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not Scheduled'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="w-6 flex justify-center"><FaClock className="text-gray-400" /></div>
                        <span className="font-medium">{exam.duration} Minutes</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats/Link */}
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aggregate Marks</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mt-1">{exam.totalMarks}</p>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-[#0061FF] group-hover:border-[#0061FF] transition-all bg-white dark:bg-black">
                      <FaChevronRight className="text-gray-400 group-hover:text-white text-xs transition-colors" />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] shadow-sm max-w-3xl mx-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                <FaListAlt className="text-3xl text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">No Assessments Found</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto mb-8">
                Your evaluation dashboard is currently empty. Begin by scheduling a new test to track your students' performance.
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3.5 rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-md hover:-translate-y-0.5"
              >
                <FaPlus className="text-xs" /> Build First Test
              </button>
            </div>
          )}
        </div>

      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            onClick={() => setShowCreateModal(false)}
            className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <div
            className="relative w-full max-w-xl bg-white dark:bg-[#05000a] rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
          >
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 dark:border-white/5">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Schedule Assessment</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">New Configuration</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCreateExam} className="px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Test Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" required
                    placeholder="e.g. Mid-term Science Evaluation"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] transition-all"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Instructions (Optional)</label>
                  <textarea 
                    placeholder="Provide detailed context or rules..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] transition-all resize-none"
                  />
                </div>

                {/* Target Batch */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Target Class / Batch <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      required
                      value={formData.batchId}
                      onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] transition-all appearance-none pr-10"
                    >
                      <option value="" disabled>Choose an enrolled class...</option>
                      {batches.map(b => (
                        <option key={b._id} value={b._id}>{b.name} — {b.year}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                      <FaChevronRight className="text-gray-400 text-[10px] transform rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Sub Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Date & Time <span className="text-red-500">*</span></label>
                    <input 
                      type="datetime-local" required
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Duration (Mins) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" required min="1"
                      placeholder="60"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                      className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] transition-all"
                    />
                  </div>
                </div>
                
                {/* Score limit */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Maximum Marks <span className="text-red-500">*</span></label>
                  <input 
                    type="number" required min="1"
                    placeholder="100"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({...formData, totalMarks: Number(e.target.value)})}
                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0061FF]/20 focus:border-[#0061FF] transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 dark:border-white/5 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="w-full sm:flex-1 py-4 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors focus:outline-none"
                >
                  Cancel Drop
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:flex-1 py-4 rounded-full bg-[#0061FF] hover:bg-[#004bcc] text-white font-bold transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-[#0061FF]/30 active:scale-[0.98]"
                >
                  Confirm Registration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <SimpleConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, examId: null, examTitle: '' })}
        onConfirm={executeDeleteExam}
        title="Sanitize Record"
        message={`Are you positive you wish to execute deletion for the assessment "${deleteModalState.examTitle}"? This will expunge all connected submissions.`}
        confirmText="Execute Deletion"
        isDanger={true}
      />
    </div>
  );
};

export default TeacherTests;
