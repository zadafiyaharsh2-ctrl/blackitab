import React, { useState } from 'react';
import { FaTimes, FaHeart, FaComment, FaShare, FaEllipsisH, FaTrash, FaPaperPlane, FaBookmark, FaRegHeart, FaRegComment, FaRegBookmark, FaRegPaperPlane } from 'react-icons/fa';
import API_URL from '../config';
import axios from 'axios';
import { io } from 'socket.io-client';

const PostDetailModal = ({ isOpen, onClose, post, onPostDeleted }) => {
  const [currentPost, setCurrentPost] = useState(post);
  const [liked, setLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync with prop and check like status
  React.useEffect(() => {
      if (post) {
          setCurrentPost(post);
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          setLiked(post.likes?.includes(currentUser._id) || post.likes?.includes(currentUser.id));
      }
  }, [post]);

  // Real-time comments listener
  React.useEffect(() => {
      if (!currentPost) return;

      const socket = io(API_URL);

      socket.on('new_comment', (data) => {
          if (data.postId === currentPost._id) {
              setCurrentPost(prev => ({
                  ...prev,
                  comments: [data.comment, ...(prev.comments || [])]
              }));
          }
      });

      return () => {
          socket.disconnect();
      };
  }, [currentPost?._id]);

  if (!isOpen || !post || !currentPost) return null;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = currentUser.id === currentPost?.user?._id || currentUser._id === currentPost?.user?._id;

  const handleLike = async () => {
      try {
          const token = localStorage.getItem('token');
          const url = `${API_URL}/api/posts/${liked ? 'unlike' : 'like'}/${currentPost._id}`;
          
          // Optimistic UI update
          setLiked(!liked);
          setCurrentPost(prev => ({
              ...prev,
              likes: liked 
                  ? prev.likes.filter(id => id !== currentUser._id)
                  : [...(prev.likes || []), currentUser._id]
          }));

          await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
          console.error("Like error:", err);
          // Revert on error
          setLiked(!liked); 
      }
  };

  const handleComment = async () => {
      if (!commentText.trim()) return;
      try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const res = await axios.post(`${API_URL}/api/posts/comment/${currentPost._id}`, 
              { text: commentText }, 
              { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setCurrentPost(prev => ({ ...prev, comments: res.data.comments }));
          setCommentText('');
      } catch (err) {
          console.error("Comment error:", err);
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/api/posts/${currentPost._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (onPostDeleted) onPostDeleted(currentPost._id);
    } catch (err) {
        console.error("Delete error:", err);
    }
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      alert("Post link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Close Area */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors"
      >
          <FaTimes size={28} />
      </button>

      {/* Main Container */}
      <div className="relative w-full max-w-7xl h-full md:h-[90vh] flex flex-col md:flex-row bg-black rounded-none md:rounded-2xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-300 border border-white/5">
        
        {/* LEFT: MEDIA (Cinematic) */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
             
             {/* Blurred Ambient Background */}
             <div className="absolute inset-0 opacity-30 blur-3xl scale-125 pointer-events-none">
                {currentPost.mediaType === 'video' ? (
                     <video src={currentPost.mediaUrl} className="w-full h-full object-cover" muted />
                ) : (
                     <img src={currentPost.mediaUrl} alt="" className="w-full h-full object-cover" />
                )}
             </div>

             {/* Main Content */}
             <div className="relative z-10 max-w-full max-h-full w-full h-full flex items-center justify-center p-0 md:p-4">
                 {currentPost.mediaType === 'video' ? (
                     <video controls autoPlay className="max-w-full max-h-full rounded-md shadow-2xl">
                         <source src={currentPost.mediaUrl} />
                     </video>
                 ) : (
                     <img 
                        src={currentPost.mediaUrl} 
                        alt="Post" 
                        className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                     />
                 )}
             </div>
        </div>

        {/* RIGHT: SIDEBAR (Glass/Clean) */}
        <div className="w-full md:w-[400px] lg:w-[500px] bg-gray-950 flex flex-col h-[45vh] md:h-full border-l border-white/10">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gray-950/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-[2px]">
                        <img 
                            src={currentPost.user?.profileImage || `https://ui-avatars.com/api/?name=${currentPost.user?.name}&background=1f2937&color=fff`} 
                            alt={currentPost.user?.name} 
                            className="w-full h-full rounded-full object-cover border-2 border-black" 
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm hover:underline cursor-pointer">{currentPost.user?.name}</h3>
                        {currentPost.location && <p className="text-xs text-gray-500">{currentPost.location}</p>}
                    </div>
                </div>
                {isOwner && (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="text-white/50 hover:text-white p-2">
                            <FaEllipsisH />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-xl overflow-hidden py-1">
                                <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/5 text-sm">Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {/* Caption */}
                {currentPost.caption && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 flex-shrink-0">
                            <img 
                                src={currentPost.user?.profileImage || `https://ui-avatars.com/api/?name=${currentPost.user?.name}&background=1f2937&color=fff`} 
                                className="w-full h-full rounded-full object-cover" 
                                alt=""
                            />
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold text-white mr-2">{currentPost.user?.name}</span>
                            <span className="text-gray-300 leading-relaxed font-light">{currentPost.caption}</span>
                            <div className="text-xs text-gray-500 mt-2">{new Date(currentPost.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                )}

                {/* Real Comments */}
                {currentPost.comments?.map((comment, index) => (
                    <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-8 h-8 flex-shrink-0">
                            <img 
                                src={comment.user?.profileImage || `https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}&background=1f2937&color=fff`} 
                                className="w-full h-full rounded-full object-cover" 
                                alt=""
                            />
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold text-white mr-2">{comment.user?.name || 'User'}</span>
                            <span className="text-gray-300 leading-relaxed font-light">{comment.text}</span>
                            <div className="text-xs text-gray-500 mt-1">{new Date(comment.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {(!currentPost.comments || currentPost.comments.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-40">
                        <div className="text-4xl mb-2">💬</div>
                        <p className="text-sm text-gray-400">No comments yet.</p>
                        <p className="text-xs text-gray-600">Start the conversation.</p>
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-5">
                        <button onClick={handleLike} className="transition-transform active:scale-90">
                            {liked ? <FaHeart size={26} className="text-red-500" /> : <FaRegHeart size={26} className="text-white hover:text-gray-300" />}
                        </button>
                        <button className="transition-transform active:scale-90" onClick={() => document.getElementById('commentInput').focus()}>
                            <FaRegComment size={26} className="text-white hover:text-gray-300" />
                        </button>
                        <button className="transition-transform active:scale-90" onClick={handleShare}>
                            <FaRegPaperPlane size={24} className="text-white hover:text-gray-300" />
                        </button>
                    </div>
                    <button>
                        <FaRegBookmark size={24} className="text-white hover:text-gray-300" />
                    </button>
                </div>

                <div className="px-1 mb-4">
                    <div className="font-semibold text-white text-sm">{currentPost.likes?.length || 0} likes</div>
                    <div className="text-[10px] text-gray-500 uppercase mt-1">{new Date(currentPost.createdAt).toDateString()}</div>
                </div>

                <div className="flex items-center gap-3 mt-2 border-t border-white/10 pt-4">
                     <span className="text-xl">😃</span>
                     <input 
                        id="commentInput"
                        type="text" 
                        placeholder="Add a comment..." 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                        className="flex-1 bg-transparent border-none text-sm text-white placeholder-gray-500 focus:ring-0 p-0"
                     />
                     <button 
                        onClick={handleComment}
                        disabled={!commentText.trim() || loading}
                        className={`text-sm font-semibold transition-colors ${commentText.trim() ? 'text-blue-500 hover:text-white' : 'text-blue-500/30 cursor-default'}`}
                     >
                        {loading ? '...' : 'Post'}
                     </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;
