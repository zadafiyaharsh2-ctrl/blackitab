/**
 * ============================================================================
 * LANDING PAGE (Premium Light Mode)
 * ============================================================================
 * 
 * Concept: Strict Ranklen Design System (Academic Curator).
 * Ultra-clean bg-gray-50, crisp white cards, electric blue accents.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import Logo from '../../components/shared/Logo';
import Socialfeatures from '../../components/shared/SocialFeatures';

const LandingPage = () => {
  return (
    <div className="min-h-screen font-sans bg-[#f8f9fa] text-gray-900">
      
      {/* ==================== BACKGROUND ==================== */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         {/* Subtle Grid Overlay */}
         <div className="absolute inset-0 opacity-[0.04]" 
              style={{ 
                backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
              }}
         />
         {/* Top ambient glow */}
         <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ==================== NAVBAR ==================== */}
      <nav className="relative z-50 w-full py-5 px-6 md:px-12 flex justify-between items-center border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" textSize="text-xl" />
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/contact" 
            className="text-gray-400 hover:text-white font-medium transition-colors text-sm tracking-wide"
          >
            Contact
          </Link>
          <Link 
            to="/login" 
            className="text-sm font-semibold tracking-wide text-gray-500 hover:text-gray-900 transition-colors"
          >
            Log in
          </Link>
          <Link 
            to="/signup" 
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#0061FF] text-white transition-opacity hover:opacity-90 shadow-[0_4px_14px_rgba(0,97,255,0.2)]"
          >
             Sign up
          </Link>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto flex flex-col items-center mt-12 mb-20"
        >
          {/* Badge */}
          <div className="mb-8 px-5 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-xs font-bold tracking-[0.15em] uppercase text-gray-600 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#0061FF] animate-pulse" />
             The Academic Curator
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[5rem] font-black mb-6 tracking-tighter leading-[1.1] text-gray-900">
            Elevate Education with <span className="text-[#0061FF]">AI-Powered Insights.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium tracking-tight text-gray-500">
            Empowering educators with real-time mistake tracking, deep analytics, and flexible monetization models wrapped in a premium ecosystem.
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              to="/signup"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold transition-transform hover:-translate-y-0.5 bg-[#0061FF] text-white shadow-[0_8px_20px_rgba(0,97,255,0.25)]"
            >
              Get Started
            </Link>
            <Link 
              to="#features"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Watch Demo <FaArrowRight className="ml-2 w-3 h-3 text-gray-400" />
            </Link>
          </div>
        </motion.div>
      </main>

      {/* ==================== SOCIAL FEATURES ==================== */}
      <div id="features" className="relative z-10">
         <Socialfeatures/>
      </div>
      
    </div>
  );
};

export default LandingPage;
