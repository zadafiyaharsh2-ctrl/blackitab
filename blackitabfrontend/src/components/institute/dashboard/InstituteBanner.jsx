import React from 'react';
import { BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const InstituteBanner = ({ institute, showCode, setShowCode }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:shadow-none h-48 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
      {institute?.bannerImage ? (
        <img src={institute.bannerImage} alt="Banner" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
          <BuildingOfficeIcon className="w-10 h-10 mb-1 opacity-30" />
          <p className="text-xs">No banner image</p>
        </div>
      )}
      {institute?.bannerImage && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />}
      <div className="absolute bottom-4 left-5 right-5">
        <h1 className={`text-xl font-bold ${institute?.bannerImage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{institute?.name}</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className={`flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded border ${institute?.bannerImage ? 'text-white border-white/30 bg-black/30' : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/20 bg-white/80 dark:bg-black/30'}`}>
            CODE: {showCode ? institute?.instituteCode : '••••••'}
            <button onClick={() => setShowCode(!showCode)} className="ml-0.5">
              {showCode ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
            </button>
          </span>
          {institute?.address && <span className={`text-xs ${institute?.bannerImage ? 'text-gray-200' : 'text-gray-500'}`}>{institute.address}</span>}
        </div>
      </div>
    </div>
  );
};

export default InstituteBanner;
