import { FaArchive, FaComment, FaHeart, FaLock, FaPlay, FaRegEdit } from 'react-icons/fa';

const ProfilePosts = ({
  visiblePosts,
  loadingPosts,
  showPrivateMessage,
  isOwnProfile,
  onCreatePost,
  onSelectPost
}) => {
  if (loadingPosts) {
    return <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading posts...</div>;
  }

  if (visiblePosts.length > 0) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {visiblePosts.map((post) => (
          <div
            key={post._id}
            onClick={() => onSelectPost(post)}
            className="relative aspect-square group cursor-pointer bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden rounded-lg"
          >
            {post.mediaType === 'video' ? (
              <video src={post.mediaUrl} className="w-full h-full object-cover" />
            ) : (
              <img
                src={post.mediaUrl}
                alt="Post"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}

            {post.mediaType === 'video' && (
              <div className="absolute top-2 right-2 text-white drop-shadow-md">
                <FaPlay size={16} />
              </div>
            )}

            {isOwnProfile && (
              <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                {post.contentType === 'study-content' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/90 text-white">
                    Study
                  </span>
                )}
                {post.contentType === 'paid-content' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-600/90 text-white">
                    Paid
                  </span>
                )}
                {(post.status === 'draft' || post.isDraft) && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700/90 text-white flex items-center gap-1">
                    <FaRegEdit size={9} /> Draft
                  </span>
                )}
                {(post.status === 'archived' || post.isArchived) && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-700/90 text-white flex items-center gap-1">
                    <FaArchive size={9} /> Archived
                  </span>
                )}
                {(post.isPrivate || post.visibility === 'private') && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800/90 text-white flex items-center gap-1">
                    <FaLock size={9} /> Private
                  </span>
                )}
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6 md:gap-8 backdrop-blur-[2px]">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <FaHeart />
                <span>{post.likes?.length || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <FaComment />
                <span>{post.comments?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (showPrivateMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 rounded-full border-4 border-gray-300 dark:border-white/10 flex items-center justify-center mb-6 bg-gray-100 dark:bg-white/5">
          <FaLock size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">This Account is Private</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm">Follow this account to see their photos and videos.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {isOwnProfile ? 'Share Photos' : 'No Posts Yet'}
      </div>
      <div className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
        {isOwnProfile
          ? 'When you share photos, they will appear on your profile.'
          : 'This user has not shared any public posts yet.'}
      </div>
      {isOwnProfile && (
        <button
          onClick={onCreatePost}
          className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
        >
          Share your first post
        </button>
      )}
    </div>
  );
};

export default ProfilePosts;
