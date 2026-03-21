/**
 * ============================================================================
 * LANDING PAGE (Redesigned)
 * ============================================================================
 * 
 * Concept: Minimalist, Premium, High-Impact.
 * Upgraded with Framer Motion, dynamic orbs, and glassmorphism.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import Logo from '../../components/shared/Logo';
import Socialfeatures from '../../components/shared/SocialFeatures';

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 20 } 
  }
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-blue-500/30 selection:text-white font-sans">
      
      {/* ==================== BACKGROUND EFFECTS ==================== */}
      <div className="fixed inset-0 z-0">
         {/* Deep dark base */}
         <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-black to-black" />
         
         {/* Animated Background Orbs */}
         <motion.div 
            animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[150px] mix-blend-screen"
         />
         <motion.div 
            animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-indigo-600/30 rounded-full blur-[160px] mix-blend-screen"
         />

         {/* Grid Overlay */}
         <div className="absolute inset-0 opacity-[0.05]" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', 
                backgroundSize: '60px 60px' 
              }}
         />
      </div>

      {/* ==================== NAVBAR ==================== */}
      <nav className="relative z-50 w-full py-6 px-6 md:px-12 flex justify-between items-center backdrop-blur-sm border-b border-white/5">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3"
        >
          <Logo className="w-10 h-10" textSize="text-2xl" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-6"
        >
          <Link 
            to="/login" 
            className="text-gray-400 hover:text-white font-medium transition-colors text-sm tracking-wide"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="relative group px-6 py-2.5 rounded-full font-bold text-sm bg-white text-black overflow-hidden transition-all hover:scale-105"
          >
             <span className="relative z-10">Sign Up</span>
             <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity z-0" />
             {/* Outerglow */}
             <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-shadow -z-10" />
          </Link>
        </motion.div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto flex flex-col items-center"
        >
          {/* Animated Badge */}
          <motion.div variants={itemVariants} className="mb-8 relative">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-30 animate-pulse" />
             <span className="relative px-5 py-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-xs font-bold text-blue-300 tracking-widest uppercase flex items-center justify-center shadow-inner">
               <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-ping" />
               The Future of EdTech
             </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-none glow-text">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-sm">
                RANKLEN
              </span>
            </h1>
          </motion.div>

          {/* Sub-headline */}
          <motion.div variants={itemVariants}>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
              Precision engineering for your education. 
              <br className="hidden md:block" />
              <span className="text-gray-300 font-medium"> Master complex concepts with AI-driven insights and real-time analytics.</span>
            </p>
          </motion.div>

          {/* Call to Action Button */}
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-black border border-white/20 rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              {/* Hover sweep effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
               
              <span className="relative z-10 tracking-wide text-glow">Get Started Free</span>
              <FaArrowRight className="relative z-10 ml-3 w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        </motion.div>

      </main>

      {/* Social Features block */}
      <motion.div 
         initial={{ opacity: 0, y: 50 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true, margin: "-100px" }}
         transition={{ duration: 0.8 }}
         className="relative z-10"
      >
         <Socialfeatures/>
      </motion.div>
      
    </div>
  );
};

export default LandingPage;
