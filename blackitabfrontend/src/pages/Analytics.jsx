import { useTheme } from '../context/ThemeContext';
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaLightbulb, 
  FaRoad, 
  FaVideo, 
  FaBook, 
  FaTasks, 
  FaChartPie,
  FaArrowRight,
  FaBrain,
  FaCheckCircle
} from 'react-icons/fa';

const Analytics = () => {
  const { isDark } = useTheme();

  const analyticsFeatures = [
    {
      icon: FaChartLine,
      title: 'Detailed Progress Tracking',
      description: 'Visualize your learning journey with comprehensive graphs and metrics. Track your daily activity, topic completion rates, and skill mastery over time. See exactly how much you\'ve improved and where you stand in your goals.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaExclamationTriangle,
      title: 'Weakness Identification',
      description: 'Our AI analyzes your performance in quizzes and practice problems to pinpoint specific weak areas. It doesn\'t just say "Math is weak"—it identifies that "Calculus Chain Rule" is the specific bottleneck holding you back.',
      color: 'red',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      icon: FaLightbulb,
      title: 'Smart Suggestions',
      description: 'Get actionable, personalized advice on how to improve. Instead of generic tips, receive specific strategies based on your learning style and error patterns to turn your weaknesses into strengths.',
      color: 'yellow',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      icon: FaRoad,
      title: 'Personalized Learning Paths',
      description: 'Don\'t just know what to learn—know HOW to learn it. We generate custom learning paths that combine the perfect mix of theory, video tutorials, and practice problems to master any concept efficiently.',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const learningPathSteps = [
    {
      icon: FaVideo,
      title: '1. Watch Targeted Videos',
      description: 'Start with concise video explanations that address your specific knowledge gaps, curated from top educators.'
    },
    {
      icon: FaBook,
      title: '2. Review Core Theory',
      description: 'Solidify your understanding with focused reading materials that explain the "why" and "how" behind the concepts.'
    },
    {
      icon: FaTasks,
      title: '3. Solve Adaptive Problems',
      description: 'Apply what you\'ve learned with practice questions that start easy and gradually increase in difficulty as you master the topic.'
    }
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
            Advanced analytics features are currently under development.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-br from-indigo-900/40 via-blue-900/40 to-cyan-900/40 border-indigo-700/50' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-indigo-200'} rounded-3xl p-8 md:p-12 border backdrop-blur-md shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg">
                <FaChartPie className="text-4xl text-white" />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Advanced Performance Analytics
                </h1>
                <p className={`text-lg ${isDark ? 'text-indigo-300' : 'text-indigo-600'} font-semibold mt-1`}>
                  Data-Driven Insights to Accelerate Your Learning
                </p>
              </div>
            </div>
            
            <p className={`text-xl ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-8 leading-relaxed max-w-4xl`}>
              Stop guessing what to study next. Our advanced analytics engine breaks down your performance 
              data to show you exactly what you know, what you don't, and the fastest path to mastery.
            </p>
          </div>
        </div>
      </div>

      {/* Core Analytics Features */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="text-3xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                      {feature.title}
                    </h3>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-lg leading-relaxed`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Paths Detail Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-8">
            <FaRoad className="text-4xl text-green-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your Personalized Path to Mastery
            </h2>
          </div>

          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-lg mb-8 max-w-3xl`}>
            When our analytics identify a weakness, we don't just alert you—we build a bridge to fix it. 
            Here's how our intelligent system constructs your custom learning path:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting Line (Desktop) */}
            <div className={`hidden md:block absolute top-1/2 left-0 w-full h-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} -translate-y-1/2 z-0`}></div>

            {learningPathSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className={`relative z-10 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg text-center h-full flex flex-col items-center`}>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 text-white shadow-md`}>
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                    {step.title}
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analytics;

