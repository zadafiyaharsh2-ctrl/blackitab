import React from 'react';

const LandingBackground = () => (
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
);

export default LandingBackground;
