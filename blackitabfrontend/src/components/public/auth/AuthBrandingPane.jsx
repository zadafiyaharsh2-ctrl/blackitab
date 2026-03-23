import React from 'react';
import { BookOpen, Quote } from 'lucide-react';

const AuthBrandingPane = ({ title, subtitle }) => {
  return (
    <div className="hidden md:flex md:w-[45%] lg:w-1/2 relative bg-[#f8f9fa] border-r border-gray-200 flex-col justify-between p-12 lg:p-16 overflow-hidden">
      {/* Subtle Decorative Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,97,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute -left-[20%] -top-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#0061FF]/5 to-transparent blur-[100px] pointer-events-none" />

      {/* Logo/Brand Header */}
      <div className="relative z-10 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#0061FF]" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">RANKLEN</span>
      </div>

      {/* Testimonial / Core Message */}
      <div className="relative z-10 my-auto">
        <Quote className="w-12 h-12 text-gray-200 mb-6" />
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="text-lg text-gray-500 leading-relaxed max-w-md">
          {subtitle}
        </p>
      </div>

      {/* Footer info in sidebar */}
      <div className="relative z-10 text-sm font-medium text-gray-400">
        © {new Date().getFullYear()} Ranklen. All rights reserved.
      </div>
    </div>
  );
};

export default AuthBrandingPane;
