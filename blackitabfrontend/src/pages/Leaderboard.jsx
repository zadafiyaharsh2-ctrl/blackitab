import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaFire, FaStar, FaMedal, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';
import { mockLeaderboard } from '../data/mockLeaderboardData';

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
                console.log("Empty leaderboard from backend, applying intelligent fallback data.");
                setUsers(mockLeaderboard);
            }
        } catch (err) {
            console.error('Leaderboard error, falling back to mock data:', err);
            setUsers(mockLeaderboard);
        } finally {
            setLoading(false);
        }
    };

    const topThree = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-transparent p-4 md:p-8">
            {/* Header */}
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FaTrophy className="text-yellow-400" /> Leaderboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Top learners ranked by XP points</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <FaSpinner className="animate-spin text-blue-500 text-3xl" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <FaTrophy className="text-5xl mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No rankings yet</p>
                        <p className="text-sm">Complete problems and activities to earn XP!</p>
                    </div>
                ) : (
                    <>
                        {/* Podium — top 3 */}
                        <div className="flex items-end justify-center gap-4 mb-10">
                            {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((user) => {
                                const style = RANK_STYLES[user.rank] || {};
                                const isFirst = user.rank === 1;
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => navigate(`/profile/${user._id}`)}
                                        className={`flex flex-col items-center cursor-pointer group transition-all hover:-translate-y-1 ${isFirst ? 'order-2' : user.rank === 2 ? 'order-1' : 'order-3'}`}
                                    >
                                        <div className={`relative mb-3 ${isFirst ? 'w-24 h-24' : 'w-18 h-18'}`}>
                                            <div className={`${isFirst ? 'w-24 h-24' : 'w-16 h-16'} rounded-full bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center border-2 ${style.border} shadow-lg ${style.glow} overflow-hidden`}>
                                                {user.profileImage ? (
                                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className={`font-bold text-gray-700 dark:text-white ${isFirst ? 'text-3xl' : 'text-xl'}`}>
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="absolute -top-2 -right-2 text-xl">{style.icon}</span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-bold text-sm text-center max-w-[80px] truncate">{user.name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <FaStar className="text-yellow-400 text-xs" />
                                            <span className="text-yellow-400 text-xs font-bold">{user.points?.toLocaleString() || 0} XP</span>
                                        </div>
                                        {user.streak > 0 && (
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <FaFire className="text-orange-400 text-xs" />
                                                <span className="text-orange-400 text-xs">{user.streak}d</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Rank list — 4th onwards */}
                        <div className="space-y-3">
                            {rest.map((user) => {
                                const isSelf = user._id === currentUserId;
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => navigate(`/profile/${user._id}`)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg
                      ${isSelf
                                                ? 'bg-blue-500/10 border-blue-500/40 dark:border-blue-500/40'
                                                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
                                            }`}
                                    >
                                        <span className="w-8 text-center font-bold text-gray-400 text-sm">#{user.rank}</span>
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-gray-600 dark:text-gray-300 text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${isSelf ? 'text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                                {user.name} {isSelf && <span className="text-xs ml-1">(you)</span>}
                                            </p>
                                            <p className="text-xs text-gray-400">{user.followerCount || 0} followers</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            {user.streak > 0 && (
                                                <span className="flex items-center gap-1 text-orange-400 font-medium">
                                                    <FaFire className="text-xs" />{user.streak}d
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                                <FaStar className="text-xs" />{user.points?.toLocaleString() || 0}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
