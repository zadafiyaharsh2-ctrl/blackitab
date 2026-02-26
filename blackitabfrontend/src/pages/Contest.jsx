import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaTrophy, FaChartLine, FaCode, FaGlobe, FaMedal, FaShieldAlt,
  FaRocket, FaClock, FaUsers, FaCalendarAlt, FaArrowRight
} from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

// Countdown hook
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setTimeLeft('Started!'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

function ContestCard({ contest, type }) {
  const navigate = useNavigate();
  const countdown = useCountdown(type === 'upcoming' ? contest.startTime : null);
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const durationH = Math.round((end - start) / 3600000);
  const qCount = contest.questions?.length || 0;

  const diffColors = {
    Beginner: 'text-green-400 bg-green-500/10 border-green-500/30',
    Intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    Advanced: 'text-red-400 bg-red-500/10 border-red-500/30',
  };
  const dc = diffColors[contest.difficultyLevel] || diffColors.Intermediate;

  return (
    <motion.div whileHover={{ y: -4 }}
      className="glass-panel border border-white/10 hover:border-white/20 rounded-2xl p-6 relative overflow-hidden group transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{contest.title}</h3>
          {contest.description && <p className="text-gray-400 text-sm line-clamp-2">{contest.description}</p>}
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${dc}`}>
          {contest.difficultyLevel || 'Intermediate'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
          <FaClock className="text-blue-400 mx-auto mb-1 text-sm" />
          <span className="text-white font-bold text-sm">{durationH}h</span>
          <span className="block text-[10px] text-gray-400 uppercase">Duration</span>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
          <FaCode className="text-emerald-400 mx-auto mb-1 text-sm" />
          <span className="text-white font-bold text-sm">{qCount}</span>
          <span className="block text-[10px] text-gray-400 uppercase">Questions</span>
        </div>
        <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
          <FaCalendarAlt className="text-purple-400 mx-auto mb-1 text-sm" />
          <span className="text-white font-bold text-xs">{start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span className="block text-[10px] text-gray-400 uppercase">Date</span>
        </div>
      </div>

      {type === 'upcoming' && countdown && (
        <div className="mb-4 text-center py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Starts in: </span>
          <span className="text-yellow-300 font-mono font-bold">{countdown}</span>
        </div>
      )}

      <button onClick={() => navigate(type === 'past' ? `/leaderboard` : `/problems`)}
        className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all ${
          type === 'upcoming'
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/20'
            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
        }`}>
        {type === 'upcoming' ? 'Register & Practice' : 'View Leaderboard'}
      </button>
    </motion.div>
  );
}

const Contest = () => {
  usePageTitle('Contests');
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchContests(); }, [tab]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/contests?status=${tab}&limit=20`);
      if (res.data.success) setContests(res.data.data);
    } catch { setContests([]); }
    setLoading(false);
  };

  const contestFeatures = [
    { icon: FaGlobe, title: 'Global Arena', description: 'Compete with developers worldwide in real-time coding battles.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: FaChartLine, title: 'ELO Rating', description: 'Earn your rank through a sophisticated rating system.', gradient: 'from-green-500 to-emerald-500' },
    { icon: FaTrophy, title: 'Weekly Challenges', description: 'From beginner rounds to grandmaster challenges.', gradient: 'from-yellow-500 to-orange-500' },
    { icon: FaCode, title: 'Post-Contest Analysis', description: 'Detailed editorials and performance analytics.', gradient: 'from-purple-500 to-pink-500' },
  ];

  const ratingTiers = [
    { name: 'Grandmaster', range: '2400+', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
    { name: 'Master', range: '2100-2399', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30' },
    { name: 'Expert', range: '1900-2099', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' },
    { name: 'Specialist', range: '1600-1899', color: 'text-cyan-500', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    { name: 'Pupil', range: '1400-1599', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/30' },
    { name: 'Newbie', range: '0-1399', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans pt-20">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-orange-600/15 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Hero */}
        <motion.div variants={itemVariants} className="glass-panel border-white/5 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="p-6 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.4)]">
              <FaTrophy className="text-6xl text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-black text-glow mb-3 tracking-tight">Contest Arena</h1>
              <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
                Test your skills against the best. Real-time competitive programming with ELO ratings.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex gap-2 justify-center">
          {['upcoming', 'active', 'past'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all ${
                tab === t
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}>
              {t}
            </button>
          ))}
        </motion.div>

        {/* Contests Grid */}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              Loading contests...
            </div>
          ) : contests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.map(c => <ContestCard key={c._id} contest={c} type={tab} />)}
            </div>
          ) : (
            <div className="text-center py-20 glass-panel rounded-2xl border border-white/5">
              <FaTrophy className="text-5xl text-gray-700 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-lg mb-2">No {tab} contests</p>
              <p className="text-gray-300 text-sm">{tab === 'upcoming' ? 'Check back soon — new contests are scheduled regularly!' : 'All caught up.'}</p>
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Why Compete?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contestFeatures.map((f, i) => (
              <div key={i} className="glass-panel border border-white/5 rounded-2xl p-6 text-center hover:border-white/20 transition-all group">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Rating Tiers */}
        <motion.div variants={itemVariants} className="glass-panel border border-white/5 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><FaShieldAlt className="text-purple-400" /> Rating Tiers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ratingTiers.map((tier, i) => (
              <div key={i} className={`p-4 rounded-xl border text-center ${tier.bg}`}>
                <FaMedal className={`text-xl mx-auto mb-2 ${tier.color}`} />
                <p className={`font-bold text-sm ${tier.color}`}>{tier.name}</p>
                <p className="text-[10px] font-mono text-gray-500">{tier.range}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="pb-12 text-center">
          <div className="glass-panel border-white/5 rounded-[2rem] p-10 md:p-16 relative overflow-hidden group">
            <FaRocket className="text-6xl text-red-500 mx-auto mb-6 relative z-10 group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <h2 className="text-4xl font-black text-white mb-4 relative z-10 text-glow">Ready to Compete?</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed relative z-10">
              Sharpen your skills with practice problems and get ready for the arena.
            </p>
            <button onClick={() => navigate('/problems')}
              className="relative z-10 bg-white hover:bg-gray-200 text-black font-bold py-4 px-10 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all transform hover:scale-[1.05] text-lg uppercase tracking-wider">
              Start Practicing Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Contest;
