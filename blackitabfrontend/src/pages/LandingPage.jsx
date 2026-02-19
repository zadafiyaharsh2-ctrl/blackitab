/**
 * ============================================================================
 * LANDING PAGE (Redesigned)
 * ============================================================================
 * 
 * Concept: Minimalist, Premium, High-Impact.
 * Elements:
 * 1. Hero Section: "Blackitab" + Tagline + CTA
 * 2. Background: Dynamic, dark, abstract.
 * 3. Navigation: Minimal login/signup.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import Logo from '../components/Logo'; // Keeping Logo for branding
import Socialfeatures from '../components/Socilafeatures';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-gray-900 dark:text-white overflow-hidden relative selection:bg-blue-500 selection:text-gray-900 dark:text-white font-sans">
      
      {/* ==================== BACKGROUND EFFECTS ==================== */}
      {/* 1. Base Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black z-0"></div>
      
      {/* 2. Animated Glow Orbs (CSS Animation would be better, but static for now is fine) */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen"></div>

      {/* 3. Grid Overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.15]" 
           style={{ 
             backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', 
             backgroundSize: '50px 50px' 
           }}>
      </div>

      {/* ==================== NAVBAR ==================== */}
      <nav className="relative z-50 w-full py-6 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" textSize="text-2xl" />
        </div>
        <div className="flex items-center gap-6">
          <Link 
            to="/login" 
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white font-medium transition-colors text-sm tracking-wide"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
        
        {/* Animated Badge */}
        <div className="mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <span className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 backdrop-blur-md text-xs font-medium text-blue-300 tracking-wider uppercase">
            The Future of EdTech
          </span>
        </div>

        {/* Main Headline - Massive & Gradient */}
        <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter animate-fade-in-up opacity-0" 
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Blackitab
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up opacity-0"
           style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          Precision engineering for your education. 
          <span className="hidden md:inline"> Master complex concepts with AI-driven insights and real-time analytics.</span>
        </p>

        {/* Call to Action Button */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
          <Link 
            to="/signup"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-900 dark:text-white transition-all duration-200 bg-transparent border-2 border-white rounded-full hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-black"
          >
            <span>Get Started</span>
            <FaArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            
            {/* Glow Effect behind button */}
            <div className="absolute inset-0 -z-10 rounded-full blur-lg opacity-50 bg-white group-hover:opacity-75 transition-opacity duration-200"></div>
          </Link>
        </div>

        

      </main>

      {/* Tailwind Custom Animation Styles (Inline for simplicity) */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation-name: fadeInUp;
          animation-duration: 0.8s;
          animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
      <Socialfeatures/>
    </div>
  );
};

export default LandingPage;
