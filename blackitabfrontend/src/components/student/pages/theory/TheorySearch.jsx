import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, Loader2, BookOpen, FileText, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import API_URL from '../../../../config';

const TheorySearch = ({ onSelectResult }) => {
    const { isDark } = useTheme();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    // Debounced Search
    const performSearch = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/theory/search?q=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setResults(res.data.data);
                setIsOpen(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Close on click outside or escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto z-50 mb-6">
            <div 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300"
                style={{
                    background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    boxShadow: isOpen ? (isDark ? '0 0 20px rgba(59,130,246,0.3)' : '0 10px 25px rgba(0,0,0,0.05)') : 'none',
                }}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                ) : (
                    <Search className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
                
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
                    }}
                    onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
                    placeholder="Search any subject, topic, or question in Theory..."
                    className="flex-1 bg-transparent border-none outline-none font-medium text-sm w-full"
                    style={{ color: isDark ? 'white' : 'black' }}
                />

                {query && (
                    <button 
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
                        className="p-1 rounded-full hover:bg-gray-500/20 transition-colors"
                    >
                        <X className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && query.length >= 2 && (
                <div 
                    className="absolute top-full left-0 right-0 mt-3 rounded-2xl border overflow-hidden shadow-2xl"
                    style={{
                        background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(16px)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }}
                >
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                        {results.length > 0 ? (
                            <div className="py-2">
                                {results.map((res, index) => (
                                    <button
                                        key={res._id + index}
                                        onClick={() => {
                                            setIsOpen(false);
                                            onSelectResult(res);
                                        }}
                                        className="w-full text-left px-4 py-3 flex items-start gap-4 transition-colors"
                                        style={{
                                            borderBottom: index < results.length - 1 ? (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)') : 'none',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{
                                                background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.1)',
                                                color: '#3b82f6'
                                            }}
                                        >
                                            {res.type === 'subject' ? <BookOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#3b82f6' }}>
                                                {res.subjectName}
                                                {res.type !== 'subject' && (
                                                    <>
                                                        <ChevronRight className="w-3 h-3" />
                                                        <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{res.name}</span>
                                                    </>
                                                )}
                                            </div>
                                            <p 
                                                className="text-sm font-medium leading-relaxed truncate"
                                                style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                                            >
                                                {res.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-sm font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                No results found for "{query}"
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Backdrop Layer */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default TheorySearch;
