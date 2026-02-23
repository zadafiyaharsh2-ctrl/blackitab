import { useTheme } from '../context/ThemeContext';
import {
  FaSuitcase,
  FaFileAlt,
  FaLaptopCode,
  FaBell,
  FaUserTie,
  FaCheckCircle,
  FaSearch,
  FaBuilding,
  FaRobot,
  FaClipboardList,
  FaVideo,
  FaCode
} from 'react-icons/fa';

const Jobs = () => {
  const { isDark } = useTheme();

  const jobFeatures = [
    {
      icon: FaBell,
      title: 'Smart Job Notifications',
      description: 'Never miss an opportunity. Get instant, personalized notifications for jobs that match your skills and career goals. Apply with a single click directly through our platform.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaFileAlt,
      title: 'AI Resume Builder',
      description: 'Stop writing resumes from scratch. Our system automatically generates a professional resume based on your actual activity on the platform—courses completed, projects built, and skills mastered.',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FaUserTie,
      title: 'Recruiter Matching',
      description: 'Let the jobs come to you. Our AI analyzes your profile and matches you with recruiters looking for your exact skillset, ensuring you\'re always considered for the most relevant roles.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: FaLaptopCode,
      title: 'Integrated Online Assessments',
      description: 'Prove your skills instantly. Take technical assessments directly on the platform. Recruiters can assign coding challenges, quizzes, and aptitude tests to verify your expertise.',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const assessmentFeatures = [
    {
      icon: FaCode,
      title: 'Coding Challenges',
      description: 'Real-time coding environments with test cases'
    },
    {
      icon: FaVideo,
      title: 'Proctored Environment',
      description: 'Secure, anti-cheat monitoring for fair testing'
    },
    {
      icon: FaClipboardList,
      title: 'Auto-Grading',
      description: 'Instant results and detailed performance reports'
    },
    {
      icon: FaRobot,
      title: 'AI Performance Analysis',
      description: 'Deep insights into candidate problem-solving approach'
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
            The Advanced Career & Recruitment Portal is currently under development.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-violet-900/40 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 border-blue-200'} rounded-3xl p-8 md:p-12 border backdrop-blur-md shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <FaSuitcase className="text-4xl text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  Career Launchpad
                </h1>
                <p className={`text-lg ${isDark ? 'text-blue-300' : 'text-blue-600'} font-semibold mt-1`}>
                  Your Direct Path from Learning to Earning
                </p>
              </div>
            </div>

            <p className={`text-xl ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-8 leading-relaxed max-w-4xl`}>
              More than just a job board. We bridge the gap between your skills and your dream career.
              Our platform tracks your learning journey, builds your resume automatically, and connects you
              directly with recruiters who are looking for exactly what you have to offer.
            </p>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobFeatures.map((feature, index) => {
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

      {/* Resume Builder Showcase */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-r from-green-900/30 to-teal-900/30 border-green-700/50' : 'bg-gradient-to-r from-green-50 to-teal-50 border-green-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-6">
            <FaFileAlt className="text-4xl text-green-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
              Dynamic Resume Generation
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'} text-lg mb-6 leading-relaxed`}>
                Your resume shouldn't be a static document. Our system dynamically updates your profile based on
                your real-time achievements on the platform.
              </p>
              <ul className="space-y-4">
                <li className={`flex items-center gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaCheckCircle className="text-green-500" />
                  <span><strong>Verified Skills:</strong> Only skills you've proven through tests are listed.</span>
                </li>
                <li className={`flex items-center gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaCheckCircle className="text-green-500" />
                  <span><strong>Project Portfolio:</strong> Automatically links projects you've built in our IDE.</span>
                </li>
                <li className={`flex items-center gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaCheckCircle className="text-green-500" />
                  <span><strong>Learning Path:</strong> Showcases courses and certifications you've completed.</span>
                </li>
              </ul>
            </div>

            {/* Resume Visual */}
            <div className={`${isDark ? 'bg-white' : 'bg-gray-100'} rounded-lg p-6 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500`}>
              <div className="flex items-center gap-4 mb-4 border-b pb-4 border-gray-200">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-50 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-500 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-gray-300 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
                <div className="h-3 w-4/6 bg-gray-300 rounded"></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">React</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Node.js</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Python</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Assessment System */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-700/50' : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-8">
            <FaLaptopCode className="text-4xl text-orange-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
              Integrated Assessment System
            </h2>
          </div>

          <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'} text-lg mb-8 max-w-3xl`}>
            Recruiters can evaluate candidates instantly with our built-in assessment tools. No need for
            external platforms—everything happens right here.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assessmentFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200'} text-center hover:shadow-lg transition-shadow`}>
                  <div className="w-14 h-14 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center mb-4 text-orange-500">
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className={`font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-2`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center">
        <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 md:p-12 border backdrop-blur-md shadow-xl`}>
          <FaBuilding className={`text-5xl ${isDark ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-4`} />
          <h2 className={`text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-4`}>
            Your Career Starts Here
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto leading-relaxed`}>
            Whether you're looking for your first internship or your next big role, we provide the tools
            to showcase your true potential to the world's top companies.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg">
            Build Your Profile Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
