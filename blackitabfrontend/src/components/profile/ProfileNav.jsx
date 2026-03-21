import { useEffect, useRef } from 'react';
import { FaArrowLeft, FaBell, FaSearch, FaTimes } from 'react-icons/fa';

const ProfileNav = ({
  isOwnProfile,
  currentUserId,
  searchQuery,
  setSearchQuery,
  searchResults,
  showDropdown,
  setShowDropdown,
  notificationsCount,
  onBack,
  onOpenNotifications,
  onOpenProfile,
  onFollow,
  onUnfollowRequest
}) => {
  const searchContainerRef = useRef(null);
  const sameUserId = (a, b) => String(a || '') === String(b || '');

  useEffect(() => {
    const handleOutsidePress = (event) => {
      if (!searchContainerRef.current) return;
      if (!searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsidePress);
    document.addEventListener('touchstart', handleOutsidePress);

    return () => {
      document.removeEventListener('mousedown', handleOutsidePress);
      document.removeEventListener('touchstart', handleOutsidePress);
    };
  }, [setShowDropdown]);

  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-4 mb-8 md:mb-10">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="flex items-center gap-3 min-w-[220px]">
          {!isOwnProfile && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title="Go Back"
            >
              <FaArrowLeft className="text-gray-700 dark:text-gray-200" size={15} />
            </button>
          )}

          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 font-semibold">Profile Search</p>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">Discover classmates and creators</h2>
          </div>
        </div>

        <div className="relative flex-1" ref={searchContainerRef}>
          <div className="relative flex items-center rounded-2xl bg-gray-50 dark:bg-[#0e121a] border border-gray-200 dark:border-white/15 focus-within:border-blue-500 transition-colors">
            <div className="pl-4 pr-2 text-gray-500 dark:text-gray-300">
              <FaSearch size={14} />
            </div>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-transparent py-3.5 pl-1 pr-24 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
            />

            {searchQuery && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearchQuery('');
                  setShowDropdown(false);
                }}
                className="absolute right-3 p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Clear search"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {showDropdown && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/15 rounded-2xl shadow-lg dark:shadow-[0_14px_40px_rgba(0,0,0,0.45)] overflow-hidden z-[120] max-h-80 overflow-y-auto custom-scrollbar">
              {searchResults.length > 0 ? (
                searchResults.map((result) => {
                  const resultId = result?._id || result?.id;
                  const isCurrentUser = sameUserId(resultId, currentUserId);

                  return (
                  <div
                    key={resultId || result.name}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors border-b border-gray-100 dark:border-white/10 last:border-0"
                    onClick={() => {
                      if (!resultId) return;
                      onOpenProfile(resultId);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {result.profileImage ? (
                        <img src={result.profileImage} alt={result.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-white text-sm">{result.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{result.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                        {result.email || 'No email'}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {result.followerCount || 0} followers{result.bio ? ` · ${result.bio.substring(0, 30)}` : ''}
                      </div>
                    </div>

                    {!isCurrentUser ? (
                      result.isFollowing ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!resultId) return;
                            onUnfollowRequest(resultId);
                          }}
                          className="text-xs bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 hover:border-red-300 dark:hover:border-red-400/60 hover:text-red-600 dark:hover:text-red-300 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-100 font-semibold transition-all"
                        >
                          Following
                        </button>
                      ) : result.isRequested ? (
                        <span className="text-xs bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-100 font-semibold">Requested</span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!resultId) return;
                            onFollow(resultId);
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-white font-semibold transition-all"
                        >
                          Follow
                        </button>
                      )
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-100 font-semibold">You</span>
                    )}
                  </div>
                );})
              ) : (
                <div className="p-4 text-center text-gray-600 dark:text-gray-200 text-sm">No users found</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          {isOwnProfile && (
            <button
              onClick={onOpenNotifications}
              className="relative p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <FaBell size={18} className="text-gray-700 dark:text-gray-200" />
              {notificationsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileNav;
