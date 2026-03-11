import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';

const InstituteNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/social/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      setNotifications([]);
      console.warn('Notifications not fully integrated yet for institutes.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/social/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      CustomToast.error('Failed to mark notification as read');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2">
        <BellIcon className="w-5 h-5 text-gray-400" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500">Updates and alerts from your institute scope</p>
        </div>
      </div>

      {/* List */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">You're all caught up! No new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`flex items-start gap-4 px-5 py-4 ${!n.isRead ? 'bg-white dark:bg-white/[0.02]' : 'opacity-60'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${n.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium mb-0.5 ${n.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{n.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="shrink-0 p-1.5 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors self-start"
                    title="Mark as read"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteNotifications;
