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
      // Depending on the backend implementation of notifications, this endpoint might need to be adjusted or created.
      // Assuming a generic /notifications route exists that scopes to user's institute if role is institute-bound
      const res = await api.get('/social/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      // Assuming notifications endpoint might not be fully hooked up for institues, fallback gracefully
      setNotifications([]);
      console.warn("Notifications not fully integrated yet for institutes.");
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
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
          <BellIcon className="w-8 h-8 text-orange-500 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-gray-500 text-sm">Updates and alerts from your institute scope</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center p-8 glass-panel border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
            <BellIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">You're all caught up! No new notifications.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id} 
              className={`p-5 rounded-2xl border transition-colors flex gap-4 ${
                n.isRead 
                  ? 'bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 opacity-70' 
                  : 'bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-500/30 shadow-md shadow-orange-500/5'
              }`}
            >
              <div className="mt-1">
                {n.type === 'alert' ? <div className="w-2 h-2 mt-2 rounded-full bg-red-500" /> : <div className="w-2 h-2 mt-2 rounded-full bg-orange-500" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium mb-1 ${n.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                  {n.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{n.message}</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!n.isRead && (
                <button 
                  onClick={() => markAsRead(n._id)}
                  className="shrink-0 p-2 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors self-start"
                  title="Mark as read"
                >
                  <CheckCircleIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InstituteNotifications;
