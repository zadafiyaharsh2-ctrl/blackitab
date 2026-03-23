import React from 'react';
import { FaCloudUploadAlt, FaTimes, FaImage, FaVideo } from 'react-icons/fa';

const UploadZone = ({ file, fileType, previewUrl, dragActive, fileInputRef, onDrag, onDrop, onChange, onClear }) => {
  if (!file) {
    return (
      <div 
        className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-100 dark:bg-white/5'
        }`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-600 dark:text-gray-400">
          <FaCloudUploadAlt size={32} />
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">Drag & Drop or Click to Upload</p>
        <p className="text-gray-500 text-sm mt-2">Images (JPG, PNG) or Videos (MP4, WebM)</p>
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="image/*,video/*"
          onChange={onChange}
        />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-gray-300 dark:border-white/10 group">
      {fileType === 'image' ? (
        <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
      ) : (
        <video src={previewUrl} controls className="w-full h-auto max-h-[500px] mx-auto" />
      )}
      <button 
        onClick={onClear}
        className="absolute top-4 right-4 p-2 bg-black/60 text-gray-900 dark:text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default UploadZone;
