import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaListUl, FaEllipsisH, FaTrash } from 'react-icons/fa';
import API_URL from '../config';

const PlaylistCard = ({ playlist, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);
  const [isOwner, setIsOwner] = React.useState(false);

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && (user._id === playlist.user?._id || user.id === playlist.user?._id)) {
      setIsOwner(true);
    }
  }, [playlist.user]);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this playlist?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/playlists/${playlist._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                if (onDelete) onDelete(playlist._id);
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
        }
    }
    setShowMenu(false);
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer group relative border border-gray-200 dark:border-white/5 hover:border-purple-500/30 transition-all shadow-lg hover:shadow-purple-500/10"
      onClick={() => navigate(`/playlist/${playlist._id}`)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-gray-50 dark:bg-gray-800 overflow-hidden">
        {playlist.thumbnail ? (
          <img 
            src={playlist.thumbnail} 
            alt={playlist.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900">
            <FaListUl size={32} className="mb-2 opacity-50" />
            <span className="text-xs font-medium">Empty Playlist</span>
          </div>
        )}

        {/* Overlay with Play Icon */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform scale-0 group-hover:scale-100 transition-transform duration-300">
                <FaPlay size={16} className="ml-1" />
            </div>
        </div>

        {/* Video Count Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 font-medium border border-white/20">
          <FaListUl size={10} />
          {playlist.posts?.length || 0} videos
        </div>

         {/* Delete Menu (Owner Only) */}
         {isOwner && (
            <div className="absolute top-2 right-2 z-20">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                >
                    <FaEllipsisH size={14} />
                </button>
                {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#222] border border-gray-300 dark:border-white/10 rounded-lg shadow-xl overflow-hidden py-1">
                        <button 
                            onClick={handleDelete}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-gray-100 dark:bg-white/5 flex items-center gap-2"
                        >
                            <FaTrash size={10} /> Delete
                        </button>
                    </div>
                )}
            </div>
         )}
      </div>

      {/* Info content remains same */}
      <div className="p-4">
        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
            {playlist.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 mb-3">
             {playlist.user?.name || 'Unknown Creator'}
        </p>
        
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-200 dark:border-white/5">
             <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                 View Full Series
             </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaylistCard;
