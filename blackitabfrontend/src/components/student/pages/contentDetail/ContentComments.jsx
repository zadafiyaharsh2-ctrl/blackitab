import React, { useRef } from 'react';
import { FaHeart, FaRegHeart, FaPaperPlane } from 'react-icons/fa';

const ContentComments = ({ 
  comments, 
  commentText, 
  setCommentText, 
  commentLoading, 
  commentLikes, 
  currentUser, 
  onComment, 
  onCommentLike 
}) => {
  const commentInputRef = useRef(null);

  return (
    <div className="pt-8 border-t border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-3 mb-8">
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Discourse</h3>
        <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold shadow-inner">
          {comments?.length || 0}
        </span>
      </div>

      {/* Input Area */}
      <div className="flex gap-4 mb-10 items-start">
        <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-lg font-black text-gray-600 dark:text-white shrink-0 shadow-sm relative overflow-hidden">
           {currentUser?.profileImage 
              ? <img src={currentUser.profileImage} className="w-full h-full object-cover" alt="" />
              : (currentUser?.name?.[0]?.toUpperCase() || "U")
           }
        </div>
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onComment()}
            ref={commentInputRef}
            placeholder="Contribute to the discussion..."
            className="w-full bg-transparent border-b-2 border-gray-200 dark:border-white/10 py-2 focus:border-[#0061FF] focus:outline-none transition-colors text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400"
          />
          <div className="flex justify-end gap-2">
            {commentText.trim() && (
              <button 
                onClick={() => setCommentText('')} 
                className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors focus:outline-none"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onComment}
              disabled={!commentText.trim() || commentLoading}
              className={`text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-all flex items-center gap-2 focus:outline-none ${
                commentText.trim() 
                  ? 'bg-[#0061FF] text-white shadow-md hover:bg-[#004bcc] hover:-translate-y-0.5' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              <FaPaperPlane className="text-[10px]" /> Post
            </button>
          </div>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-8">
        {comments?.map((comment, index) => {
          const cLike = commentLikes[comment._id] || { liked: false, count: (comment.likes || []).length };
          return (
            <div key={comment._id || index} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 shrink-0 overflow-hidden flex items-center justify-center text-sm font-black text-gray-600 dark:text-gray-300">
                {comment.user?.profileImage ? (
                  <img src={comment.user.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  comment.user?.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-white block truncate max-w-full">
                    {comment.user?.name}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed font-serif text-pretty">
                  {comment.text}
                </p>
                
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => onCommentLike(comment._id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all focus:outline-none hover:-translate-y-0.5 ${
                      cLike.liked ? 'text-rose-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {cLike.liked ? <FaHeart /> : <FaRegHeart />} 
                    <span>{cLike.count || 0}</span>
                  </button>
                  <button 
                    onClick={() => { commentInputRef.current?.focus(); setCommentText(`@${comment.user?.name} `); }} 
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 transition-colors focus:outline-none opacity-0 md:opacity-100 group-hover:opacity-100"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentComments;
