import React from 'react';

const CallToAction = () => (
  <div className="max-w-4xl mx-auto text-center mb-12">
    <h2 className="text-4xl font-black tracking-tighter mb-6 text-gray-900">
      Initialize Your Journey
    </h2>
    <p className="text-lg font-medium tracking-tight mb-10 max-w-2xl mx-auto text-gray-500">
      Join the ecosystem redefining pedagogical infrastructure for students and professional educators alike.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold bg-[#0061FF] text-white hover:opacity-90 transition-opacity whitespace-nowrap shadow-[0_4px_14px_rgba(0,97,255,0.2)]">
        Launch Platform
      </button>
      <button className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-bold border transition-colors whitespace-nowrap border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm">
        View Documentation
      </button>
    </div>
  </div>
);

export default CallToAction;
