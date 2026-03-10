import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaComment, FaHeart, FaUserPlus, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config';

/**
 * NotificationBell — Fixed top-right notification bell with dropdown.
 * Shows unread count badge and a preview of recent notifications.
 */
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Poll unread count every 30s
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/social/notifications/unread-count`, { headers });
        if (res.data.success) setUnreadCount(res.data.count);
      } catch { }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent notifications when opened
  const handleOpen = async () => {
    setOpen(!open);
    if (!open) {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/social/notifications`, { headers });
        if (res.data.success) setNotifications(res.data.data?.slice(0, 8) || []);
      } catch { } finally { setLoading(false); }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <FaHeart className="text-rose-400" />;
      case 'comment': return <FaComment className="text-blue-400" />;
      case 'follow': return <FaUserPlus className="text-emerald-400" />;
      case 'message': return <FaEnvelope className="text-amber-400" />;
      default: return <FaBell className="text-gray-400" />;
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[997]"
          />
        )}
      </AnimatePresence>

      {/* Bell Button — Fixed top-right (Hidden on mobile to live in hamburger) */}
      <div className="hidden md:block fixed top-5 right-8 z-[998]">
        <motion.button
          onClick={handleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-3 rounded-xl transition-all duration-300 ${
            open
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-xl'
          }`}
        >
          <FaBell className="text-lg" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-lg shadow-red-500/50 ring-2 ring-white dark:ring-gray-900"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-full right-0 mt-3 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-3 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <FaBell className="text-blue-500" /> Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                  <FaTimes size={12} />
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={n._id || i} className={`px-5 py-3 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-sm">{getIcon(n.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white leading-snug">
                            <span className="font-semibold">{n.from?.name || 'Someone'}</span>{' '}
                            <span className="text-gray-500 dark:text-gray-400">
                              {n.type === 'like' ? 'liked your post' :
                               n.type === 'comment' ? 'commented on your post' :
                               n.type === 'follow' ? 'started following you' :
                               n.type === 'message' ? 'sent you a message' :
                               n.message || 'sent a notification'}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FaBell className="mx-auto text-2xl mb-2 opacity-30" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <Link to="/notifications" onClick={() => setOpen(false)}
                className="block text-center px-5 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-white/5 border-t border-gray-200/50 dark:border-white/10 transition"
              >
                View All Notifications
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default NotificationBell;
