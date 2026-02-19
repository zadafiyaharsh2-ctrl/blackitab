import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { FaPlay, FaRandom, FaShare, FaArrowLeft, FaClock, FaListOl, FaCamera, FaPen } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PlaylistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false); // New state

    useEffect(() => {
        fetchPlaylistDetails();
    }, [id]);

    const handleThumbnailUpdate = async (e) => {
        const file = e.target.files[0];
        if(!file) return;

        try {
            setUploading(true);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('thumbnail', file);
            
            const res = await axios.put(`${API_URL}/api/playlists/${id}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                // Update local state immediately
                setPlaylist(prev => ({ ...prev, thumbnail: res.data.playlist.thumbnail }));
            }
        } catch (error) {
            console.error('Update thumbnail error:', error);
            alert('Failed to update thumbnail');
        } finally {
            setUploading(false);
        }
    };

    const fetchPlaylistDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token'); // Optional, but good if private
            const res = await axios.get(`${API_URL}/api/playlists/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPlaylist(res.data.playlist);
            }
        } catch (error) {
            console.error('Error fetching playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="min-h-screen bg-black text-gray-900 dark:text-white flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold">Playlist not found</h2>
                <button onClick={() => navigate('/playlists')} className="mt-4 text-purple-400 hover:text-purple-300">
                    Go back to Playlists
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-gray-900 dark:text-white font-sans selection:bg-purple-500/30 pb-20">
            
            {/* Dynamic Background Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 via-black/50 to-transparent" />
                {playlist.thumbnail && (
                    <div className="absolute top-0 left-0 w-full h-[600px] opacity-20 blur-[100px]">
                        <img 
                            src={playlist.thumbnail} 
                            alt="" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                {/* Global Glass Overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-8">
                {/* Navbar Placeholder / Back Button */}
                <div className="mb-8">
                    <button 
                         onClick={() => navigate(-1)} 
                         className="flex items-center gap-2 text-gray-900 dark:text-white/70 hover:text-gray-900 dark:text-white transition-colors bg-gray-100 dark:bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/5 px-4 py-2 rounded-full text-sm font-medium"
                    >
                        <FaArrowLeft /> Back to Playlists
                    </button>
                </div>

                {/* HERO SECTION */}
                <div className="flex flex-col md:flex-row gap-8 items-end mb-10">
                    {/* Cover Art */}
                    <div className="relative group shrink-0 w-52 h-52 md:w-64 md:h-64 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-gray-300 dark:border-white/10">
                        {playlist.thumbnail ? (
                            <img 
                                src={playlist.thumbnail} 
                                alt={playlist.title} 
                                className="w-full h-full object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 dark:bg-white/5 backdrop-blur-xl flex items-center justify-center">
                                <span className="text-gray-900 dark:text-white/30 font-medium text-lg">No Cover</span>
                            </div>
                        )}
                         {/* Hover Overlay for Edit */}
                        {playlist.user?._id === (JSON.parse(localStorage.getItem('user'))?._id || JSON.parse(localStorage.getItem('user'))?.id) && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                <label className="cursor-pointer text-gray-900 dark:text-white flex flex-col items-center gap-2 hover:scale-105 transition-transform">
                                    <FaCamera size={24} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Change Cover</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleThumbnailUpdate}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                         )}
                         {uploading && (
                             <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                 <span className="text-gray-900 dark:text-white text-sm font-bold animate-pulse">Uploading...</span>
                             </div>
                         )}
                    </div>

                    {/* Playlist Info */}
                    <div className="flex-1 flex flex-col gap-3 pb-2">
                        <span className="uppercase text-xs font-bold tracking-widest text-gray-900 dark:text-white/80">
                            {playlist.isPrivate ? 'Private Playlist' : 'Public Playlist'}
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-2 leading-none drop-shadow-xl">
                            {playlist.title}
                        </h1>
                        <p className="text-gray-900 dark:text-white/60 text-sm md:text-base max-w-2xl line-clamp-2 mb-2">
                            {playlist.description || "No description provided."}
                        </p>
                        
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white/90">
                            {/* User Avatar Tiny */}
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-gray-900 dark:text-white shrink-0 shadow-lg border border-white/20">
                                {playlist.user?.name?.[0]}
                            </div>
                            <span className="hover:underline cursor-pointer drop-shadow-md">
                                {playlist.user?.name}
                            </span>
                            <span className="text-gray-900 dark:text-white/50">•</span>
                            <span className="text-gray-900 dark:text-white/70 drop-shadow-md">{playlist.posts?.length} videos</span>
                            <span className="text-gray-900 dark:text-white/50">•</span>
                            <span className="text-gray-900 dark:text-white/50 drop-shadow-md">Updated today</span>
                        </div>
                    </div>
                </div>

                {/* CONTROLS BAR */}
                <div className="flex items-center gap-6 mb-8">
                    {playlist.posts?.length > 0 && (
                        <button 
                            onClick={() => navigate(`/content/${playlist.posts[0]._id}`)}
                            className="w-14 h-14 bg-green-500 hover:bg-green-400 text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 transition-all"
                        >
                            <FaPlay size={24} className="ml-1" />
                        </button>
                    )}
                    <button className="text-gray-900 dark:text-white/50 hover:text-gray-900 dark:text-white transition-colors">
                        <FaRandom size={24} />
                    </button>
                     <button className="text-gray-900 dark:text-white/50 hover:text-gray-900 dark:text-white transition-colors">
                        <FaShare size={24} />
                    </button>
                </div>

                {/* VIDEO LIST CONTAINER */}
                <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-2xl border border-gray-300 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {/* VIDEO LIST HEADER */}
                    <div className="sticky top-0 z-20 bg-black/20 backdrop-blur-xl border-b border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wider grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4">
                        <div className="w-8 text-center">#</div>
                        <div>Title</div>
                        <div className="hidden md:block"><FaClock /></div>
                    </div>

                    {/* VIDEO LIST */}
                    <div className="flex flex-col">
                        {playlist.posts?.length > 0 ? (
                            playlist.posts.map((post, index) => (
                                <motion.div 
                                    key={post._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => navigate(`/content/${post._id}`)}
                                    className="group grid grid-cols-[auto_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-gray-100 dark:bg-white/5 cursor-pointer transition-colors border-b border-gray-200 dark:border-white/5 last:border-0"
                                >
                                    {/* Index / Play Icon */}
                                    <div className="w-8 text-center text-gray-600 dark:text-gray-400 text-base font-medium relative h-6 flex items-center justify-center">
                                        <span className="group-hover:hidden">{index + 1}</span>
                                        <FaPlay size={10} className="hidden group-hover:block text-gray-900 dark:text-white" />
                                    </div>

                                    {/* Title & Meta */}
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Tiny Thumbnail */}
                                        <div className="w-16 h-10 md:w-32 md:h-20 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-gray-200 dark:border-white/5">
                                            {post.mediaType === 'image' ? (
                                                <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0 gap-1">
                                            <span className="text-gray-900 dark:text-white font-medium text-base truncate group-hover:text-green-400 transition-colors">
                                                {post.title || "Untitled Video"}
                                            </span>
                                            <span className="text-gray-500 text-xs md:hidden">
                                                {post.user?.name}
                                            </span>
                                            <span className="hidden md:inline-block text-gray-600 dark:text-gray-400 text-sm group-hover:text-gray-700 dark:text-gray-300 w-fit line-clamp-1">
                                                {post.caption || "No description"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date/Time */}
                                    <div className="hidden md:block text-gray-500 text-sm font-medium">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-gray-600 dark:text-gray-400 mb-4">This playlist is empty.</p>
                                {/* Hint for owner */}
                                {playlist.user?._id === (JSON.parse(localStorage.getItem('user'))?._id || JSON.parse(localStorage.getItem('user'))?.id) && (
                                    <button 
                                        onClick={() => navigate('/create-post')}
                                        className="text-gray-900 dark:text-white font-medium hover:underline bg-white/10 px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 hover:bg-white/20 transition-all"
                                    >
                                        Add your first video
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;
