import React from 'react';

const Logo = ({ className = "w-10 h-10", showText = true, textSize = "text-xl" }) => {
  return (
    <div className="flex items-center gap-2">
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo-600 */}
            <stop offset="100%" stopColor="#9333EA" /> {/* Purple-600 */}
          </linearGradient>
        </defs>
        
        {/* Background Shape */}
        <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#logoGradient)" fillOpacity="0.2" stroke="url(#logoGradient)" strokeWidth="4" />
        
        {/* Stylized 'B' / Coding Brackets */}
        <path 
          d="M35 30 H60 C75 30, 75 50, 60 50 C75 50, 75 70, 60 70 H35 V30 Z" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M45 50 H60" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
        
        {/* Tech Accent Dot */}
        <circle cx="75" cy="25" r="5" fill="#22D3EE" /> {/* Cyan accent */}
      </svg>
      
      {showText && (
        <span className={`font-bold tracking-tight text-white ${textSize}`}>
          Blackitab
        </span>
      )}
    </div>
  );
};

export default Logo;
