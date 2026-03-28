import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBug, FaCheck, FaSpinner, FaTimes, FaReply, FaLink } from 'react-icons/fa';
import { CustomToast } from '../../../utils/CustomToast';
import { motion, AnimatePresence } from 'framer-motion';

const BugsTab = ({ API_URL, headers }) => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [replyModal, setReplyModal] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/bugs`, { headers: headers() });
      setBugs(res.data.data);
    } catch (err) {
      console.error('Failed to fetch bugs:', err);
      // Don't show toast on load failure to avoid spam, just show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/bugs/${id}`, { status: newStatus }, { headers: headers() });
      CustomToast.success(`Bug marked as ${newStatus}`);
      fetchBugs();
    } catch (err) {
      CustomToast.error('Failed to update status');
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    try {
      setIsUpdating(true);
      await axios.put(`${API_URL}/api/admin/bugs/${replyModal._id}`, { 
        adminFeedback: feedbackText,
        status: 'In Progress' // Usually replying means it's being looked at
      }, { headers: headers() });
      CustomToast.success('Feedback sent to user');
      setReplyModal(null);
      setFeedbackText('');
      fetchBugs();
    } catch (err) {
      CustomToast.error('Failed to send feedback');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredBugs = filter === 'All' ? bugs : bugs.filter(b => b.status === filter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <FaSpinner className="animate-spin text-4xl text-rose-500 mb-4" />
      <p className="text-gray-400 font-bold">Loading Bug Reports...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-red-500/20 flex items-center justify-center border border-rose-500/30">
            <FaBug className="text-rose-500 text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Bug Reports</h2>
            <p className="text-sm text-gray-400">Manage user-submitted issues</p>
          </div>
        </div>

        <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
          {['All', 'Open', 'In Progress', 'Resolved'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                filter === tab 
                  ? 'bg-rose-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bug List */}
      <div className="grid gap-4">
        {filteredBugs.length === 0 ? (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
            <FaCheck className="text-4xl text-emerald-500 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400 font-bold">No {filter !== 'All' ? filter.toLowerCase() : ''} bugs found. Awesome!</p>
          </div>
        ) : (
          filteredBugs.map(bug => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={bug._id} 
              className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              {/* Status Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                bug.status === 'Open' ? 'bg-red-500' :
                bug.status === 'In Progress' ? 'bg-yellow-500' : 'bg-emerald-500'
              }`} />

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={bug.user?.profileImage || `https://ui-avatars.com/api/?name=${bug.user?.name}&background=random`} 
                      alt="User" 
                      className="w-8 h-8 rounded-full border border-white/10"
                    />
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {bug.user?.name || 'Unknown User'}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase tracking-wider">
                          {bug.role}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">{new Date(bug.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                      bug.status === 'Open' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      bug.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {bug.status}
                    </span>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-sm text-gray-300">
                  <p className="whitespace-pre-wrap">{bug.description}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaLink /> 
                  Context: <span className="font-mono text-rose-400">{bug.pageContext}</span>
                </div>

                {bug.adminFeedback && (
                  <div className="mt-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex gap-3 items-start">
                    <div className="bg-blue-500 p-1.5 rounded-lg text-white mt-0.5">
                      <FaReply className="text-[10px]" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-400 font-bold mb-1">Your Feedback</p>
                      <p className="text-sm text-gray-300">{bug.adminFeedback}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 shrink-0 md:w-40 justify-end md:justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                {bug.status !== 'Resolved' && (
                  <button 
                    onClick={() => handleUpdateStatus(bug._id, 'Resolved')}
                    className="flex-1 md:flex-none py-2 px-3 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaCheck /> Resolve
                  </button>
                )}
                <button 
                  onClick={() => { setReplyModal(bug); setFeedbackText(bug.adminFeedback || ''); }}
                  className="flex-1 md:flex-none py-2 px-3 rounded-lg text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <FaReply /> Reply
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><FaReply /> Send Feedback</h3>
                <button onClick={() => setReplyModal(null)} className="text-white/70 hover:text-white">
                  <FaTimes />
                </button>
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-2">
                  Replying to <span className="font-bold text-white">{replyModal.user?.name}</span>'s bug report:
                </p>
                <div className="bg-black/50 p-3 rounded-lg text-sm text-gray-300 mb-4 border border-white/5 line-clamp-3">
                  "{replyModal.description}"
                </div>
                
                <textarea 
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Type your response to the user..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
                
                <div className="mt-4 flex gap-3 justify-end">
                  <button 
                    onClick={() => setReplyModal(null)}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendFeedback}
                    disabled={isUpdating || !feedbackText.trim()}
                    className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUpdating ? <FaSpinner className="animate-spin" /> : 'Send Feedback'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BugsTab;
