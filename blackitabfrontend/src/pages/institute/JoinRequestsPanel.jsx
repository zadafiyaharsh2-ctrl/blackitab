import React, { useState, useEffect } from 'react';
import { UserPlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const JoinRequestsPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institute/join-requests');
      setRequests(res.data.data);
    } catch (error) {
      toast.error('Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.post(`/institute/join-requests/${id}/approve`);
      toast.success(res.data.message);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await api.post(`/institute/join-requests/${id}/reject`);
      toast.success(res.data.message);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-2xl text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlusIcon className="w-5 h-5 text-gray-400" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Join Requests</h1>
            <p className="text-sm text-gray-500">Review and approve users requesting to join your institute</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{requests.length} pending</span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <UserPlusIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">No pending requests</p>
            <p className="text-xs text-gray-400 mt-1">You have no new requests to process.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100 dark:border-white/5">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch Year</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested On</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-bold shrink-0">
                          {(req.userId?.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{req.userId?.name || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {req.userId?.role ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400">
                          {req.userId.role.charAt(0).toUpperCase() + req.userId.role.slice(1)}
                        </span>
                      ) : <span className="text-gray-400 text-sm">-</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {req.userId?.email || 'N/A'}
                    </td>
                    <td className="px-5 py-3">
                      {req.userId?.batchYear ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400">
                          {req.userId.batchYear}
                        </span>
                      ) : <span className="text-gray-400 text-sm">-</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleApprove(req._id)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-emerald-600 hover:border-emerald-200 dark:hover:border-emerald-500/30 dark:hover:text-emerald-400 transition-colors"
                          title="Approve"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:border-red-200 dark:hover:border-red-500/30 dark:hover:text-red-400 transition-colors"
                          title="Reject"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinRequestsPanel;
