import { useTheme } from '../context/ThemeContext';
import { 
  FaCode, 
  FaLaptopCode, 
  FaPlay, 
  FaBug, 
  FaTerminal, 
  FaLayerGroup, 
  FaKeyboard,
  FaCheckDouble
} from 'react-icons/fa';

const IDE = () => {
  const { isDark } = useTheme();

  const ideFeatures = [
    {
      icon: FaLayerGroup,
      title: 'Multi-Language Support',
      description: 'Code in your preferred language. Our IDE supports C++, Java, Python, JavaScript, and more, with language-specific optimizations and latest compiler versions.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaTerminal,
      title: 'Real-Time Compilation',
      description: 'Experience lightning-fast execution. Our cloud-based compilers run your code instantly, providing immediate output and performance metrics (time & memory usage).',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: FaKeyboard,
      title: 'Intelligent Editor',
      description: 'Write code faster with smart autocomplete, syntax highlighting, bracket matching, and auto-indentation. It feels just like your favorite local VS Code environment.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: FaBug,
      title: 'Advanced Debugging',
      description: 'Don\'t just see errors—understand them. Our system highlights syntax errors in real-time and provides detailed stack traces to help you fix bugs quickly.',
      color: 'red',
      gradient: 'from-red-500 to-orange-500'
    }
  ];

  const supportedLanguages = [
    { name: 'C++', version: '17/20', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Java', version: '17 LTS', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Python', version: '3.10+', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'JavaScript', version: 'Node 18', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
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
            The Integrated Development Environment (IDE) is currently under development.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700' : 'bg-gradient-to-br from-gray-100 via-white to-gray-50 border-gray-300'} rounded-3xl p-8 md:p-12 border backdrop-blur-md shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl shadow-lg border border-gray-600">
                <FaLaptopCode className="text-4xl text-green-400" />
              </div>
              <div>
                <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Professional Online IDE
                </h1>
                <p className={`text-lg ${isDark ? 'text-green-400' : 'text-green-600'} font-semibold mt-1`}>
                  Code, Compile, and Run - Anytime, Anywhere.
                </p>
              </div>
            </div>
            
            <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-8 leading-relaxed max-w-4xl`}>
              A powerful, cloud-based coding environment designed for speed and reliability. 
              Whether you're solving algorithmic problems, building projects, or learning a new language, 
              our IDE provides the tools you need without any local setup.
            </p>

            {/* Language Badges */}
            <div className="flex flex-wrap gap-3">
              {supportedLanguages.map((lang, index) => (
                <div key={index} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'}`}>
                  <div className={`w-2 h-2 rounded-full ${lang.color.replace('text-', 'bg-')}`}></div>
                  <span className={`font-mono font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {lang.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${lang.bg} ${lang.color} font-bold`}>
                    {lang.version}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 border backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="text-3xl text-white" />
                  </div>
                  <div>
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

      {/* Workflow Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className={`${isDark ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'} rounded-2xl p-8 border backdrop-blur-md`}>
          <div className="flex items-center gap-3 mb-8">
            <FaCode className="text-4xl text-blue-500" />
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Seamless Coding Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
              <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-blue-500">
                <FaKeyboard className="text-3xl" />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                1. Write Code
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Use our intelligent editor with syntax highlighting and autocomplete.
              </p>
            </div>

            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                <FaPlay className="text-3xl ml-1" />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                2. Run & Test
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Execute against custom input or pre-defined test cases instantly.
              </p>
            </div>

            <div className={`${isDark ? 'bg-gray-800/60' : 'bg-white/90'} rounded-xl p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
              <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-4 text-purple-500">
                <FaCheckDouble className="text-3xl" />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                3. Submit
              </h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Get instant verdict (Accepted, Wrong Answer, TLE) and performance stats.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center">
        <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 md:p-12 border backdrop-blur-md shadow-xl`}>
          <FaTerminal className={`text-5xl ${isDark ? 'text-green-400' : 'text-green-600'} mx-auto mb-4`} />
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Start Coding in Seconds
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto leading-relaxed`}>
            No installation required. Access a full-featured coding environment directly from your browser.
          </p>
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-2 mx-auto">
            <FaPlay className="text-sm" /> Launch Playground
          </button>
        </div>
      </div>
    </div>
  );
};

export default IDE;
