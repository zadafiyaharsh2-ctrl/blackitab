import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config';
import { FaBell, FaUserPlus, FaCheck, FaBan, FaReply, FaSpinner, FaEnvelope, FaHeart, FaComment, FaExclamationCircle, FaTrash } from 'react-icons/fa';
import usePageTitle from '../../hooks/usePageTitle';
import { useSocketContext } from '../../context/SocketContext';

const iconFor = (type) => {
  if (type === 'follow_request') return <FaUserPlus className="text-blue-500" />;
  if (type === 'follow_accepted' || type === 'new_follower') return <FaCheck className="text-emerald-500" />;
  if (type === 'new_message') return <FaEnvelope className="text-purple-500" />;
  if (type === 'post_like') return <FaHeart className="text-red-500" />;
  if (type === 'post_comment') return <FaComment className="text-amber-500" />;
  if (type === 'system_alert') return <FaExclamationCircle className="text-orange-500" />;
  return <FaBell className="text-gray-400" />;
};

const messageFor = (note) => {
  if (note.message) return note.message;
  if (note.type === 'follow_request') return 'requested to follow you';
  if (note.type === 'follow_accepted') return 'accepted your follow request';
  if (note.type === 'new_follower') return 'started following you';
  if (note.type === 'post_like') return 'liked your post';
  if (note.type === 'post_comment') return 'commented on your post';
  return 'sent you a notification';
};

const Notifications = () => {
  usePageTitle('Notifications');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocketContext();

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_notification', (n) => setNotifications(prev => [n, ...prev]));
    return () => socket.off('new_notification');
  }, [socket]);

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/social/notifications`, { headers: headers() });
      if (res.data.success) setNotifications(res.data.data.filter(n => !n.read));
    } catch {}
    finally { setLoading(false); }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/social/notifications/${id}/read`, {}, { headers: headers() });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/social/notifications/${id}`, { headers: headers() });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_URL}/api/social/notifications`, { headers: headers() });
      setNotifications([]);
    } catch {}
  };

  const handleAccept = async (senderId, noteId) => {
    try {
      await axios.post(`${API_URL}/api/social/accept-follow/${senderId}`, {}, { headers: headers() });
      setNotifications(prev => prev.map(n => n._id === noteId ? { ...n, isAccepted: true } : n));
    } catch {}
  };

  const handleReject = async (senderId, noteId) => {
    try {
      await axios.post(`${API_URL}/api/social/reject-follow/${senderId}`, {}, { headers: headers() });
      setNotifications(prev => prev.filter(n => n._id !== noteId));
    } catch {}
  };

  const handleFollowBack = async (targetId) => {
    try {
      await axios.post(`${API_URL}/api/social/follow/${targetId}`, {}, { headers: headers() });
      setNotifications(prev => prev.map(n => n.sender?._id === targetId ? { ...n, isFollowing: true } : n));
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBell className="text-gray-400" /> Notifications
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Stay updated with your network</p>
        </div>
        {notifications.length > 0 && !loading && (
          <button onClick={handleClearAll} className="text-xs text-red-500 hover:underline flex items-center gap-1">
            <FaTrash className="text-[10px]" /> Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-gray-400 text-xl" /></div>
      ) : notifications.length === 0 ? (
        <div className="border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-16 text-center text-gray-400">
          <FaBell className="text-3xl mx-auto mb-3 opacity-20" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">No notifications</p>
          <p className="text-sm mt-1">When you get likes, comments or follows, they'll show up here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(note => (
            <div key={note._id} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 text-sm mt-0.5">
                  {iconFor(note.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {note.sender && <span className="font-semibold text-gray-900 dark:text-white">{note.sender.name} </span>}
                      {messageFor(note)}
                    </p>
                    {!note.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5 ml-2" />}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {note.type === 'follow_request' && note.sender ? (
                      !note.isAccepted ? (
                        <>
                          <button onClick={() => handleAccept(note.sender._id, note._id)} className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-semibold rounded-lg flex items-center gap-1">
                            <FaCheck className="text-[10px]" /> Accept
                          </button>
                          <button onClick={() => handleReject(note.sender._id, note._id)} className="px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-white/5">
                            <FaBan className="text-[10px]" /> Delete
                          </button>
                        </>
                      ) : !note.isFollowing ? (
                        <button onClick={() => handleFollowBack(note.sender._id)} className="px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-white/5">
                          <FaReply className="text-[10px]" /> Follow Back
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                          <FaCheck className="text-[10px]" /> Friends
                        </span>
                      )
                    ) : (
                      <>
                        <button onClick={() => handleMarkAsRead(note._id)} className="px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-white/5">
                          <FaCheck className="text-[10px]" /> Mark Read
                        </button>
                        <button onClick={() => handleDelete(note._id)} className="px-2.5 py-1.5 border border-gray-200 dark:border-white/10 text-gray-400 text-xs rounded-lg hover:text-red-500 hover:border-red-200">
                          <FaTrash className="text-[10px]" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
