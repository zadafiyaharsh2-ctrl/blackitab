import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaFire, FaStar, FaMedal, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';
const RANK_STYLES = {
    1: { bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/40', glow: 'shadow-yellow-500/20', icon: '🥇', badge: 'bg-yellow-500 text-black' },
    2: { bg: 'from-slate-400/20 to-gray-400/10', border: 'border-slate-400/40', glow: 'shadow-slate-400/20', icon: '🥈', badge: 'bg-slate-400 text-black' },
    3: { bg: 'from-amber-700/20 to-orange-800/10', border: 'border-amber-700/40', glow: 'shadow-amber-700/20', icon: '🥉', badge: 'bg-amber-700 text-white' },
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-4 md:p-8 relative overflow-hidden font-sans w-full max-w-full flex justify-center">
            {/* Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[5%] left-[10%] w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen" />
            </div>

            {/* Container forcing center */}
            <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
                {/* Header */}
                <div className="w-full flex flex-col items-center text-center mb-12 relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 top-1 p-3 rounded-full bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] mb-4">
                        <FaTrophy className="text-4xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Leaderboard</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mt-3 font-medium">Climb the ranks by solving problems and earning XP</p>
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
                                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden flex items-center justify-center border-4 border-gray-900 dark:border-black">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className={`font-black text-gray-700 dark:text-gray-300 ${isFirst ? 'text-4xl' : 'text-3xl'}`}>
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
                                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl glass-panel cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                                            ${isSelf 
                                                ? 'bg-blue-600/10 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' 
                                                : 'border border-white/10 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 shrink-0">
                                                <span className="font-black text-gray-500 dark:text-gray-400 text-base sm:text-lg">#{user.rank}</span>
                                            </div>
                                            
                                            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/10">
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-gray-600 dark:text-gray-300 text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-bold text-base sm:text-lg truncate flex items-center gap-2 ${isSelf ? 'text-blue-500 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {user.name} 
                                                    {isSelf && <span className="text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/30">You</span>}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide mt-0.5 truncate">
                                                    {user.stats?.problemsSolved || 0} Solved • {user.stats?.accuracy || 0}% Accuracy
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
