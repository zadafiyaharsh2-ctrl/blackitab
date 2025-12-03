import { useTheme } from '../context/ThemeContext';
import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaBrain, 
  FaExclamationTriangle,
  FaLightbulb,
  FaDollarSign,
  FaBookOpen,
  FaRobot,
  FaChartLine,
  FaGraduationCap
} from 'react-icons/fa';

const Social = () => {
  const { isDark } = useTheme();

  const coreFeatures = [
    {
      icon: FaBookOpen,
      title: 'Post Educational Content & Courses',
      description: 'Create and share any type of educational content—from simple study notes to comprehensive video courses. Whether you\'re a student sharing your knowledge or a professional educator, our platform supports all formats including videos, PDFs, presentations, and interactive materials.',
      gradient: 'from-blue-500 to-cyan-500',
      color: 'blue'
    },
    {
      icon: FaDollarSign,
      title: 'Monetize Your Content',
      description: 'Teachers have two ways to earn: Create premium paid courses with your own pricing, or post free content and earn revenue through advertisements. With free content, you reach a wider audience while we share ad revenue with you based on views and engagement. Choose the model that works best for you—or use both!',
      gradient: 'from-green-500 to-emerald-500',
      color: 'green'
    },
    {
      icon: FaExclamationTriangle,
      title: 'AI Identifies Student Mistakes',
      description: 'Our intelligent AI system analyzes student quiz results, assignment submissions, and practice problems to identify exactly where students are making mistakes. Get detailed reports showing common error patterns, misconceptions, and challenging topics that need your attention.',
      gradient: 'from-red-500 to-orange-500',
      color: 'red'
    },
    {
      icon: FaLightbulb,
      title: 'AI Suggests Topics to Add',
      description: 'Based on student questions, performance gaps, and learning patterns, our AI recommends specific topics and subtopics you should add to your courses. Stay ahead by understanding what students need before they even ask for it.',
      gradient: 'from-purple-500 to-pink-500',
      color: 'purple'
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
            This feature is currently under development and will be available soon.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-200'} rounded-3xl p-8 md:p-12 border backdrop-blur-md shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <FaUsers className="text-4xl text-white" />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Social Learning Platform
                </h1>
                <p className={`text-lg ${isDark ? 'text-blue-300' : 'text-blue-600'} font-semibold mt-1`}>
                  Share, Teach, and Improve with AI Intelligence
                </p>
              </div>
            </div>
            
            <p className={`text-xl ${isDark ? 'text-gray-200' : 'text-gray-700'} leading-relaxed max-w-4xl`}>
              Our platform empowers both students and teachers. Students can share educational content freely, 
              while teachers can build, sell, and continuously improve their courses with AI-powered insights 
              that identify student struggles and recommend content improvements.
            </p>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            What Our Platform Offers
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Four powerful features designed to revolutionize how educational content is created, shared, and improved
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
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

      {/* How AI Helps Teachers Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-700/50' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-6">
            <FaRobot className="text-4xl text-purple-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              How AI Helps Teachers Improve Their Courses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <FaExclamationTriangle className="text-2xl text-red-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 text-xl`}>
                    1. AI Analyzes Student Mistakes
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                    Every time students take quizzes, submit assignments, or solve problems, our AI tracks their mistakes. 
                    It identifies patterns—which questions are answered incorrectly most often, which concepts cause confusion, 
                    and where students get stuck.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <FaChartLine className="text-2xl text-purple-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 text-xl`}>
                    2. You Get Detailed Reports
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                    Teachers receive comprehensive reports showing exactly where students are struggling. 
                    See which topics have the highest error rates, common misconceptions, and specific areas 
                    that need better explanation or additional examples.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <FaLightbulb className="text-2xl text-yellow-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 text-xl`}>
                    3. AI Suggests Topics to Add
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                    Based on the mistakes and gaps identified, AI recommends specific topics, subtopics, and 
                    supplementary materials you should add to your course. It might suggest adding more examples, 
                    prerequisite content, or advanced applications students are asking about.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FaGraduationCap className="text-2xl text-green-500" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2 text-xl`}>
                    4. Continuous Improvement
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                    As you update your course based on AI recommendations, the system continues monitoring student 
                    performance. This creates a continuous improvement cycle where your courses get better over time, 
                    leading to higher student success rates and better reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Teachers Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-6">
            <FaChalkboardTeacher className="text-4xl text-green-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              For Teachers: Two Ways to Earn Money
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Option 1: Paid Courses */}
            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FaDollarSign className="text-2xl text-blue-500" />
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  1. Sell Premium Courses
                </h3>
              </div>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-3`}>
                <p className="leading-relaxed">
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>Set Your Own Price:</strong> Create 
                  premium courses and charge whatever you think is fair—$10, $50, $200, you decide!
                </p>
                <p className="leading-relaxed">
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>Direct Earnings:</strong> Students 
                  pay upfront, and you receive your earnings directly. Build a sustainable teaching business.
                </p>
                <p className="leading-relaxed">
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>Best For:</strong> Comprehensive courses, 
                  specialized topics, professional certifications, and in-depth training programs.
                </p>
              </div>
            </div>

            {/* Option 2: Free Content with Ads */}
            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FaChartLine className="text-2xl text-green-500" />
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  2. Post Free Content (Earn from Ads)
                </h3>
              </div>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} space-y-3`}>
                <p className="leading-relaxed">
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>Reach More Students:</strong> Make 
                  your content free and accessible to everyone. No payment barriers means broader audience reach.
                </p>
                <p className="leading-relaxed">
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>Earn from Advertisements:</strong> We 
                  display relevant educational ads on your content and share the revenue with you based on views and engagement.
                </p>
                <p className="leading-relaxed">
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>Best For:</strong> YouTube-style content, 
                  quick tutorials, viral educational content, and building a large following.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className={`${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'} rounded-lg p-6 border`}>
            <h4 className={`font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-3 text-lg`}>
              💡 Pro Tip: Use Both Strategies!
            </h4>
            <p className={`${isDark ? 'text-blue-200' : 'text-blue-600'} leading-relaxed`}>
              Many successful educators use both models: Free content to attract students and build trust, 
              then premium courses for deeper, more comprehensive training. Start with free content to grow 
              your audience, then create paid courses for your most engaged followers!
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center">
        <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 md:p-12 border backdrop-blur-md shadow-xl`}>
          <FaBrain className={`text-5xl ${isDark ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-4`} />
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Ready to Transform Education?
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto leading-relaxed`}>
            Whether you want to share knowledge with fellow students or build a teaching business with AI-powered 
            insights, our platform has everything you need.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg">
              Start Creating Content
            </button>
            <button className={`${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'} font-bold py-4 px-8 rounded-xl border ${isDark ? 'border-gray-600' : 'border-gray-300'} shadow-lg hover:shadow-xl transition-all duration-300 text-lg`}>
              Sell Your First Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;
