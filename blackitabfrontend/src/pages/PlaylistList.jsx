import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import PlaylistCard from '../components/PlaylistCard';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaLayerGroup } from 'react-icons/fa';

const PlaylistList = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/playlists/all`);
            if (res.data.success) {
                setPlaylists(res.data.playlists);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlaylist = (id) => {
        setPlaylists(prev => prev.filter(p => p._id !== id));
    };

    const filteredPlaylists = playlists.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-white pt-28 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section - Minimalist */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-gray-200 dark:border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-gray-900 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
                            <FaLayerGroup />
                            <span>Collections</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                            Explore Series
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg max-w-lg">
                            Discover curated learning paths and collections from our community.
                        </p>
                    </div>

                    {/* Search Bar - Clean & Integrated */}
                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-500 group-focus-within:text-gray-900 dark:text-white transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search playlists & creators..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#18181A] border border-[#27272A] rounded-full py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-600 focus:outline-none focus:border-white/20 focus:bg-[#202022] transition-all"
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="bg-[#18181A] rounded-xl aspect-[4/3] animate-pulse border border-gray-200 dark:border-white/5"></div>
                        ))}
                    </div>
                ) : filteredPlaylists.length > 0 ? (
                     <div key={searchTerm} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlaylists.map((playlist, index) => (
                            <motion.div
                                key={playlist._id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, type: "spring", stiffness: 100, damping: 20 }}
                            >
                                <PlaylistCard playlist={playlist} onDelete={handleDeletePlaylist} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center text-gray-500">
                        <FaFilter size={32} className="mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-1">No series found</h3>
                        <p>Try adjusting your search terms</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistList;
