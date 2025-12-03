import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCode, FaRobot, FaChartLine, FaTrophy, FaBook, FaLaptopCode } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <FaCode className="text-xl text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Blackitab</span>
        </div>
        <Link 
          to="/login" 
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-sm transition-all duration-300 font-medium text-sm hover:scale-105 active:scale-95"
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
        >
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Learning Journey</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
        >
          The ultimate platform for everyone to learn, practice, and grow. 
          From AI-powered assistance to comprehensive educational resources, we have everything you need to succeed.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link 
            to="/login" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            Get Started <span className="text-xl">→</span>
          </Link>
          <Link 
            to="/signup" 
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full font-semibold text-lg border border-gray-700 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Create Account
          </Link>
        </motion.div>
      </header>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<FaChartLine />} 
            title="Analytics Dashboard" 
            description="Track your progress with detailed analytics and visual insights into your learning habits."
            delay={0.1}
          />
          <FeatureCard 
            icon={<FaRobot />} 
            title="AI Assistant" 
            description="Get intelligent suggestions and code reviews powered by advanced AI models."
            delay={0.2}
          />
          <FeatureCard 
            icon={<FaBook />} 
            title="Comprehensive Theory" 
            description="Access a vast library of educational topics, from computer science to general knowledge."
            delay={0.3}
          />
          <FeatureCard 
            icon={<FaLaptopCode />} 
            title="Interactive Workspace" 
            description="Practice and apply what you learn directly in your browser with our powerful integrated environment."
            delay={0.4}
          />
          <FeatureCard 
            icon={<FaTrophy />} 
            title="Knowledge Challenges" 
            description="Compete with others in real-time challenges and climb the leaderboard to showcase your skills."
            delay={0.5}
          />
          <FeatureCard 
            icon={<FaCode />} 
            title="Skill Building" 
            description="Practice with thousands of questions across various difficulty levels and subjects."
            delay={0.6}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md mt-20">
        <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <FaCode className="text-sm text-white" />
            </div>
            <span className="text-xl font-bold text-gray-200">Blackitab</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Blackitab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay }}
      className="p-8 rounded-2xl bg-gray-800/50 border border-white/5 hover:bg-gray-800 hover:border-blue-500/30 transition-all duration-300 group"
    >
      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
        <div className="text-2xl text-blue-400 group-hover:text-blue-300 transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
        {description}
      </p>
    </motion.div>
  );
};

export default LandingPage;
