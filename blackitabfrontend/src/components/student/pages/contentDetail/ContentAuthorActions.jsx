import React from 'react';
import { FaHeart, FaRegHeart, FaShare, FaBookmark, FaEllipsisH } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ContentAuthorActions = ({ content, isOwner, isFollowing, liked, onFollow, onLike, onSave }) => {

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
      {/* Creator Profile */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 text-gray-600 font-black flex items-center justify-center flex-shrink-0">
          {content.user?.profileImage ? (
            <img src={content.user.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            content.user?.name?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">
            {content.user?.name}
          </h3>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
            {content.user?.followerCount || 0} Followers
          </div>
        </div>

        {!isOwner && (
          <button
            onClick={onFollow}
            className={`ml-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-4 focus:ring-[#0061FF]/20 ${
              isFollowing
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/20'
                : 'bg-[#0061FF] text-white hover:bg-[#004bcc] shadow-md hover:shadow-lg'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide flex-shrink-0 snap-x py-1">
        {/* Like Pill */}
        <div className="snap-center flex bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full overflow-hidden shadow-sm flex-shrink-0">
          <button
            onClick={onLike}
            className="flex items-center gap-2 px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-r border-gray-200 dark:border-white/10 focus:outline-none"
          >
            {liked ? <FaHeart className="text-rose-500 text-sm" /> : <FaRegHeart className="text-gray-600 dark:text-gray-300 text-sm" />}
            <span className={`font-bold text-sm ${liked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              {content.likes?.length || 0}
            </span>
          </button>
          <button 
            onClick={() => toast.success('Dislike interaction recorded.')} 
            className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none" 
            title="Dislike"
          >
            <FaEllipsisH className="rotate-90 text-[10px]" />
          </button>
        </div>

        <button
          onClick={handleShare}
          className="snap-center flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-gray-700 dark:text-gray-200 transition-all shadow-sm focus:outline-none whitespace-nowrap"
        >
          <FaShare className="text-xs" /> Share
        </button>

        {isOwner && (
          <button
            onClick={onSave}
            className="snap-center flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-gray-700 dark:text-gray-200 transition-all shadow-sm focus:outline-none whitespace-nowrap"
          >
            <FaBookmark className="text-xs" /> Save
          </button>
        )}
      </div>
    </div>
  );
};

export default ContentAuthorActions;
