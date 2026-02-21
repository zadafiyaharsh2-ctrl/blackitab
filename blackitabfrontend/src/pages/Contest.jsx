import { useTheme } from '../context/useTheme';
import { 
  FaTrophy, 
  FaChartLine, 
  FaCode, 
  FaGlobe, 
  FaMedal, 
  FaClock, 
  FaUserFriends, 
  FaRocket,
  FaStar,
  FaShieldAlt
} from 'react-icons/fa';

const Contest = () => {
  const { isDark } = useTheme();

  const contestFeatures = [
    {
      icon: FaGlobe,
      title: 'Global Competitive Arena',
      description: 'Join thousands of developers worldwide in real-time coding battles. Test your algorithmic skills against the best minds and see where you stand on the global stage.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaChartLine,
      title: 'Dynamic Rating System',
      description: 'Earn your rank through a sophisticated ELO-based rating system. Your rating updates after every contest based on your performance relative to other participants and the difficulty of problems solved.',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FaTrophy,
      title: 'Weekly Championships',
      description: 'Participate in regularly scheduled contests with varying difficulty levels. From beginner-friendly rounds to elite grandmaster challenges, there\'s a competition for every skill level.',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: FaCode,
      title: 'Post-Contest Analysis',
      description: 'Access detailed editorials, optimal solutions, and performance analytics immediately after the contest. Understand what you missed and learn how to solve problems more efficiently.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const ratingTiers = [
    { name: 'Grandmaster', range: '2400+', color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'Master', range: '2100-2399', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Expert', range: '1900-2099', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Specialist', range: '1600-1899', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { name: 'Pupil', range: '1400-1599', color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Newbie', range: '0-1399', color: 'text-gray-500', bg: 'bg-gray-500/10' },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Coming Soon Banner */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className={`${isDark ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-700/50' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'} rounded-xl p-4 border backdrop-blur-md text-center`}>
          <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'} mb-1 flex items-center justify-center gap-2`}>
            🚀 Coming Soon!
          </h2>
          <p className={`${isDark ? 'text-yellow-200' : 'text-yellow-700'} font-medium`}>
            The Competitive Programming Arena is currently under development.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-br from-red-900/40 via-orange-900/40 to-yellow-900/40 border-red-700/50' : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-red-200'} rounded-3xl p-8 md:p-12 border backdrop-blur-md shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg">
                <FaTrophy className="text-4xl text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  Competitive Arena
                </h1>
                <p className={`text-lg ${isDark ? 'text-red-300' : 'text-red-600'} font-semibold mt-1`}>
                  Prove Your Skills. Climb the Ranks. Become a Legend.
                </p>
              </div>
            </div>
            
            <p className={`text-xl ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-8 leading-relaxed max-w-4xl`}>
              Step into the ultimate coding battleground. Participate in high-stakes contests, solve complex algorithmic 
              challenges under pressure, and earn your place on the global leaderboard. Our sophisticated rating system 
              ensures you're always competing against worthy adversaries.
            </p>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contestFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="text-3xl text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-3`}>
                      {feature.title}
                    </h3>
                    <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'} text-lg leading-relaxed`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating System Explained */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-8">
            <FaShieldAlt className="text-4xl text-blue-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
              The Rating System
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'} text-lg mb-6 leading-relaxed`}>
                Our rating system is designed to accurately reflect your skill level. You start with a base rating, 
                and after every contest, your rating changes based on:
              </p>
              <ul className="space-y-4 mb-8">
                <li className={`flex items-center gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaCheckCircle className="text-green-500" />
                  <span>Your rank in the contest</span>
                </li>
                <li className={`flex items-center gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaCheckCircle className="text-green-500" />
                  <span>The ratings of your opponents</span>
                </li>
                <li className={`flex items-center gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaCheckCircle className="text-green-500" />
                  <span>The difficulty of problems solved</span>
                </li>
              </ul>
              <p className={`${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} italic`}>
                "Consistency is key. Regular participation and steady improvement are rewarded over lucky spikes."
              </p>
            </div>

            {/* Rating Tiers Visualization */}
            <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-4 text-center`}>
                Rating Tiers
              </h3>
              <div className="space-y-3">
                {ratingTiers.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-500/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <FaMedal className={`${tier.color}`} />
                      <span className={`font-bold ${tier.color}`}>{tier.name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${tier.bg} ${tier.color}`}>
                      {tier.range}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center">
        <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 md:p-12 border backdrop-blur-md shadow-xl`}>
          <FaRocket className={`text-5xl ${isDark ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-4`} />
          <h2 className={`text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-4`}>
            Ready to Compete?
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto leading-relaxed`}>
            Prepare yourself for the ultimate challenge. Practice problems, learn algorithms, and get ready 
            to make your mark on the leaderboard when the arena opens.
          </p>
          <button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg">
            Start Practicing Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Icon for the list
const FaCheckCircle = ({ className }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

export default Contest;
