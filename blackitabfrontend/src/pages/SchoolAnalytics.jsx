import { useTheme } from '../context/useTheme';
import { 
  FaSchool, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaChartPie, 
  FaBrain, 
  FaLock, 
  FaUsers, 
  FaExclamationTriangle,
  FaLightbulb,
  FaChartLine
} from 'react-icons/fa';

const SchoolAnalytics = () => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: FaUserGraduate,
      title: 'Student Performance Insights',
      description: 'Students can see exactly where they stand within their institute. Get your school-wide rank, identify your personal weak topics, and compare your progress with peers to stay motivated.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaChalkboardTeacher,
      title: 'Teacher Command Center',
      description: 'Teachers get a bird\'s-eye view of their entire class. Access detailed analytics for every student, monitor attendance and activity, and understand the collective learning health of each division.',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FaBrain,
      title: 'ML-Powered Behavior Analysis',
      description: 'Our advanced Machine Learning algorithms analyze student activity patterns on the platform to understand learning behaviors, focus levels, and engagement, providing deeper insights than just test scores.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: FaChartPie,
      title: 'Division-Level Weakness Heatmap',
      description: 'Identify systemic gaps in understanding. If 60% of Division A is weak in "Schema Design", the system alerts the teacher immediately so they can schedule a revision session or assign targeted homework.',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
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
            The School Analytics module is currently under development.
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
                <FaSchool className="text-4xl text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  Institutional Analytics
                </h1>
                <p className={`text-lg ${isDark ? 'text-indigo-300' : 'text-indigo-600'} font-semibold mt-1`}>
                  Connecting Classrooms with Data-Driven Insights
                </p>
              </div>
            </div>
            
            <p className={`text-xl ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-8 leading-relaxed max-w-4xl`}>
              A comprehensive ecosystem connecting students, teachers, and institutes. 
              By using a unique <strong>Institute Code</strong>, we unlock powerful analytics that help 
              teachers take timely action and students understand their standing in the school.
            </p>
          </div>
        </div>
      </div>

      {/* Access Mechanism */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border backdrop-blur-md text-center`}>
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <FaLock className="text-2xl text-gray-900 dark:text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-4`}>
            Secure Institute Access
          </h2>
          <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto text-lg`}>
            Students gain access to their school's private dashboard by entering a unique 
            <strong> Institute Code</strong> provided by their administration. This links their profile 
            to their specific division and batch, enabling personalized school-level tracking.
          </p>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
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

      {/* Teacher Action Example Section */}
      <div className="max-w-7xl mx-auto">
        <div className={`${isDark ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-700/50' : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-6">
            <FaLightbulb className="text-3xl text-orange-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
              Actionable Insights for Teachers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'} text-lg mb-6 leading-relaxed`}>
                We don't just show data; we prompt action. Our system aggregates student performance at the division level 
                to highlight critical learning gaps that need immediate classroom attention.
              </p>
              <ul className="space-y-4">
                <li className={`flex items-start gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaChartLine className="text-green-500 text-xl mt-1" />
                  <span><strong>Real-time Monitoring:</strong> See which students are active and what topics they are studying right now.</span>
                </li>
                <li className={`flex items-start gap-3 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                  <FaUsers className="text-blue-500 text-xl mt-1" />
                  <span><strong>Division Comparison:</strong> Compare performance across different batches (e.g., Div A vs. Div B).</span>
                </li>
              </ul>
            </div>

            {/* Example Card */}
            <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white'} rounded-xl p-6 border ${isDark ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200'} shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300`}>
              <div className="flex items-center gap-2 mb-4 text-red-500 font-bold uppercase text-sm tracking-wide">
                <FaExclamationTriangle /> Critical Alert
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-2`}>
                Topic Weakness Detected: Division A
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 dark:bg-gray-700">
                <div className="bg-red-500 h-4 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600'} mb-4`}>
                <strong>60% of students</strong> in Division A are failing questions related to <strong>"Database Schema Design"</strong>.
              </p>
              <button className="w-full py-2 bg-red-500 hover:bg-red-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors">
                Schedule Revision Class
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolAnalytics;
