import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaLock, FaGlobe } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../config';

const AddToPlaylistModal = ({ isOpen, onClose, contentId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // playlistId being processed

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!userStr || !token) return;
      
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;

      const response = await axios.get(`${API_URL}/api/playlists/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPlaylists(response.data.playlists);
      }
    } catch (error) {
      console.error('Fetch playlists error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlaylist = async (playlist) => {
    // Check if content is already in playlist
    // Note: The backend returns playlists with populated posts (just id or minimal info)
    // We need to check if contentId exists in playlist.posts array
    // However, getUserPlaylists in controller populates posts with just mediaUrl.
    // Wait, let's check controller. getUserPlaylists populates posts with 'mediaUrl'.
    // So playlist.posts is an array of objects.
    
    // We actually need to know if the current video is in each playlist.
    // The current getUserPlaylists might not be efficient for this if posts list is huge, 
    // but for now we iterate.
    
    // Actually, checking existence locally is tricky if we don't have the full list of IDs.
    // Let's assume we maintain a local state or fetch checks.
    
    // Better approach: specific endpoint or just rely on the fact that we have the list.
    // If playlist.posts contains objects, we map to IDs.
    
    const isIncluded = playlist.posts.some(p => (p._id || p) === contentId);
    
    setProcessing(playlist._id);
    const token = localStorage.getItem('token');
    
    try {
      if (isIncluded) {
        // Remove
        await axios.delete(`${API_URL}/api/playlists/${playlist._id}/remove/${contentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state
        setPlaylists(prev => prev.map(p => {
          if (p._id === playlist._id) {
             return { ...p, posts: p.posts.filter(post => (post._id || post) !== contentId) };
          }
          return p;
        }));
        
      } else {
        // Add
        await axios.post(`${API_URL}/api/playlists/add`, {
           playlistId: playlist._id,
           postId: contentId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state
        setPlaylists(prev => prev.map(p => {
          if (p._id === playlist._id) {
             return { ...p, posts: [...p.posts, { _id: contentId }] }; // Optimistic add
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Toggle playlist error:', error);
      alert('Failed to update playlist');
    } finally {
        setProcessing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-xl w-full max-w-xs sm:max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Save to...</h3>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white">
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading ? (
             <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : playlists.length === 0 ? (
             <div className="text-center py-8 text-gray-500">
                No playlists found. Create one on your profile!
             </div>
          ) : (
            <div className="space-y-1">
              {playlists.map(playlist => {
                 const isIncluded = playlist.posts.some(p => (p._id || p) === contentId);
                 return (
                    <label 
                      key={playlist._id} 
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${processing === playlist._id ? 'opacity-50' : 'hover:bg-gray-100 dark:bg-white/5'}`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isIncluded ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                         <input 
                           type="checkbox" 
                           className="hidden" 
                           checked={isIncluded}
                           onChange={() => !processing && togglePlaylist(playlist)}
                         />
                         {isIncluded && <FaCheck size={12} className="text-gray-900 dark:text-white" />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{playlist.title}</div>
                         <div className="text-xs text-gray-500 flex items-center gap-1">
                            {playlist.isPrivate ? <FaLock size={10} /> : <FaGlobe size={10} />}
                            {playlist.isPrivate ? 'Private' : 'Public'}
                         </div>
                      </div>
                    </label>
                 );
              })}
            </div>
          )}
        </div>
        
        {/* Optional: Quick Create Button could go here */}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
