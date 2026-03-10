import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaFire, FaStar, FaMedal, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';
const RANK_STYLES = {
    1: { bg: 'from-green-400/30 via-emerald-500/20 to-teal-900/40', border: 'border-green-400/60', glow: 'shadow-[0_0_60px_rgba(74,222,128,0.5)]', icon: '🃏', badge: 'bg-green-500 text-black' },
    2: { bg: 'from-purple-500/30 via-fuchsia-500/20 to-purple-900/40', border: 'border-purple-500/60', glow: 'shadow-[0_0_50px_rgba(168,85,247,0.4)]', icon: '🎭', badge: 'bg-purple-500 text-white' },
    3: { bg: 'from-red-500/30 via-rose-500/20 to-red-900/40', border: 'border-red-500/60', glow: 'shadow-[0_0_50px_rgba(244,63,94,0.4)]', icon: '🎪', badge: 'bg-red-500 text-white' },
};

const Leaderboard = () => {
    usePageTitle('Leaderboard');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { const u = JSON.parse(stored); setCurrentUserId(u._id || u.id); } catch { }
        }
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/user/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success && res.data.data && res.data.data.length > 0) {
                setUsers(res.data.data);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error('Leaderboard error:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const topThree = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div className="min-h-screen bg-[#05000a] text-white p-4 md:p-8 relative overflow-hidden font-sans w-full max-w-full flex justify-center selection:bg-green-500/30">
            {/* Background Orbs: Joker Theme (Deep Purples & Acid Greens) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-fuchsia-700/15 rounded-full blur-[150px] mix-blend-screen" />
                
                {/* Noise overlay for gritty feel */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPgo8cmVjdCB3aWR0aD0nNCcgaGVpZ2h0PSc0JyBmaWxsPScjZmZmJyBmaWxsLW9wYWNpdHk9JzAuMScvPgo8L3N2Zz4=')] mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* Container forcing center */}
            <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
                {/* Header */}
                <div className="w-full flex flex-col items-center text-center mb-16 relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 top-1 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-purple-500/50 text-gray-400 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all z-20 group"
                    >
                        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-gradient-to-br from-green-500/20 via-purple-500/20 to-black border border-green-500/30 shadow-[0_0_40px_rgba(74,222,128,0.2)] mb-6 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-green-400/20 blur-xl group-hover:bg-green-400/40 transition-all duration-500"></div>
                        <FaTrophy className="text-5xl text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.8)] relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase relative">
                        <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-purple-500 to-green-400 blur-xl opacity-50 block">GLOBAL ELITE</span>
                        GLOBAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-purple-500 to-fuchsia-500 animate-pulse">ELITE</span>
                    </h1>
                    <p className="text-green-400/80 text-lg md:text-xl mt-4 font-bold tracking-widest uppercase">Dominate the ranks. Prove your chaos.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 w-full">
                        <div className="w-12 h-12 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="w-full text-center py-20 glass-panel rounded-3xl border border-white/10">
                        <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-4">
                            <FaTrophy className="text-5xl text-gray-500 dark:text-gray-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No rankings yet</p>
                        <p className="text-gray-500 dark:text-gray-400">Be the first to complete problems and claim the top spot!</p>
                    </div>
                ) : (
                    <div className="w-full">
                        {/* Podium — top 3 */}
                        <div className="flex items-end justify-center w-full gap-2 sm:gap-6 mb-16 px-2">
                            {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((user) => {
                                const style = RANK_STYLES[user.rank] || {};
                                const isFirst = user.rank === 1;
                                const heightClass = isFirst ? 'h-40 sm:h-48' : user.rank === 2 ? 'h-32 sm:h-40' : 'h-24 sm:h-32';
                                
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => navigate(`/profile/${user._id}`)}
                                        className={`flex flex-col items-center cursor-pointer group transition-all hover:-translate-y-2 w-28 sm:w-40`}
                                    >
                                        <div className="flex flex-col items-center mb-4 relative z-10 w-full">
                                            <div className="absolute -top-6 text-3xl sm:-top-8 sm:text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20 transition-transform group-hover:scale-110">{style.icon}</div>
                                            <div className={`relative ${isFirst ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20 sm:w-24 sm:h-24'} rounded-full p-1 bg-gradient-to-br ${style.bg} inset-0 border-2 ${style.border} shadow-2xl ${style.glow} group-hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-shadow`}>
                                                <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center border-4 border-black">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className={`font-black text-white ${isFirst ? 'text-4xl' : 'text-3xl'} drop-shadow-md`}>
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Podium Column */}
                                        <div className={`w-full ${heightClass} rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b ${style.bg} border-t-2 border-l-2 border-r-2 ${style.border} flex flex-col items-center justify-start pt-4 sm:pt-6 relative overflow-hidden backdrop-blur-md`}>
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <p className="text-gray-900 dark:text-white font-black text-sm sm:text-base text-center w-full px-2 truncate relative z-10">{user.name}</p>
                                            <div className="flex items-center gap-1.5 mt-2 bg-black/20 dark:bg-black/40 px-3 py-1 rounded-full border border-white/5 relative z-10">
                                                <FaStar className="text-yellow-400 text-xs sm:text-sm drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                                                <span className="text-yellow-400 text-xs sm:text-sm font-black">{(user.xp ?? user.points)?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Rank list — 4th onwards */}
                        <div className="w-full flex flex-col gap-3 sm:gap-4">
                            {rest.map((user) => {
                                const isSelf = user._id === currentUserId;
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => navigate(`/profile/${user._id}`)}
                                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden relative group
                                            ${isSelf 
                                                ? 'bg-gradient-to-r from-green-500/20 to-purple-500/10 border border-green-500/50 shadow-[0_0_30px_rgba(74,222,128,0.2)]' 
                                                : 'bg-black/40 backdrop-blur-xl border border-white/10 hover:border-fuchsia-500/50 hover:bg-black/60 shadow-lg'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto relative z-10">
                                            <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-white/5 border border-white/10 shrink-0 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
                                                <span className="font-black text-white text-base sm:text-lg drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">#{user.rank}</span>
                                            </div>
                                            
                                            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-black flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/20">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-gray-600 dark:text-gray-300 text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-base sm:text-lg truncate flex items-center gap-2 ${isSelf ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'text-white'}`}>
                                                    {user.name} 
                                                    {isSelf && <span className="text-[10px] uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">You</span>}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide mt-0.5 truncate flex items-center gap-2">
                                                    <span className="flex items-center gap-1"><FaFire className="text-orange-500 text-xs" /> {user.stats?.problemsSolved || 0} Solved</span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className={user.stats?.accuracy >= 80 ? 'text-green-400' : 'text-gray-400'}>{user.stats?.accuracy || 0}% Accuracy</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-6 mt-4 sm:mt-0 w-full sm:w-auto pl-16 sm:pl-0">
                                            {user.streak > 0 && (
                                                <div className="flex flex-row sm:flex-col items-center sm:justify-center gap-2 sm:gap-0 bg-orange-50 dark:bg-orange-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-orange-200 dark:border-orange-500/20 min-w-[70px]">
                                                    <div className="flex items-center gap-1.5">
                                                        <FaFire className="text-orange-500 dark:text-orange-400 text-sm sm:text-base animate-pulse" />
                                                        <span className="text-orange-600 dark:text-orange-400 font-black text-sm sm:text-base">{user.streak}</span>
                                                    </div>
                                                    <span className="text-[9px] sm:text-[10px] text-orange-600/70 dark:text-orange-400/70 font-bold uppercase tracking-widest hidden sm:block mt-0.5">Streak</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0 bg-gray-50 dark:bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-200 dark:border-white/10 min-w-[100px] ml-auto sm:ml-0">
                                                <div className="flex items-center gap-1.5">
                                                    <FaStar className="text-yellow-500 dark:text-yellow-400 text-sm sm:text-base drop-shadow-sm" />
                                                    <span className="text-gray-900 dark:text-white font-black text-sm sm:text-base">{(user.xp ?? user.points)?.toLocaleString() || 0}</span>
                                                </div>
                                                <span className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest hidden sm:block mt-0.5">Total XP</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
