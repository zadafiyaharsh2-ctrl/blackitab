/**
 * ============================================================================
 * useAskAIChat CUSTOM HOOK
 * ============================================================================
 * 
 * Shared chat logic used by both the full AskAI page and the AskAISidebar.
 * Encapsulates: messages state, sending queries, chat history, Q&A history,
 * loading states, and error handling.
 * 
 * Options:
 * - subjectContext: optional subject name to prepend as context to queries
 * - topicContext: optional topic name to prepend as context to queries
 * - loadHistory: whether to fetch chat history & Q&A history on mount (default: true)
 */

import { useState, useEffect, useRef } from 'react';
import API_URL from '../config';

const DEFAULT_GREETING = "Hello! I'm your AI learning assistant. Ask me anything about your studies, and I'll help you understand concepts better. 🎓";

const useAskAIChat = ({ subjectContext, topicContext, loadHistory = true } = {}) => {
    // Build a context-aware greeting
    const contextLabel = topicContext || subjectContext || null;
    const greeting = contextLabel
        ? `Hi! Ask me anything about **${contextLabel}** and I'll help you understand it better. 🎓`
        : DEFAULT_GREETING;

    const [messages, setMessages] = useState([
        { role: 'assistant', content: greeting }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const getToken = () => localStorage.getItem('token');

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Reset greeting when context changes
    useEffect(() => {
        const newGreeting = contextLabel
            ? `Hi! Ask me anything about **${contextLabel}** and I'll help you understand it better. 🎓`
            : DEFAULT_GREETING;
        setMessages([{ role: 'assistant', content: newGreeting }]);
    }, [topicContext, subjectContext]);

    // Fetch conversation-thread history on mount
    useEffect(() => {
        if (!loadHistory) return;
        fetchChatHistory();
        fetchHistory();
    }, [loadHistory]);

    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/api/ai/chat-history`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.ok && data.messages && data.messages.length > 0) {
                    const formattedMessages = data.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }));
                    setMessages(formattedMessages);
                }
            }
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const response = await fetch(`${API_URL}/api/ai/history?limit=20`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (response.ok) {
                const data = await response.json();
                setHistory(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        // Build context prefix for AI
        let contextPrefix = '';
        if (subjectContext && topicContext) {
            contextPrefix = `[Context: ${subjectContext} - ${topicContext}] `;
        } else if (subjectContext) {
            contextPrefix = `[Context: ${subjectContext}] `;
        }

        const userMessage = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/api/ai/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ query: contextPrefix + currentInput })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get response');
            }

            const aiResponse = {
                role: 'assistant',
                content: data.aiResponse?.content || 'No response content'
            };

            setMessages(prev => [...prev, aiResponse]);
            if (loadHistory) fetchHistory();
        } catch (err) {
            console.error('Error:', err);
            setError(err.message);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.',
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFromHistory = (item) => {
        setMessages([
            { role: 'user', content: item.question },
            { role: 'assistant', content: item.answer }
        ]);
        setShowHistory(false);
    };

    const deleteHistoryItem = async (id, e) => {
        e?.stopPropagation();
        try {
            await fetch(`${API_URL}/api/ai/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            setHistory(prev => prev.filter(item => item._id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const clearAllHistory = async () => {
        if (!window.confirm('Are you sure you want to clear all history?')) return;

        try {
            await fetch(`${API_URL}/api/ai/history/clear`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            setHistory([]);
            setMessages([{ role: 'assistant', content: greeting }]);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    return {
        // State
        messages,
        input,
        setInput,
        isLoading,
        error,
        setError,
        history,
        showHistory,
        setShowHistory,
        loadingHistory,

        // Refs
        chatEndRef,
        inputRef,

        // Actions
        handleSendMessage,
        loadFromHistory,
        deleteHistoryItem,
        clearAllHistory,
    };
};

export default useAskAIChat;
