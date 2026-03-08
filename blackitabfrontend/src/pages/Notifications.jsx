import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaUserPlus, FaCheck, FaBan, FaReply, FaSpinner, FaArrowLeft, FaEnvelope, FaHeart, FaComment, FaExclamationCircle, FaCircle, FaTrash } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';
import { useSocketContext } from '../context/SocketContext';

const Notifications = () => {
    usePageTitle('Notifications');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const { socket } = useSocketContext();

    useEffect(() => {
        if (!socket) return;
        socket.on('new_notification', (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
        });
        return () => {
            socket.off('new_notification');
        };
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/social/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                // Optionally filter out read ones, or we can show them with different opacity
                const unreadOrAll = response.data.data.filter(n => !n.read);
                setNotifications(unreadOrAll);
            }
        } catch (error) {
            console.error('Error fetching notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/social/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/social/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification', error);
        }
    };

    const handleClearAll = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/social/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications([]);
        } catch (error) {
            console.error('Error clearing notifications', error);
        }
    };

    const handleAccept = async (senderId, notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/social/accept-follow/${senderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update UI
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isAccepted: true } : n));
        } catch (error) {
            console.error('Error accepting request', error);
        }
    };

    const handleReject = async (senderId, notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/social/reject-follow/${senderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from UI
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Error rejecting request', error);
        }
    };

    const handleFollowBack = async (targetId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/social/follow/${targetId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update UI (optimistic)
            setNotifications(prev => prev.map(n => n.sender?._id === targetId ? { ...n, isFollowing: true } : n));
        } catch (error) {
            console.error('Error following back', error);
        }
    };

    return (
        <div className="min-h-screen bg-transparent backdrop-blur-sm p-4 md:p-8 relative overflow-hidden">
            {/* BACKGROUND GLOW */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
                <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[10%] right-[20%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="p-3 mr-2 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-white/10 text-gray-900 dark:text-white transition-colors border border-gray-300 dark:border-white/10">
                        <FaArrowLeft />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-gray-300 dark:border-white/10 shadow-lg backdrop-blur-md">
                        <FaBell className="text-blue-400 text-xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Stay updated with your network</p>
                    </div>
                </div>

                {notifications.length > 0 && !loading && (
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={handleClearAll}
                            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20"
                        >
                            <FaTrash size={10} /> Clear All
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/5 backdrop-blur-md">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaBell className="text-4xl text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">When you get likes, comments or follows, they'll show up here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {notifications.map((note) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={note._id}
                                    className="bg-gray-100 dark:bg-white/5 hover:bg-white/10 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:border-white/10 rounded-2xl p-4 transition-all backdrop-blur-md shadow-lg"
                                >
                                    <div className="flex gap-4">
                                        {(() => {
                                            let icon = <FaBell size={16} />;
                                            let bgClass = "bg-gray-500/20 text-gray-400";
                                            if (note.type === 'follow_request') { icon = <FaUserPlus size={16} />; bgClass = "bg-blue-500/20 text-blue-400"; }
                                            else if (note.type === 'follow_accepted' || note.type === 'new_follower') { icon = <FaCheck size={16} />; bgClass = "bg-green-500/20 text-green-400"; }
                                            else if (note.type === 'new_message') { icon = <FaEnvelope size={16} />; bgClass = "bg-purple-500/20 text-purple-400"; }
                                            else if (note.type === 'post_like') { icon = <FaHeart size={16} />; bgClass = "bg-red-500/20 text-red-400"; }
                                            else if (note.type === 'post_comment') { icon = <FaComment size={16} />; bgClass = "bg-yellow-500/20 text-yellow-500"; }
                                            else if (note.type === 'system_alert') { icon = <FaExclamationCircle size={16} />; bgClass = "bg-orange-500/20 text-orange-400"; }
                                            return (
                                                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shrink-0 ${bgClass}`}>
                                                    {icon}
                                                </div>
                                            );
                                        })()}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-gray-200 text-sm leading-relaxed mb-1 pr-4">
                                                    {note.sender && (
                                                        <span className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-400 transition-colors">
                                                            {note.sender.name}
                                                        </span>
                                                    )}
                                                    <span className={`text-gray-600 dark:text-gray-400 ${note.sender ? 'px-1' : ''}`}>
                                                        {note.message ? note.message : (
                                                            note.type === 'follow_request' ? 'requested to follow you' : 
                                                            note.type === 'follow_accepted' ? 'accepted your follow request' :
                                                            note.type === 'new_follower' ? 'started following you' :
                                                            note.type === 'post_like' ? 'liked your post' : 
                                                            note.type === 'post_comment' ? 'commented on your post' :
                                                            'sent you a notification'
                                                        )}
                                                    </span>
                                                </p>
                                                {!note.read && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-600 font-medium block mb-3">
                                                {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>

                                            {/* ACTION BUTTONS */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {note.type === 'follow_request' && note.sender ? (
                                                    !note.isAccepted ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleAccept(note.sender._id, note._id)}
                                                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                                            >
                                                                <FaCheck size={10} /> Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(note.sender._id, note._id)}
                                                                className="px-4 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                                                            >
                                                                <FaBan size={10} /> Delete Request
                                                            </button>
                                                        </>
                                                    ) : (
                                                        !note.isFollowing ? (
                                                            <button
                                                                onClick={() => handleFollowBack(note.sender._id)}
                                                                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-gray-900 dark:text-white text-xs font-semibold rounded-lg transition-all shadow-lg flex items-center gap-2"
                                                            >
                                                                <FaReply size={10} /> Follow Back
                                                            </button>
                                                        ) : (
                                                            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-lg inline-flex items-center gap-2 cursor-default">
                                                                <FaCheck size={10} /> Friends
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    // Basic Dismiss / Mark Read for other notification types
                                                    <>
                                                        <button
                                                            onClick={() => handleMarkAsRead(note._id)}
                                                            className="px-4 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <FaCheck size={10} /> Mark as Read
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(note._id)}
                                                            className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-white/10 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center p-2"
                                                            title="Delete Notification"
                                                        >
                                                            <FaTrash size={10} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
