import React from 'react';

const FeatureHero = () => (
  <>
    {/* Coming Soon Banner */}
    <div className="max-w-7xl mx-auto mb-12">
      <div className="rounded-xl p-4 border flex items-center justify-center gap-3 transition-colors bg-white border-gray-200 text-gray-600 shadow-sm">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[#0061FF]">
          <span className="text-xs">🚀</span>
        </div>
        <p className="text-sm font-medium tracking-wide">
          <span className="text-gray-900 font-bold">Coming Soon</span> — This feature is currently under active development.
        </p>
      </div>
    </div>

    {/* Hero Section */}
    <div className="max-w-7xl mx-auto mb-20 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm mb-6">
        <span className="w-2 h-2 rounded-full bg-[#0061FF] animate-pulse"></span>
        <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Social Learning Platform</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-gray-900">
        Share, Teach, and Improve <br className="hidden md:block"/>
        <span className="text-[#0061FF]">with AI Intelligence</span>
      </h1>
      
      <p className="text-lg md:text-xl font-medium tracking-tight mx-auto max-w-3xl text-gray-500">
        Our platform empowers both students and teachers. Share educational content freely, 
        build advanced courses, and leverage AI insights to identify struggles and optimize learning.
      </p>
    </div>
  </>
);

export default FeatureHero;
