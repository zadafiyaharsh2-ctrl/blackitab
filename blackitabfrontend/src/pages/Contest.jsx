import { motion } from 'framer-motion';
import { 
  FaTrophy, 
  FaChartLine, 
  FaCode, 
  FaGlobe, 
  FaMedal, 
  FaShieldAlt,
  FaRocket
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const Contest = () => {
  const navigate = useNavigate();

  const contestFeatures = [
    {
      icon: FaGlobe,
      title: 'Global Competitive Arena',
      description: 'Join thousands of developers worldwide in real-time coding battles. Test your algorithmic skills against the best minds and see where you stand.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
    },
    {
      icon: FaChartLine,
      title: 'Dynamic Rating System',
      description: 'Earn your rank through a sophisticated ELO-based rating system. Your rating updates after every contest based on your performance relative to others.',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
    },
    {
      icon: FaTrophy,
      title: 'Weekly Championships',
      description: 'Participate in regularly scheduled contests with varying difficulty levels. From beginner rounds to elite grandmaster challenges.',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    },
    {
      icon: FaCode,
      title: 'Post-Contest Analysis',
      description: 'Access detailed editorials, optimal solutions, and performance analytics immediately after the contest. Understand what you missed.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]'
    }
  ];

  const ratingTiers = [
    { name: 'Grandmaster', range: '2400+', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
    { name: 'Master', range: '2100-2399', color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30' },
    { name: 'Expert', range: '1900-2099', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' },
    { name: 'Specialist', range: '1600-1899', color: 'text-cyan-500', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    { name: 'Pupil', range: '1400-1599', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/30' },
    { name: 'Newbie', range: '0-1399', color: 'text-gray-500', bg: 'bg-gray-500/10 border-gray-500/30' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10 space-y-12"
      >
        {/* Coming Soon Banner */}
        <motion.div variants={itemVariants}>
          <div className="glass-panel border-yellow-500/30 rounded-2xl p-4 text-center shadow-[0_0_20px_rgba(234,179,8,0.15)] bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
            <h2 className="text-2xl font-bold text-yellow-500 mb-1 flex items-center justify-center gap-3">
              <span className="animate-bounce">🚀</span> Coming Soon!
            </h2>
            <p className="text-yellow-200/80 font-medium">
              The Competitive Programming Arena is currently being forged by our engineers.
            </p>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <div className="glass-panel border-white/5 rounded-[2rem] p-8 md:p-12 shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden group">
            {/* Subtle internal shine */}
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="p-6 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.4)] transform group-hover:scale-105 transition-transform duration-500">
                <FaTrophy className="text-6xl text-white drop-shadow-md" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                  Competitive Arena
                </h1>
                <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 font-bold mb-6">
                  Prove Your Skills. Climb the Ranks. Become a Legend.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed max-w-3xl">
                  Step into the ultimate coding battleground. Participate in high-stakes contests, solve complex algorithmic 
                  challenges under pressure, and earn your place on the global leaderboard. Our sophisticated rating system 
                  ensures you're always competing against worthy adversaries.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contestFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="glass-panel border-white/5 rounded-2xl p-8 hover:bg-white/5 transition-all duration-300 group hover:-translate-y-1 hover:border-white/10"
              >
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.shadow} group-hover:scale-110 transition-transform duration-300 text-white shrink-0`}>
                    <Icon className="text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-glow transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Rating System */}
        <motion.div variants={itemVariants}>
          <div className="glass-panel border-blue-500/20 rounded-[2rem] p-8 md:p-12 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 text-blue-400">
                <FaShieldAlt className="text-3xl" />
              </div>
              <h2 className="text-4xl font-bold text-white">The Rating System</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Our rating system is designed to accurately reflect your skill level. You start with a base rating, 
                  and after every contest, your rating changes based on:
                </p>
                <ul className="space-y-6 mb-8">
                  {[
                    "Your rank in the contest",
                    "The ratings of your opponents",
                    "The difficulty of problems solved"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-4 text-gray-300 text-lg font-medium">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
                        ✓
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
                <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <p className="text-gray-500 italic">
                    "Consistency is key. Regular participation and steady improvement are rewarded over lucky spikes."
                  </p>
                </div>
              </div>

              {/* Tiers */}
              <div className="bg-black/40 rounded-3xl p-8 border border-white/5 custom-scrollbar">
                <h3 className="text-2xl font-bold text-white mb-6 text-center text-glow">Rating Tiers</h3>
                <div className="space-y-4">
                  {ratingTiers.map((tier, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                      <div className="flex items-center gap-4">
                        <FaMedal className={`text-xl ${tier.color} group-hover:scale-125 transition-transform`} />
                        <span className={`text-lg font-bold ${tier.color} tracking-wide`}>{tier.name}</span>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-mono font-bold border ${tier.bg} ${tier.color} shadow-sm`}>
                        {tier.range}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="pb-12 text-center">
          <div className="glass-panel border-white/5 rounded-[2rem] p-10 md:p-16 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/10 z-0"></div>
            <FaRocket className="text-6xl text-red-500 mx-auto mb-6 relative z-10 group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <h2 className="text-4xl font-black text-white mb-4 relative z-10 text-glow">
              Ready to Compete?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed relative z-10">
              Prepare yourself for the ultimate challenge. Practice problems, learn algorithms, and get ready 
              to make your mark on the leaderboard when the arena opens.
            </p>
            <button 
              onClick={() => navigate('/problems')}
              className="relative z-10 bg-white hover:bg-gray-200 text-black font-bold py-4 px-10 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:scale-[1.05] text-lg uppercase tracking-wider"
            >
              Start Practicing Now
            </button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Contest;
