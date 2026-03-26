import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import { FaTimes, FaImage, FaVideo, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from '../../components/student/pages/createPost/UploadZone';
import PostFormFields from '../../components/student/pages/createPost/PostFormFields';

const CreatePost = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [caption, setCaption] = useState('');
  const [contentType, setContentType] = useState('post');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [playlistThumbnail, setPlaylistThumbnail] = useState(null);
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  useEffect(() => { fetchPlaylists(); }, []);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      const response = await axios.get(`${API_URL}/api/playlists/user/${user._id || user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setPlaylists(response.data.playlists);
    } catch (error) {
      console.error('Fetch playlists error:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const type = selectedFile.type.split('/')[0];
    if (type !== 'image' && type !== 'video') { alert('Please select an image or video file.'); return; }
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) { alert(`File too large. Max size for ${type} is ${type === 'video' ? '50MB' : '10MB'}.`); return; }
    setFile(selectedFile);
    setFileType(type);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const clearFile = () => {
    setFile(null); setPreviewUrl(''); setFileType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file && !caption.trim()) { alert('Please add a photo/video or write a caption.'); return; }
    if ((contentType === 'study-content' || contentType === 'paid-content') && (!title.trim() || !description.trim())) {
      alert(`Title and description are required for ${contentType === 'study-content' ? 'study' : 'paid'} content.`); return;
    }
    if (contentType === 'paid-content' && (!price || isNaN(price) || Number(price) <= 0)) {
      alert('Please enter a valid price greater than 0.'); return;
    }

    setLoading(true); setUploadProgress(0); setUploadStatus('uploading');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('contentType', contentType);
      if (contentType === 'study-content' || contentType === 'paid-content') {
        formData.append('title', title);
        formData.append('description', description);
      }
      if (contentType === 'paid-content') formData.append('price', price);
      if (contentType === 'study-content' || contentType === 'paid-content') {
        if (newPlaylistTitle.trim()) {
          formData.append('newPlaylistTitle', newPlaylistTitle);
          if (playlistThumbnail) formData.append('playlistThumbnail', playlistThumbnail);
        } else if (selectedPlaylistId) {
          formData.append('playlistId', selectedPlaylistId);
        }
      }
      if (file) formData.append('media', file);

      await axios.post(`${API_URL}/api/posts/create`, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted === 100) setUploadStatus('processing');
        }
      });
      setUploadStatus('complete');
      setTimeout(() => navigate('/profile'), 1000);
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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Post</h2>
          <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <UploadZone
            file={file} fileType={fileType} previewUrl={previewUrl} dragActive={dragActive}
            fileInputRef={fileInputRef} onDrag={handleDrag} onDrop={handleDrop} onChange={handleChange} onClear={clearFile}
          />

          <PostFormFields
            contentType={contentType} setContentType={setContentType}
            title={title} setTitle={setTitle} description={description} setDescription={setDescription}
            price={price} setPrice={setPrice}
            playlists={playlists} selectedPlaylistId={selectedPlaylistId} setSelectedPlaylistId={setSelectedPlaylistId}
            newPlaylistTitle={newPlaylistTitle} setNewPlaylistTitle={setNewPlaylistTitle}
            playlistThumbnail={playlistThumbnail} setPlaylistThumbnail={setPlaylistThumbnail}
            showNewPlaylistInput={showNewPlaylistInput} setShowNewPlaylistInput={setShowNewPlaylistInput}
          />

          {/* Caption Input */}
          <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl p-4 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption..." className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:outline-none min-h-[100px]" />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-white/5">
              <div className="flex gap-2 text-gray-600 dark:text-gray-400">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Add Image"><FaImage /></button>
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Add Video"><FaVideo /></button>
              </div>
              <span className="text-xs text-gray-500">{caption.length}/2200</span>
            </div>
          </div>

          {/* Upload Progress */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      {uploadStatus === 'complete' ? <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">✓</motion.div> : <FaSpinner className="animate-spin text-blue-400" size={20} />}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {uploadStatus === 'uploading' && `Uploading... ${uploadProgress}%`}
                        {uploadStatus === 'processing' && 'Processing your post...'}
                        {uploadStatus === 'complete' && 'Post created successfully!'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {uploadStatus === 'uploading' && 'Please wait while we upload your media'}
                        {uploadStatus === 'processing' && 'Almost there...'}
                        {uploadStatus === 'complete' && 'Redirecting to your profile...'}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button 
            onClick={handleSubmit}
            disabled={loading || (!file && !caption.trim())}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
              loading || (!file && !caption.trim())
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-gray-900 dark:text-white hover:shadow-blue-500/25 active:scale-[0.98]'
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
