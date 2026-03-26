import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

const LandingHero = () => (
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
        Empowering educators and students with AI-driven exam generation, intelligent Copilots, real-time mistake tracking, and flexible monetization in a premium ecosystem.
      </p>

      {/* Hero Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Link 
          to="/signup"
          className="flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold transition-transform hover:-translate-y-0.5 bg-[#0061FF] text-white shadow-[0_8px_20px_rgba(0,97,255,0.25)]"
        >
          Get Started
        </Link>
        <a 
          href="#features"
          className="flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
        >
          Watch Demo <FaArrowRight className="ml-2 w-3 h-3 text-gray-400" />
        </a>
      </div>
    </motion.div>
  </main>
);

export default LandingHero;
