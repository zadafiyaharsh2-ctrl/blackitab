import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { FaPaperPlane, FaSearch, FaArrowLeft, FaEllipsisV, FaPhone, FaVideo, FaCircle, FaTimes, FaFileAlt, FaFilePdf, FaImage, FaDownload, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketContext } from '../context/SocketContext';
import { CustomToast } from '../utils/CustomToast';

const Messages = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [currentChatUser, setCurrentChatUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const [downloadingMsgId, setDownloadingMsgId] = useState(null);
    
    const { socket, onlineUsers } = useSocketContext();

    // Helper to get user ID (handles both _id and id)
    const getUserId = (user) => user?._id || user?.id;

    // Debug: Log onlineUsers whenever it changes


    // Real-time messages listener
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            const msg = data.message;
            
            if (currentChatUser) {
                 const senderIdStr = String(msg.sender._id || msg.sender);
                 const recipientIdStr = String(msg.recipient._id || msg.recipient);
                 const currentChatIdStr = String(currentChatUser._id);
                 const myId = String(JSON.parse(localStorage.getItem('user'))?._id || JSON.parse(localStorage.getItem('user'))?.id);

                 const isFromTarget = senderIdStr === currentChatIdStr;
                 const isFromMeToTarget = senderIdStr === myId && recipientIdStr === currentChatIdStr;

                 if (isFromTarget || isFromMeToTarget) {
                     setMessages(prev => {
                         if (prev.some(m => String(m._id) === String(msg._id))) return prev;
                         return [...prev, msg];
                     });
                     scrollToBottom();
                 }
            } else {
                 // For notifications: We could dispatch a toast here if we wanted
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [socket, currentChatUser?._id]);

    // Fetch conversations list
    useEffect(() => {
        fetchConversations();
    }, []);

    // Set current chat user if ID is in URL
    useEffect(() => {
        if (userId) {
            const existingConv = conversations.find(c => c._id === userId);
            if (existingConv) {
                setCurrentChatUser(existingConv);
                fetchMessages(userId);
                // Clear state when switching
                setNewMessage('');
            } else {
                fetchTargetUserDetails(userId);
            }
        }
    }, [userId, conversations]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setConversations(response.data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTargetUserDetails = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/social/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const user = response.data.user;
                setCurrentChatUser(user);
                setConversations(prev => {
                    if (!prev.find(p => p._id === user._id)) return [user, ...prev];
                    return prev;
                });
                fetchMessages(id);
            }
        } catch (error) {
            console.error('Error fetching target user', error);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMessages(response.data.messages);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error fetching messages', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChatUser) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                recipientId: currentChatUser._id,
                content: newMessage
            };

            const response = await axios.post(`${API_URL}/api/messages/send`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                }
            });

            if (response.data.success) {
                setMessages(prev => {
                    if (prev.some(m => String(m._id) === String(response.data.message._id))) return prev;
                    return [...prev, response.data.message];
                });
                setNewMessage('');
                scrollToBottom();
            }
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setSending(false);
        }
    };



    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleDownload = (url, fileName, msgId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("You must be logged in to download files.");
            return;
        }
        // Open download link in new tab with token authentication
        // Backend will verify token and redirect to actual file
        const downloadUrl = `${API_URL}/api/messages/download/${msgId}?token=${token}`;
        window.open(downloadUrl, '_blank');
    };

    const myId = JSON.parse(localStorage.getItem('user'))?._id || JSON.parse(localStorage.getItem('user'))?.id;

    const renderMessageContent = (msg) => {
        if (msg.type === 'image') {
            return (
                <div className="space-y-2">
                    <img src={msg.mediaUrl} alt="Shared" className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                    {msg.content && <p className="text-sm">{msg.content}</p>}
                </div>
            );
        } else if (msg.type === 'video') {
            return (
                <div className="space-y-2">
                    <video controls src={msg.mediaUrl} className="max-w-full rounded-lg max-h-64" />
                    {msg.content && <p className="text-sm">{msg.content}</p>}
                </div>
            );
        } else if (msg.type === 'file') {
             // Force download for files
             let downloadUrl = msg.mediaUrl;
             // Append fl_attachment for Cloudinary to force download header
             if (downloadUrl.includes('/upload/') && !downloadUrl.includes('/fl_attachment/')) {
                 downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
             }

             return (
                <div className="space-y-2">
                    <div onClick={() => handleDownload(downloadUrl, msg.fileName, msg._id)} className="flex items-center gap-3 bg-black/20 p-3 rounded-lg hover:bg-black/30 transition-all border border-gray-300 dark:border-white/10 group cursor-pointer max-w-xs">
                        <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400 group-hover:bg-red-500/20 group-hover:scale-105 transition-all">
                             {downloadingMsgId === msg._id ? <FaSpinner className="animate-spin" size={24} /> : (msg.fileName?.endsWith('.pdf') ? <FaFilePdf size={24} /> : <FaFileAlt size={24} />)}
                        </div>
                        <div className="flex-1 min-w-0">
                             <p className="text-sm font-semibold truncate text-gray-200 group-hover:text-gray-900 dark:text-white transition-colors">{msg.fileName || 'Attachment'}</p>
                             <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-blue-400 mt-0.5">
                                {downloadingMsgId === msg._id ? (
                                    <>
                                        <FaSpinner className="animate-spin" size={10} />
                                        <span>Downloading...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaDownload size={10} />
                                        <span>Download</span>
                                    </>
                                )}
                             </div>
                        </div>
                    </div>
                    {msg.content && <p className="text-sm">{msg.content}</p>}
                </div>
            );
        } else if (msg.type === 'post' && msg.post) {
             return (
                 <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-white/10 max-w-xs cursor-pointer hover:border-white/30 transition-colors">
                      {msg.post.mediaType === 'video' ? (
                          <video src={msg.post.mediaUrl} className="w-full h-32 object-cover" />
                      ) : (
                          <img src={msg.post.mediaUrl} className="w-full h-32 object-cover" alt="" />
                      )}
                      <div className="p-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{msg.post.caption || 'Shared Post'}</p>
                      </div>
                 </div>
             );
        } else {
            return <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>;
        }
    };

    return (
        <div className="flex h-screen bg-transparent backdrop-blur-sm overflow-hidden border-none relative">
            {/* BACKGROUND GLOW */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
                 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
                 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* LEFT SIDEBAR */}
            <div className={`w-full md:w-[300px] border-r border-gray-200 dark:border-white/5 flex flex-col bg-transparent z-10 ${userId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 dark:border-white/5">
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white tracking-tight">Messages</h2>
                    <div className="relative group">
                        <FaSearch className="absolute left-3 top-3 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl py-2 pl-10 pr-3 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder-gray-500"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {loading ? (
                        <div className="text-center p-8 text-gray-500 animate-pulse">Loading chats...</div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                             <div className="text-4xl mb-2 opacity-30">💬</div>
                             <div>No conversations yet</div>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <motion.div 
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                whileTap={{ scale: 0.98 }}
                                key={conv._id}
                                onClick={() => navigate(`/messages/${conv._id}`)}
                                className={`p-3 flex items-center gap-3 cursor-pointer rounded-xl transition-all border border-transparent ${currentChatUser?._id === conv._id ? 'bg-blue-600/20 border-blue-500/30 shadow-lg shadow-blue-900/20' : 'hover:border-gray-200 dark:border-white/5'}`}
                            >
                                <div className="relative">
                                    <img 
                                        src={conv.profileImage?.startsWith('http') ? conv.profileImage : `${API_URL}${conv.profileImage}` || 'https://via.placeholder.com/40'} 
                                        alt={conv.name} 
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                                    />
                                    {(onlineUsers.includes(String(conv._id)) || onlineUsers.includes(String(conv.id))) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`font-semibold truncate ${currentChatUser?._id === conv._id ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>{conv.name}</h3>
                                        <span className="text-[10px] text-gray-500">12:30 PM</span> 
                                    </div>
                                    <p className={`text-sm truncate ${currentChatUser?._id === conv._id ? 'text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>Click to verify message history...</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT SIDE: CHAT WINDOW */}
            <div className={`w-full md:flex-1 flex flex-col bg-transparent z-10 ${!userId ? 'hidden md:flex' : 'flex'}`}>
                {currentChatUser ? (
                    <>
                        {/* CHAT HEADER */}
                        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-transparent backdrop-blur-md sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/messages')} className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                                    <FaArrowLeft />
                                </button>
                                <div className="relative">
                                    <img 
                                        src={currentChatUser.profileImage?.startsWith('http') ? currentChatUser.profileImage : `${API_URL}${currentChatUser.profileImage}` || 'https://via.placeholder.com/40'} 
                                        alt={currentChatUser.name} 
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-white/10 bg-gray-50 dark:bg-gray-800"
                                    />
                                    {(onlineUsers.includes(String(currentChatUser._id)) || onlineUsers.includes(String(currentChatUser.id))) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                                    )}

                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{currentChatUser.name}</h3>
                                    {(() => {
                                        const isOnline = onlineUsers.includes(String(currentChatUser._id)) || onlineUsers.includes(String(currentChatUser.id));

                                        return isOnline ? (
                                            <span className="text-xs text-green-400 font-medium flex items-center gap-1.5"><FaCircle size={6} /> Online Now</span>
                                        ) : (
                                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">Offline</span>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4 text-gray-600 dark:text-gray-400">
                                <button onClick={() => CustomToast.info('📞 Voice calls coming soon!')} className="p-3 hover:bg-white/10 rounded-full transition-colors" title="Voice call"><FaPhone /></button>
                                <button onClick={() => CustomToast.info('📹 Video calls coming soon!')} className="p-3 hover:bg-white/10 rounded-full transition-colors" title="Video call"><FaVideo /></button>
                                <button onClick={() => CustomToast.info('More options coming soon')} className="p-3 hover:bg-white/10 rounded-full transition-colors" title="More"><FaEllipsisV /></button>
                            </div>
                        </div>

                        {/* MESSAGES AREA */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in-up">
                                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4">
                                        <div className="text-5xl">👋</div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Start a conversation</h3>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-xs">Say hello to {currentChatUser.name} and start connecting!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender._id === myId || msg.sender === myId;
                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            key={index} 
                                            className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-2 rounded-2xl shadow-md backdrop-blur-sm relative border ${
                                                        isMe 
                                                            ? 'bg-blue-600 text-white rounded-br-none border-blue-500 shadow-blue-900/20 ' 
                                                            : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-bl-none border-gray-200 dark:border-white/5 shadow-black/10'
                                                }`}>
                                                    {renderMessageContent(msg)}
                                                </div>
                                                <p className={`text-[10px] mt-1.5 font-medium px-2 ${isMe ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT AREA */}
                        <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-gray-200 dark:border-white/5 bg-transparent backdrop-blur-md">
                            
                            <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-full p-1 pl-4 flex items-center gap-2 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all shadow-lg h-12">
                                
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none placeholder-gray-500 h-full text-sm"
                                />
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg shadow-blue-900/30 ${sending ? 'bg-gray-600' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'} text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FaPaperPlane className="ml-0.5" size={14} />}
                                </motion.button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/40">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-8 border border-gray-300 dark:border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse"></div>
                            <FaPaperPlane className="text-4xl text-gray-900 dark:text-white/40 relative z-10" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Messages</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">Select a conversation from the sidebar to start chatting with your network.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
