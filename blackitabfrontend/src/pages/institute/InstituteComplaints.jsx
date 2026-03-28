import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import { 
    ExclamationTriangleIcon, 
    CheckCircleIcon,
    ClockIcon,
    ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';

const InstituteComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolutionText, setResolutionText] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await api.get('/institute/complaints');
            if (res.data.success) {
                setComplaints(res.data.data);
            }
        } catch (error) {
            CustomToast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            setUpdating(id);
            const res = await api.put(`/institute/complaints/${id}`, { status: newStatus });
            if (res.data.success) {
                setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
                CustomToast.success(`Marked as ${newStatus}`);
            }
        } catch (error) {
            CustomToast.error('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const handleSaveResolution = async (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;
        
        try {
            setUpdating(selectedComplaint._id);
            const res = await api.put(`/institute/complaints/${selectedComplaint._id}`, { 
                resolutionNotes: resolutionText,
                status: 'Resolved' // Auto-resolve when notes are added
            });
            if (res.data.success) {
                setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? { ...c, status: 'Resolved', resolutionNotes: resolutionText } : c));
                CustomToast.success('Resolution saved and marked Resolved');
                setSelectedComplaint(null);
            }
        } catch (error) {
            CustomToast.error('Failed to save resolution');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Pending': return <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200"><ExclamationTriangleIcon className="w-3 h-3" /> Pending</span>;
            case 'In Progress': return <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200"><ClockIcon className="w-3 h-3" /> In Progress</span>;
            case 'Resolved': return <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircleIcon className="w-3 h-3" /> Resolved</span>;
            default: return null;
        }
    };

    if (loading) return <PageShimmer variant="cards" />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 relative">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-gray-400" />
                    Complaints & Feedback
                </h1>
                <p className="text-sm text-gray-500 mt-1">Review and resolve issues reported directly by students.</p>
            </div>

            {complaints.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">
                    <CheckCircleIcon className="w-12 h-12 text-emerald-400 dark:text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No complaints found. Everything looks good!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {complaints.map(complaint => (
                        <div key={complaint._id} className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] p-5 shadow-sm transition-all hover:shadow-md">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                
                                <div className="flex-1 space-y-2 relative pr-10">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {getStatusBadge(complaint.status)}
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">
                                            {complaint.category}
                                        </span>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            • {new Date(complaint.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{complaint.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{complaint.description}</p>
                                    
                                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                            {complaint.studentId?.name?.charAt(0) || 'A'}
                                        </div>
                                        <span className={`text-xs ${complaint.isAnonymous ? 'text-gray-400 italic' : 'text-gray-600 dark:text-gray-300'}`}>
                                            Reported by: {complaint.studentId?.name || 'Unknown Student'}
                                        </span>
                                        {complaint.studentId?.email !== 'hidden' && complaint.studentId?.email && (
                                            <span className="text-xs text-gray-400 ml-2">({complaint.studentId.email})</span>
                                        )}
                                    </div>

                                    {complaint.resolutionNotes && (
                                        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg">
                                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Resolution Notes:</p>
                                            <p className="text-sm text-emerald-800 dark:text-emerald-300">{complaint.resolutionNotes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 md:flex-col md:items-end w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/10 shrink-0">
                                    {complaint.status === 'Pending' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(complaint._id, 'In Progress')}
                                            disabled={updating === complaint._id}
                                            className="px-3 py-1.5 w-full text-xs font-medium rounded-lg border border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                                        >
                                            Mark In Progress
                                        </button>
                                    )}
                                    {complaint.status !== 'Resolved' && (
                                        <button 
                                            onClick={() => { setSelectedComplaint(complaint); setResolutionText(complaint.resolutionNotes || ''); }}
                                            className="px-3 py-1.5 w-full text-xs font-medium rounded-lg border bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600 transition-colors"
                                        >
                                            Resolve & Close
                                        </button>
                                    )}
                                    {complaint.status === 'Resolved' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(complaint._id, 'Pending')}
                                            disabled={updating === complaint._id}
                                            className="px-3 py-1.5 w-full text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Reopen
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Resolution Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resolve Complaint</h3>
                        </div>
                        <form onSubmit={handleSaveResolution} className="p-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resolution Action / Notes</label>
                            <textarea
                                value={resolutionText}
                                onChange={(e) => setResolutionText(e.target.value)}
                                rows={4}
                                placeholder="Explain how this issue was handled..."
                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white resize-y"
                                required
                            />
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedComplaint(null)}
                                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating === selectedComplaint._id}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                                >
                                    {updating === selectedComplaint._id ? 'Saving...' : 'Resolve & Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstituteComplaints;
