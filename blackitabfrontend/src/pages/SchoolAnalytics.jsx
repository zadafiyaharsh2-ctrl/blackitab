import { motion } from 'framer-motion';
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

const SchoolAnalytics = () => {
  const features = [
    {
      icon: FaUserGraduate,
      title: 'Student Performance Insights',
      description: 'Students can see exactly where they stand within their institute. Get your school-wide rank, identify weak topics, and compare progress with peers.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
    },
    {
      icon: FaChalkboardTeacher,
      title: 'Teacher Command Center',
      description: 'Teachers get a bird\'s-eye view of their entire class. Access detailed analytics for every student, monitor activity, and understand learning health.',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
    },
    {
      icon: FaBrain,
      title: 'ML Behavior Analysis',
      description: 'Our algorithms analyze student activity patterns to understand learning behaviors, focus levels, and engagement, providing deep insights.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]'
    },
    {
      icon: FaChartPie,
      title: 'Division Heatmaps',
      description: 'Identify systemic gaps in understanding based on aggregate division performance. Pinpoint exact areas where the entire class struggles.',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] mix-blend-screen" />
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
              The School Analytics module is currently under development.
            </p>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <div className="glass-panel border-white/5 rounded-[2rem] p-8 md:p-12 shadow-[0_0_50px_rgba(99,102,241,0.1)] relative overflow-hidden group">
            {/* Subtle internal shine */}
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.4)] transform group-hover:scale-105 transition-transform duration-500">
                <FaSchool className="text-6xl text-white drop-shadow-md" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                  Institutional Analytics
                </h1>
                <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-bold mb-6">
                  Connecting Classrooms with Data-Driven Insights
                </p>
                <p className="text-lg text-gray-400 leading-relaxed max-w-3xl">
                  A comprehensive ecosystem connecting students, teachers, and institutes. 
                  By using a unique <strong>Institute Code</strong>, we unlock powerful analytics that help 
                  teachers take timely action and students understand their standing in the school.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Access Mechanism */}
        <motion.div variants={itemVariants}>
          <div className="glass-panel border-white/5 rounded-[2rem] p-10 text-center relative overflow-hidden group">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.4)] transform group-hover:rotate-12 transition-transform duration-300">
              <FaLock className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 text-glow">
              Secure Institute Access
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
              Students gain access to their school's private dashboard by entering a unique 
              <strong className="text-white"> Institute Code</strong> provided by their administration. This links their profile 
              to their specific division and batch, enabling personalized school-level tracking.
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
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

        {/* Teacher Action Example Section */}
        <motion.div variants={itemVariants}>
          <div className="glass-panel border-red-500/20 rounded-[2rem] p-8 md:p-12 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30 text-red-500">
                <FaLightbulb className="text-3xl" />
              </div>
              <h2 className="text-4xl font-bold text-white">Actionable Insights for Teachers</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  We don't just show data; we prompt action. Our system aggregates student performance at the division level 
                  to highlight critical learning gaps that need immediate classroom attention.
                </p>
                <ul className="space-y-6">
                  {[
                    { icon: FaChartLine, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', title: 'Real-time Monitoring', desc: 'See which students are active right now.' },
                    { icon: FaUsers, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', title: 'Division Comparison', desc: 'Compare performance across different batches.' }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-5">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center border ${item.border}`}>
                        <item.icon className="text-xl" />
                      </div>
                      <div>
                        <strong className="block text-white text-lg mb-1">{item.title}</strong>
                        <span className="text-gray-400 block">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example Card */}
              <div className="glass-panel border-red-500/30 rounded-3xl p-8 bg-red-900/10 shadow-[0_0_40px_rgba(239,68,68,0.15)] transform rotate-2 hover:rotate-0 transition-transform duration-500 group">
                <div className="flex items-center gap-2 mb-6 text-red-500 font-bold uppercase text-sm tracking-widest bg-red-500/10 inline-flex px-3 py-1 rounded-full border border-red-500/20">
                  <FaExclamationTriangle className="animate-pulse" /> Critical Alert
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Topic Weakness: Division A
                </h3>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Failure Rate in "Schema Design"</span>
                    <span className="text-red-400 font-bold">60%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-3 border border-white/10 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '60%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                  </div>
                </div>

                <p className="text-gray-400 mb-8 leading-relaxed">
                  <strong className="text-white">60% of students</strong> in Division A are failing questions related to <strong className="text-white">"Database Schema Design"</strong>.
                </p>
                
                <button className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:scale-[1.02] active:scale-95 text-lg uppercase tracking-wider">
                  Schedule Revision Class
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default SchoolAnalytics;
