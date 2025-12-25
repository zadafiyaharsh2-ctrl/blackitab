import React, { useState } from 'react';
import { FaHeart, FaComment, FaShare, FaEllipsisH, FaTrash } from 'react-icons/fa';
import API_URL from '../config';
import axios from 'axios';

const Post = ({ post, onPostDeleted }) => {
  const [liked, setLiked] = useState(false); // Placeholder for local state
  const [showMenu, setShowMenu] = useState(false);
  
  // Get current user for ownership check
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = currentUser.id === post?.user?._id || currentUser._id === post?.user?._id;

  if (!post) return null;

  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`${API_URL}/api/posts/${post._id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if (onPostDeleted) {
              onPostDeleted(post._id);
          }
      } catch (err) {
          console.error("Delete error:", err);
          alert("Failed to delete post");
      }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6 shadow-lg">
      {/* Header */}
      <div className="p-4 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
            {post.user?.profileImage ? (
               <img src={post.user.profileImage} alt={post.user.name} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                 {post.user?.name?.charAt(0).toUpperCase()}
               </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{post.user?.name}</h3>
            <span className="text-gray-500 text-xs">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Menu Button & Dropdown - Only show if owner */}
        {isOwner && (
            <div className="relative">
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                    <FaEllipsisH />
                </button>
                
                {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={handleDelete}
                            className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 flex items-center gap-3 text-sm font-medium transition-colors"
                        >
                            <FaTrash size={14} /> Delete Post
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-gray-300 text-sm whitespace-pre-wrap">{post.caption}</p>
        </div>
      )}

      {/* Media */}
      {post.mediaUrl && (
        <div className="w-full bg-black">
          {post.mediaType === 'video' ? (
            <video controls className="w-full max-h-[500px] object-contain">
              <source src={post.mediaUrl} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img 
              src={post.mediaUrl} 
              alt="Post content" 
              className="w-full max-h-[500px] object-contain"
            />
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center gap-6 border-t border-gray-800">
        <button 
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
        >
          <FaHeart />
          <span>{post.likes?.length || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors">
          <FaComment />
          <span>{post.comments?.length || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-green-400 transition-colors">
          <FaShare />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default Post;
