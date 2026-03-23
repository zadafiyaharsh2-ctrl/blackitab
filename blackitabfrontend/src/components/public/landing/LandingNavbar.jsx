import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../shared/Logo';

const LandingNavbar = () => (
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
);

export default LandingNavbar;
