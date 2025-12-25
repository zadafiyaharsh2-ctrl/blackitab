import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { FaCloudUploadAlt, FaTimes, FaImage, FaVideo, FaSpinner, FaRupeeSign, FaListUl, FaPlus, FaPlusSquare } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePost = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileType, setFileType] = useState(''); // 'image' or 'video'
  const [caption, setCaption] = useState('');
  const [contentType, setContentType] = useState('post'); // 'post', 'study-content', 'paid-content'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(''); // 'uploading', 'processing', 'complete'
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Playlist State
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [playlistThumbnail, setPlaylistThumbnail] = useState(null); // New state
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if(!user) return;

        const response = await axios.get(`${API_URL}/api/playlists/user/${user._id || user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setPlaylists(response.data.playlists);
        }
      } catch (error) {
        console.error('Fetch playlists error:', error);
      }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate type
    const type = selectedFile.type.split('/')[0];
    if (type !== 'image' && type !== 'video') {
      alert('Please select an image or video file.');
      return;
    }

    // Validate size (e.g. 50MB for video, 10MB for image)
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert(`File too large. Max size for ${type} is ${type === 'video' ? '50MB' : '10MB'}.`);
      return;
    }

    setFile(selectedFile);
    setFileType(type);
    
    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl('');
    setFileType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    // Validation
    if (!file && !caption.trim()) {
      alert('Please add a photo/video or write a caption.');
      return;
    }

    if (contentType === 'study-content' || contentType === 'paid-content') {
      if (!title.trim()) {
        alert(`Title is required for ${contentType === 'study-content' ? 'study' : 'paid'} content.`);
        return;
      }
      if (!description.trim()) {
        alert(`Description is required for ${contentType === 'study-content' ? 'study' : 'paid'} content.`);
        return;
      }
    }

    if (contentType === 'paid-content') {
        if (!price || isNaN(price) || Number(price) <= 0) {
            alert('Please enter a valid price greater than 0.');
            return;
        }
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('contentType', contentType);
      if (contentType === 'study-content' || contentType === 'paid-content') {
        formData.append('title', title);
        formData.append('description', description);
      }
      if (contentType === 'paid-content') {
          formData.append('price', price);
      }
      
      // Playlist Data
      if (contentType === 'study-content' || contentType === 'paid-content') {
         if (newPlaylistTitle.trim()) {
             formData.append('newPlaylistTitle', newPlaylistTitle);
             if (playlistThumbnail) {
                 formData.append('playlistThumbnail', playlistThumbnail);
             }
         } else if (selectedPlaylistId) {
             formData.append('playlistId', selectedPlaylistId);
         }
      }

      if (file) {
        formData.append('media', file);
      }

      await axios.post(`${API_URL}/api/posts/create`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          
          // Switch to processing at 100%
          if (percentCompleted === 100) {
            setUploadStatus('processing');
          }
        }
      });

      setUploadStatus('complete');
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      console.error('Create post error:', error);
      alert(error.response?.data?.message || 'Failed to create post');
      setUploadStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Post</h2>
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Upload Area */}
        <div className="space-y-6">
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <FaCloudUploadAlt size={32} />
              </div>
              <p className="text-gray-300 font-medium text-lg">Drag & Drop or Click to Upload</p>
              <p className="text-gray-500 text-sm mt-2">Images (JPG, PNG) or Videos (MP4, WebM)</p>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*,video/*"
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/10 group">
              {fileType === 'image' ? (
                <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[500px] object-contain mx-auto" />
              ) : (
                <video src={previewUrl} controls className="w-full h-auto max-h-[500px] mx-auto" />
              )}
              
              <button 
                onClick={clearFile}
                className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Content Type Selector */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <label className="text-sm font-semibold text-gray-300 block">Content Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setContentType('post')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  contentType === 'post'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                📱 Regular Post
              </button>
              <button
                type="button"
                onClick={() => setContentType('study-content')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  contentType === 'study-content'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                🎓 Study Content
              </button>
              <button
                type="button"
                onClick={() => setContentType('paid-content')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  contentType === 'paid-content'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                    <FaRupeeSign size={14} /> Paid Content
                </div>
              </button>
            </div>
          </div>

          {/* Playlist Selection Section */}
          {(contentType === 'study-content' || contentType === 'paid-content') && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
               <div className="flex justify-between items-center">
                   <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                       <FaListUl className="text-purple-400" /> Add to Playlist (Series)
                   </label>
                   {!showNewPlaylistInput && (
                       <button 
                           type="button" 
                           onClick={() => { setShowNewPlaylistInput(true); setSelectedPlaylistId(''); }}
                           className="text-xs text-blue-400 hover:text-white flex items-center gap-1 font-semibold"
                       >
                           <FaPlus /> New Playlist
                       </button>
                   )}
               </div>

               {showNewPlaylistInput ? (
                   <div className="flex gap-2">
                       <div className="flex-1 space-y-2">
                           <input
                               type="text"
                               value={newPlaylistTitle}
                               onChange={(e) => setNewPlaylistTitle(e.target.value)}
                               placeholder="Playlist Title (e.g. Full Stack Course)"
                               className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                           />
                           {/* Playlist Thumbnail Input */}
                           <div className="relative">
                               <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setPlaylistThumbnail(e.target.files[0])}
                                    className="hidden"
                                    id="playlist-thumb-upload"
                               />
                               <label 
                                    htmlFor="playlist-thumb-upload"
                                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-white cursor-pointer transition-colors border border-dashed border-white/20 rounded-lg p-2 w-full justify-center hover:border-purple-500/50"
                               >
                                    <FaPlusSquare /> 
                                    {playlistThumbnail ? playlistThumbnail.name : "Upload Series Cover (Optional)"}
                               </label>
                           </div>
                       </div>
                       <button 
                           type="button"
                           onClick={() => { setShowNewPlaylistInput(false); setNewPlaylistTitle(''); setPlaylistThumbnail(null); }}
                           className="px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors h-fit py-2"
                       >
                           <FaTimes />
                       </button>
                   </div>
               ) : (
                   <div className="relative">
                       <select
                           value={selectedPlaylistId}
                           onChange={(e) => setSelectedPlaylistId(e.target.value)}
                           className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 appearance-none"
                       >
                           <option value="">Select an existing playlist (Optional)</option>
                           {playlists.map(p => (
                               <option key={p._id} value={p._id}>{p.title}</option>
                           ))}
                       </select>
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           ▼
                       </div>
                   </div>
               )}
               <p className="text-xs text-gray-500">
                   {showNewPlaylistInput 
                       ? "Create a new series. This video will be the first episode." 
                       : "Organize this video into a series for your viewers."}
               </p>
            </div>
          )}


          {/* Title & Description (for Study & Paid Content) */}
          {(contentType === 'study-content' || contentType === 'paid-content') && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-purple-500/50 focus-within:bg-white/10 transition-all">
                  <label className="text-xs font-semibold text-gray-400 block mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter content title..."
                    maxLength={200}
                    className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  />
                  <div className="text-xs text-gray-500 mt-2">{title.length}/200</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-purple-500/50 focus-within:bg-white/10 transition-all">
                  <label className="text-xs font-semibold text-gray-400 block mb-2">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn..."
                    maxLength={5000}
                    className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[120px]"
                  />
                  <div className="text-xs text-gray-500 mt-2">{description.length}/5000</div>
                </div>

                {contentType === 'paid-content' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-amber-500/50 focus-within:bg-white/10 transition-all">
                      <label className="text-xs font-semibold text-gray-400 block mb-2">Price (INR) *</label>
                      <div className="relative">
                          <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter price (e.g., 499)"
                            min="1"
                            className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none pl-8"
                          />
                      </div>
                    </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Caption Input */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[100px]"
            />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                <div className="flex gap-2 text-gray-400">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Add Image">
                        <FaImage />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Add Video">
                        <FaVideo />
                    </button>
                </div>
                <span className="text-xs text-gray-500">{caption.length}/2200</span>
            </div>
          </div>

          {/* Upload Progress */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      {uploadStatus === 'complete' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-2xl"
                        >
                          ✓
                        </motion.div>
                      ) : (
                        <FaSpinner className="animate-spin text-blue-400" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {uploadStatus === 'uploading' && `Uploading... ${uploadProgress}%`}
                        {uploadStatus === 'processing' && 'Processing your post...'}
                        {uploadStatus === 'complete' && 'Post created successfully!'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {uploadStatus === 'uploading' && 'Please wait while we upload your media'}
                        {uploadStatus === 'processing' && 'Almost there...'}
                        {uploadStatus === 'complete' && 'Redirecting to your profile...'}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{uploadProgress}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={loading || (!file && !caption.trim())}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading || (!file && !caption.trim())
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-blue-500/25 active:scale-[0.98]'
            }`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Share Post'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePost;
