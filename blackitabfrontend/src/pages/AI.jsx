// import { useTheme } from '../context/ThemeContext';
// import { 
//   FaRobot, 
//   FaBrain, 
//   FaCalendarAlt, 
//   FaGraduationCap, 
//   FaVideo,
//   FaBook,
//   FaChartLine,
//   FaUserGraduate,
//   FaClock,
//   FaLightbulb,
//   FaSearch,
//   FaTasks,
//   FaChalkboardTeacher
// } from 'react-icons/fa';

// const AI = () => {
//   const { isDark } = useTheme();

//   const aiFeatures = [
//     {
//       icon: FaBook,
//       title: 'Intelligent Theory Explanation',
//       description: 'Our AI doesn\'t just find theory—it understands it. Students can ask questions in natural language, and our AI will locate the most relevant concepts, break them down, and explain them in simple, easy-to-understand terms.',
//       benefits: [
//         'Natural language queries',
//         'Step-by-step explanations',
//         'Adaptive difficulty levels',
//         'Multi-format learning support'
//       ],
//       color: 'blue',
//       gradient: 'from-blue-500 to-cyan-500'
//     },
//     {
//       icon: FaCalendarAlt,
//       title: 'Smart Timetable Scheduler',
//       description: 'AI-powered scheduling that adapts to each student\'s learning pace, priorities, and goals. The system creates personalized study plans that optimize learning efficiency while preventing burnout.',
//       benefits: [
//         'Personalized study schedules',
//         'Adaptive difficulty pacing',
//         'Exam deadline tracking',
//         'Break time optimization'
//       ],
//       color: 'green',
//       gradient: 'from-green-500 to-emerald-500'
//     },
//     {
//       icon: FaGraduationCap,
//       title: 'Comprehensive Exam Preparation',
//       description: 'Transform exam preparation with AI that analyzes past papers, identifies patterns, and creates custom practice tests. Students receive targeted preparation materials based on their weak areas.',
//       benefits: [
//         'Pattern recognition from past exams',
//         'Weakness identification',
//         'Customized practice tests',
//         'Progress tracking & analytics'
//       ],
//       color: 'purple',
//       gradient: 'from-purple-500 to-pink-500'
//     },
//     {
//       icon: FaUserGraduate,
//       title: 'AI Avatar Teacher',
//       description: 'Meet your personal AI tutor—an interactive avatar that explains complex concepts using real-world examples, analogies, and visual aids. The avatar adapts its teaching style to match each student\'s learning preferences.',
//       benefits: [
//         'Visual learning with examples',
//         'Real-world analogies',
//         'Interactive Q&A sessions',
//         'Multiple explanation styles'
//       ],
//       color: 'orange',
//       gradient: 'from-orange-500 to-red-500'
//     },
//     {
//       icon: FaVideo,
//       title: 'Smart Video Navigation',
//       description: 'Revolutionary video intelligence that saves hours of watching time. Our AI analyzes video content and instantly jumps to the exact moment where your specific question is answered—no more scrubbing through hours of content.',
//       benefits: [
//         'Instant topic location',
//         'Timestamp-based navigation',
//         'Content summarization',
//         'Key moments highlighting'
//       ],
//       color: 'red',
//       gradient: 'from-red-500 to-rose-500'
//     },
//     {
//       icon: FaTasks,
//       title: 'Intelligent Problem Recommendation',
//       description: 'AI curates practice problems from our extensive problem bank, perfectly matched to your current skill level and learning objectives. As you improve, the difficulty automatically adjusts to keep you challenged.',
//       benefits: [
//         'Skill-matched problems',
//         'Adaptive difficulty',
//         'Topic-specific practice',
//         'Performance-based suggestions'
//       ],
//       color: 'indigo',
//       gradient: 'from-indigo-500 to-violet-500'
//     },
//     {
//       icon: FaChalkboardTeacher,
//       title: 'Smart Teacher Assignment',
//       description: 'When a student asks a question with no existing video coverage, our AI instantly identifies the gap. It selects the most appropriate teacher based on subject expertise and assigns them a task to create a video explanation. This ensures the platform\'s knowledge base grows dynamically to solve every student\'s doubt.',
//       benefits: [
//         'Automated gap detection',
//         'Expert teacher matching',
//         'On-demand content creation',
//         'Permanent solution for future students'
//       ],
//       color: 'teal',
//       gradient: 'from-teal-500 to-emerald-600'
//     }
//   ];

//   const platformAdvantages = [
//     {
//       icon: FaClock,
//       title: 'Save 60% of Study Time',
//       description: 'Smart features eliminate redundant learning'
//     },
//     {
//       icon: FaChartLine,
//       title: 'Improve Performance by 40%',
//       description: 'Personalized learning paths yield better results'
//     },
//     {
//       icon: FaLightbulb,
//       title: '24/7 AI Assistance',
//       description: 'Never wait for answers—learn at your own pace'
//     },
//     {
//       icon: FaSearch,
//       title: 'Context-Aware Learning',
//       description: 'AI understands your learning journey'
//     }
//   ];

//   return (
//     <div className="min-h-screen p-6">
//       {/* Hero Section */}
//       <div className="max-w-7xl mx-auto mb-12">
//         <div className={`${isDark ? 'bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-indigo-700/50' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200'} rounded-3xl p-8 md:p-12 border backdrop-blur-md shadow-2xl relative overflow-hidden`}>
//           {/* Animated background elements */}
//           <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          
//           <div className="relative z-10">
//             <div className="flex items-center gap-4 mb-6">
//               <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
//                 <FaBrain className="text-4xl text-gray-900 dark:text-white" />
//               </div>
//               <div>
//                 <h1 className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
//                   AI-Powered Learning Platform
//                 </h1>
//                 <p className={`text-lg ${isDark ? 'text-purple-300' : 'text-purple-600'} font-semibold mt-1`}>
//                   The Future of Intelligent Education
//                 </p>
//               </div>
//             </div>
            
//             <p className={`text-xl ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-8 leading-relaxed max-w-4xl`}>
//               Harness the power of advanced artificial intelligence to revolutionize how students learn. 
//               Our platform combines cutting-edge AI technology with proven educational methodologies to deliver 
//               a personalized, efficient, and engaging learning experience that adapts to every student's unique needs.
//             </p>

//             {/* Key Metrics */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {platformAdvantages.map((advantage, index) => {
//                 const Icon = advantage.icon;
//                 return (
//                   <div 
//                     key={index}
//                     className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/60' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-4 border ${isDark ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200'}`}
//                   >
//                     <Icon className={`text-2xl ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2`} />
//                     <h3 className={`font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} text-sm mb-1`}>
//                       {advantage.title}
//                     </h3>
//                     <p className={`text-xs ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
//                       {advantage.description}
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* AI Features Grid */}
//       <div className="max-w-7xl mx-auto mb-12">
//         <div className="text-center mb-10">
//           <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-4`}>
//             Comprehensive AI Capabilities
//           </h2>
//           <p className={`text-lg ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}>
//             Seven powerful AI features working together to create the ultimate learning companion
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {aiFeatures.map((feature, index) => {
//             const Icon = feature.icon;
//             return (
//               <div
//                 key={index}
//                 className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-6 border backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group`}
//               >
//                 {/* Feature Header */}
//                 <div className="flex items-start gap-4 mb-4">
//                   <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
//                     <Icon className="text-2xl text-gray-900 dark:text-white" />
//                   </div>
//                   <div className="flex-1">
//                     <h3 className={`text-xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-2`}>
//                       {feature.title}
//                     </h3>
//                     <p className={`${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'} leading-relaxed`}>
//                       {feature.description}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Benefits List */}
//                 <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200'}`}>
//                   <h4 className={`text-sm font-semibold ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} mb-3 uppercase tracking-wide`}>
//                     Key Benefits
//                   </h4>
//                   <ul className="grid grid-cols-2 gap-2">
//                     {feature.benefits.map((benefit, idx) => (
//                       <li 
//                         key={idx}
//                         className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}
//                       >
//                         <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${feature.gradient}`}></div>
//                         {benefit}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* How It Works Section */}
//       <div className="max-w-7xl mx-auto mb-12">
//         <div className={`${isDark ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'} rounded-2xl p-8 border backdrop-blur-md`}>
//           <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-6 text-center`}>
//             How Our AI Transforms Learning
//           </h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white/80'} rounded-xl p-6 text-center`}>
//               <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 text-gray-900 dark:text-white font-bold text-xl`}>
//                 1
//               </div>
//               <h3 className={`font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-2`}>
//                 Student Asks Question
//               </h3>
//               <p className={`text-sm ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
//                 Natural language processing understands the query context
//               </p>
//             </div>

//             <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white/80'} rounded-xl p-6 text-center`}>
//               <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-gray-900 dark:text-white font-bold text-xl`}>
//                 2
//               </div>
//               <h3 className={`font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-2`}>
//                 AI Analyzes & Locates
//               </h3>
//               <p className={`text-sm ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
//                 Searches through theory, videos, and problems for best match
//               </p>
//             </div>

//             <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white/80'} rounded-xl p-6 text-center`}>
//               <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 text-gray-900 dark:text-white font-bold text-xl`}>
//                 3
//               </div>
//               <h3 className={`font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-2`}>
//                 Delivers Personalized Answer
//               </h3>
//               <p className={`text-sm ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
//                 AI avatar explains with examples tailored to student's level
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Call to Action */}
//       <div className="max-w-4xl mx-auto text-center">
//         <div className={`${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-8 md:p-12 border backdrop-blur-md shadow-xl`}>
//           <FaRobot className={`text-5xl ${isDark ? 'text-blue-400' : 'text-blue-600'} mx-auto mb-4`} />
//           <h2 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'} mb-4`}>
//             Experience the Power of AI-Driven Education
//           </h2>
//           <p className={`text-lg ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} mb-6 max-w-2xl mx-auto`}>
//             Join thousands of students already benefiting from personalized AI assistance. 
//             Start your intelligent learning journey today.
//           </p>
//           <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg">
//             Start Learning with AI
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AI;

