import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaUserMinus } from 'react-icons/fa';

const SocialUserCard = ({ user, currentUserId, isOwnProfile, activeTab, handleFollow, handleUnfollow, handleRemoveFollower }) => {
  const navigate = useNavigate();
  const isSelf = (currentUserId) === (user._id || user.id);

  return (
    <div
      key={user._id}
      className="flex items-center justify-between py-4 sm:py-5 hover:bg-gray-50 dark:hover:bg-white/[0.03] px-4 -mx-4 rounded-2xl transition-all cursor-pointer group"
      onClick={() => navigate(`/profile/${user._id}`)}
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {user.name}
            </span>
            {user.followsYou && !isSelf && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md flex-shrink-0">
                Follows you
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            {user.followerCount || 0} followers
            {user.bio && <span className="hidden sm:inline"> · {user.bio.substring(0, 40)}{user.bio.length > 40 ? '…' : ''}</span>}
          </div>
        </div>
      </div>

      {!isSelf && (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/messages/${user._id}`); }}
            className="hidden sm:flex p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-white/10"
            title="Message"
          >
            <FaEnvelope size={14} />
          </button>

          {user.isFollowing ? (
            <button onClick={(e) => { e.stopPropagation(); handleUnfollow(user._id); }} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs sm:text-sm font-bold transition-all text-gray-600 dark:text-gray-300">
              Following
            </button>
          ) : user.isRequested ? (
            <button disabled className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border border-gray-300 dark:border-gray-600 text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed">
              Requested
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); handleFollow(user._id); }} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.03]">
              Follow
            </button>
          )}

          {isOwnProfile && activeTab === 'followers' && (
            <button onClick={(e) => { e.stopPropagation(); handleRemoveFollower(user._id); }} className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30" title="Remove follower">
              <FaUserMinus size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialUserCard;
