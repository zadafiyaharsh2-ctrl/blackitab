import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaBug, FaTimes, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import { CustomToast } from '../../utils/CustomToast';
import api from '../../utils/api';

const BugReporter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('report'); // 'report' or 'my-reports'
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const location = useLocation();

  // Listen for custom event to open bug reporter
  React.useEffect(() => {
    const handleOpenBugReporter = () => setIsOpen(true);
    window.addEventListener('openBugReporter', handleOpenBugReporter);
    return () => window.removeEventListener('openBugReporter', handleOpenBugReporter);
  }, []);

  // Fetch reports when tab changes
  React.useEffect(() => {
    if (activeTab === 'my-reports' && isOpen) {
      fetchMyReports();
    }
  }, [activeTab, isOpen]);

  const fetchMyReports = async () => {
    try {
      setLoadingReports(true);
      const res = await api.get('/bugs/my-reports');
      if (res.data.success) {
        setMyReports(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  // Don't show on admin routes or login pages
  if (location.pathname.startsWith('/admin') || location.pathname.includes('/login') || location.pathname.includes('/register')) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      CustomToast.error('Please describe the issue');
      return;
    }

    try {
      setLoading(true);
      await api.post('/bugs', {
        description,
        pageContext: location.pathname + location.search
      });
      CustomToast.success('Bug reported! Thank you for helping us improve.');
      setDescription('');
      setActiveTab('my-reports'); // Switch to view reports after submitting
    } catch (error) {
      console.error('Bug report error:', error);
      CustomToast.error('Failed to submit bug report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 sm:justify-end sm:items-end pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl relative z-10 pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-600 to-red-600 p-4 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 font-bold text-lg">
                  <FaBug /> Bug Reporter
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 mx-4 mt-4 rounded-xl shrink-0">
                <button
                  onClick={() => setActiveTab('report')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'report' ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  Report Issue
                </button>
                <button
                  onClick={() => setActiveTab('my-reports')}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'my-reports' ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                  My Reports
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                {activeTab === 'report' ? (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Found a bug or have a suggestion? Let us know what happened on <span className="font-bold text-rose-500 font-mono text-xs">{location.pathname}</span>.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What went wrong? What did you expect to happen?"
                          rows={4}
                          required
                          className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !description.trim()}
                        className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-rose-500/20"
                      >
                        {loading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaPaperPlane className="text-sm" /> Submit Report
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="space-y-3">
                    {loadingReports ? (
                      <div className="flex justify-center py-8">
                        <FaSpinner className="animate-spin text-rose-500 text-2xl" />
                      </div>
                    ) : myReports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        You haven't reported any bugs yet.
                      </div>
                    ) : (
                      myReports.map((report) => (
                        <div key={report._id} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 flex flex-col gap-2 relative">
                          <div className="flex justify-between items-start">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                              report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' :
                              'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                            }`}>
                              {report.status}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-800 dark:text-gray-200">{report.description}</p>
                          
                          {report.adminFeedback && (
                            <div className="mt-2 bg-blue-50 dark:bg-blue-500/10 border-l-2 border-blue-500 p-2 text-sm text-gray-700 dark:text-gray-300 rounded-r-lg">
                              <span className="text-[10px] font-bold text-blue-500 uppercase block mb-0.5">Admin Reply:</span>
                              {report.adminFeedback}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BugReporter;
