import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleAuthDivider = ({ onSuccess, onError, label = "continue_with" }) => {
  return (
    <div className="mt-8 border-t border-gray-100 pt-8 relative w-full">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Or continue with
      </div>
      
      <div className="flex justify-center flex-col items-center gap-2 w-full custom-google-btn-container">
        <style jsx>{`
          .custom-google-btn-container > div {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }
          .custom-google-btn-container iframe {
            margin: 0 auto !important;
          }
        `}</style>
        <div className="w-full p-[1px] rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap
            theme="outline"
            shape="pill"
            size="large"
            text={label}
          />
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthDivider;
