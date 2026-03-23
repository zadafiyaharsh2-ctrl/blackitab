/**
 * ============================================================================
 * LANDING PAGE (Premium Light Mode)
 * ============================================================================
 * 
 * Concept: Strict Ranklen Design System (Academic Curator).
 * Ultra-clean bg-gray-50, crisp white cards, electric blue accents.
 */

import React from 'react';
import LandingBackground from '../../components/public/landing/LandingBackground';
import LandingNavbar from '../../components/public/landing/LandingNavbar';
import LandingHero from '../../components/public/landing/LandingHero';
import Socialfeatures from '../../components/shared/SocialFeatures';

const LandingPage = () => {
  return (
    <div className="min-h-screen font-sans bg-[#f8f9fa] text-gray-900">
      
      <LandingBackground />
      <LandingNavbar />
      <LandingHero />

      {/* ==================== SOCIAL FEATURES ==================== */}
      <div id="features" className="relative z-10">
         <Socialfeatures/>
      </div>
      
    </div>
  );
};

export default LandingPage;
