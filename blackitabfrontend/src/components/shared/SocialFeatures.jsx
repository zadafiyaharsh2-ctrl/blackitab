import React from 'react';
import FeatureHero from '../public/landing/FeatureHero';
import FeatureGrid from '../public/landing/FeatureGrid';
import AnalyticsSection from '../public/landing/AnalyticsSection';
import MonetizationSection from '../public/landing/MonetizationSection';
import CallToAction from '../public/landing/CallToAction';

const SocialFeatures = () => {
  return (
    <div className="min-h-screen p-6 md:p-12 transition-colors duration-300 bg-[#f8f9fa] text-gray-900">
      <FeatureHero />
      <FeatureGrid />
      <AnalyticsSection />
      <MonetizationSection />
      <CallToAction />
    </div>
  );
};

export default SocialFeatures;
