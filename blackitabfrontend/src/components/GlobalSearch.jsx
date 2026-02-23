import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaTimes, FaUser, FaBook, FaSpinner } from 'react-icons/fa';
import API_URL from '../config';

const GlobalSearch = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    // Debounced search
    const search = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); return; }
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/social/search?query=${encodeURIComponent(q)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setResults(res.data.data);
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => search(query), 300);
        return () => clearTimeout(timer);
    }, [query, search]);

    const handleSelect = (userId) => {
        navigate(`/profile/${userId}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Search Panel */}
            <div
                className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/40 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                    {loading ? (
                        <FaSpinner className="text-gray-400 animate-spin flex-shrink-0" />
                    ) : (
                        <FaSearch className="text-gray-400 flex-shrink-0" />
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search for people, topics…"
                        className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
                    />
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <FaTimes className="text-gray-400" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                    {results.length > 0 ? (
                        results.map(user => (
                            <button
                                key={user._id}
                                onClick={() => handleSelect(user._id)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUser className="text-gray-500 dark:text-gray-400 text-sm" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user.name}</p>
                                    {user.bio && <p className="text-gray-400 text-xs truncate">{user.bio}</p>}
                                </div>
                                <span className="text-xs text-gray-400">{user.followerCount || 0} followers</span>
                            </button>
                        ))
                    ) : query.trim() && !loading ? (
                        <div className="py-10 text-center text-gray-500 text-sm">
                            No results for "<span className="text-gray-700 dark:text-gray-300 font-medium">{query}</span>"
                        </div>
                    ) : !query.trim() ? (
                        <div className="py-8 text-center text-gray-400 text-sm">
                            <FaBook className="mx-auto mb-2 text-xl opacity-40" />
                            Type to search for people
                        </div>
                    ) : null}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-400">
                    <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 font-mono">↵</kbd> select</span>
                    <span><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 font-mono">Esc</kbd> close</span>
                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
