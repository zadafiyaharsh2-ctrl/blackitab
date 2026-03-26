import React from 'react';
import { FaRupeeSign, FaListUl, FaPlus, FaPlusSquare, FaTimes } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

const PostFormFields = ({
  contentType, setContentType,
  title, setTitle, description, setDescription,
  price, setPrice,
  playlists, selectedPlaylistId, setSelectedPlaylistId,
  newPlaylistTitle, setNewPlaylistTitle,
  playlistThumbnail, setPlaylistThumbnail,
  showNewPlaylistInput, setShowNewPlaylistInput
}) => {
  return (
    <>
      {/* Content Type Selector */}
      <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl p-4 space-y-3">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Content Type</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setContentType('post')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              contentType === 'post'
                ? 'bg-blue-600 text-gray-900 dark:text-white shadow-lg shadow-blue-900/30'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/10'
            }`}
          >
            📱 Regular Post
          </button>
          <button
            type="button"
            onClick={() => setContentType('study-content')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              contentType === 'study-content'
                ? 'bg-purple-600 text-gray-900 dark:text-white shadow-lg shadow-purple-900/30'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/10'
            }`}
          >
            🎓 Study Content
          </button>
          <button
            type="button"
            onClick={() => setContentType('paid-content')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              contentType === 'paid-content'
                ? 'bg-amber-600 text-gray-900 dark:text-white shadow-lg shadow-amber-900/30'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <FaRupeeSign size={14} /> Paid Content
            </div>
          </button>
        </div>
      </div>

      {/* Playlist Selection */}
      {(contentType === 'study-content' || contentType === 'paid-content') && (
        <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FaListUl className="text-purple-400" /> Add to Playlist (Series)
            </label>
            {!showNewPlaylistInput && (
              <button 
                type="button" 
                onClick={() => { setShowNewPlaylistInput(true); setSelectedPlaylistId(''); }}
                className="text-xs text-blue-400 hover:text-gray-900 dark:text-white flex items-center gap-1 font-semibold"
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
                  className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
                <div className="relative">
                  <input type="file" accept="image/*" onChange={(e) => setPlaylistThumbnail(e.target.files[0])} className="hidden" id="playlist-thumb-upload" />
                  <label htmlFor="playlist-thumb-upload" className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white cursor-pointer transition-colors border border-dashed border-white/20 rounded-lg p-2 w-full justify-center hover:border-purple-500/50">
                    <FaPlusSquare /> {playlistThumbnail ? playlistThumbnail.name : "Upload Series Cover (Optional)"}
                  </label>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setShowNewPlaylistInput(false); setNewPlaylistTitle(''); setPlaylistThumbnail(null); }}
                className="px-3 bg-white/10 hover:bg-white/20 text-gray-900 dark:text-white rounded-lg transition-colors h-fit py-2"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="relative">
              <select value={selectedPlaylistId} onChange={(e) => setSelectedPlaylistId(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 appearance-none">
                <option value="">Select an existing playlist (Optional)</option>
                {playlists.map(p => (<option key={p._id} value={p._id}>{p.title}</option>))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 dark:text-gray-400">▼</div>
            </div>
          )}
          <p className="text-xs text-gray-500">
            {showNewPlaylistInput ? "Create a new series. This video will be the first episode." : "Organize this video into a series for your viewers."}
          </p>
        </div>
      )}

      {/* Title & Description */}
      {(contentType === 'study-content' || contentType === 'paid-content') && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
            <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl p-4 focus-within:border-purple-500/50 focus-within:bg-white/10 transition-all">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter content title..." maxLength={200} className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none" />
              <div className="text-xs text-gray-500 mt-2">{title.length}/200</div>
            </div>

            <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl p-4 focus-within:border-purple-500/50 focus-within:bg-white/10 transition-all">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what students will learn..." maxLength={5000} className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:outline-none min-h-[120px]" />
              <div className="text-xs text-gray-500 mt-2">{description.length}/5000</div>
            </div>

            {contentType === 'paid-content' && (
              <div className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl p-4 focus-within:border-amber-500/50 focus-within:bg-white/10 transition-all">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-2">Price (INR) *</label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" />
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price (e.g., 499)" min="1" className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none pl-8" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default PostFormFields;
