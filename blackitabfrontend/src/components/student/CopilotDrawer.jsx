import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRobot, FaTimes, FaLocationArrow } from 'react-icons/fa';
import API_URL from '../../config'; // Adjust to your config path

// Make sure to npm install framer-motion and react-markdown if you haven't!
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const CopilotDrawer = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I am the Ranklen Copilot. Need study recommendations based on your analytics?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            // Send payload to the Express route (make sure to set up this route in your backend!)
            const res = await axios.post(`${API_URL}/api/copilot/chat`, {
                message: userMsg
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
            }
        } catch (error) {
            console.error("Copilot chat error:", error);
            setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to the Ranklen neural net. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    />

                    {/* Sliding Drawer */}
                    <motion.div 
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-[#0a0a0a] shadow-2xl border-l border-gray-200 dark:border-white/10 z-50 flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10 bg-[#f8f9fa] dark:bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#0061FF]/10 rounded-xl">
                                    <FaRobot className="text-[#0061FF] text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Ranklen Copilot</h2>
                                    <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-500">Analytics Aware</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-4 text-[14px] leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-[#0061FF] text-white rounded-br-none' 
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-white/5'
                                    }`}>
                                        {msg.role === 'ai' ? (
                                            <div className="markdown-body prose dark:prose-invert prose-sm pb-0 mb-0">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p>{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-white/5 rounded-2xl rounded-bl-none p-4 flex gap-1 items-center h-12">
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#05000a]">
                            <form 
                                onSubmit={handleSendMessage}
                                className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full p-1.5 focus-within:border-[#0061FF]/50 focus-within:ring-2 focus-within:ring-[#0061FF]/20 transition-all shadow-input"
                            >
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="What should I study today?"
                                    className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="w-10 h-10 shrink-0 rounded-full bg-[#0061FF] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <FaLocationArrow className="-ml-0.5 mt-0.5 text-xs" />
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-medium flex items-center justify-center gap-1.5">
                                AI can make mistakes. Verify important info.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CopilotDrawer;
