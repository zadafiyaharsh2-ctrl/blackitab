import { useEffect, useRef, useState } from 'react';
import {
  FaBan,
  FaBuilding,
  FaCog,
  FaEllipsisV,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFlag,
  FaPen,
  FaShareAlt
} from 'react-icons/fa';

const OwnerControls = ({ onEditProfile, onCopyProfileLink, onOpenSettings }) => (
  <div className="flex flex-wrap justify-center lg:justify-end gap-3 shrink-0">
    <button
      onClick={onEditProfile}
      className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 px-6 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm"
    >
      <FaPen size={14} /> Edit Profile
    </button>
    <button
      onClick={onCopyProfileLink}
      className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 px-4 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm"
      title="Copy Profile Link"
    >
      <FaShareAlt size={14} />
    </button>
    <button
      onClick={onOpenSettings}
      className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 px-4 py-2.5 rounded-xl font-semibold transition-colors flex items-center gap-2 text-sm"
      title="Profile Settings"
    >
      <FaCog size={14} />
    </button>
  </div>
);

const VisitorControls = ({
  followState,
  onMessage,
  onFollow,
  onUnfollowRequest,
  onReportUser,
  onBlockUser
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('touchstart', closeOnOutsideClick);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('touchstart', closeOnOutsideClick);
    };
  }, []);

  const followActionLabel =
    followState === 'following' ? 'Following' : followState === 'requested' ? 'Requested' : 'Follow';

  const followAction =
    followState === 'following'
      ? onUnfollowRequest
      : followState === 'requested'
        ? null
        : onFollow;

  const followActionClassName =
    followState === 'following'
      ? 'bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300'
      : followState === 'requested'
        ? 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600';

  return (
    <div className="flex flex-wrap justify-center lg:justify-end items-center gap-3 shrink-0">
      <button
        onClick={onMessage}
        className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 p-3 rounded-xl transition-colors"
        title="Message"
      >
        <FaEnvelope size={18} />
      </button>

      <button
        onClick={followAction || undefined}
        disabled={!followAction}
        className={`${followActionClassName} px-8 py-2.5 rounded-xl font-semibold transition-colors`}
      >
        {followActionLabel}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 p-3 rounded-xl transition-colors"
          title="More actions"
        >
          <FaEllipsisV size={14} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-lg overflow-hidden z-20">
            <button
              onClick={() => {
                setMenuOpen(false);
                onReportUser();
              }}
              className="w-full px-3 py-2.5 text-left text-sm text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center gap-2"
            >
              <FaFlag size={12} /> Report
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onBlockUser();
              }}
              className="w-full px-3 py-2.5 text-left text-sm text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
            >
              <FaBan size={12} /> Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileActions = ({
  isOwnProfile,
  followState,
  onEditProfile,
  onCopyProfileLink,
  onOpenSettings,
  onMessage,
  onFollow,
  onUnfollowRequest,
  onReportUser,
  onBlockUser
}) => {
  if (isOwnProfile) {
    return (
      <OwnerControls
        onEditProfile={onEditProfile}
        onCopyProfileLink={onCopyProfileLink}
        onOpenSettings={onOpenSettings}
      />
    );
  }

  return (
    <VisitorControls
      followState={followState}
      onMessage={onMessage}
      onFollow={onFollow}
      onUnfollowRequest={onUnfollowRequest}
      onReportUser={onReportUser}
      onBlockUser={onBlockUser}
    />
  );
};

const ProfileHeader = ({
  user,
  isOwnProfile,
  onlineUsers,
  connectionsCount,
  onViewConnections,
  onEditProfile,
  onCopyProfileLink,
  onMessage,
  onFollow,
  onUnfollowRequest,
  onJoinInstitute,
  onOpenInstitute,
  onOpenSettings,
  onReportUser,
  onBlockUser
}) => {
  const isOnline = onlineUsers.includes(user._id) || onlineUsers.includes(user.id);
  const followState = user.isFollowing ? 'following' : user.isRequested ? 'requested' : 'not-following';

  return (
    <header className="mb-10">
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
          <div className="flex-shrink-0 relative">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 shadow-md">
              <div className="w-full h-full rounded-full border-4 border-black bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl sm:text-6xl font-bold text-gray-700 dark:text-gray-300 select-none">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {isOnline && (
              <div className="absolute bottom-3 right-3 w-5 h-5 bg-green-500 border-2 border-black rounded-full" title="Online"></div>
            )}
          </div>

          <div className="flex-1 w-full space-y-5 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-1 break-words">
                  {user.name}
                </h1>

                {user.bio ? (
                  <p className="text-gray-700 dark:text-gray-300 max-w-2xl text-sm leading-relaxed">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No bio added yet.</p>
                )}
              </div>

              <ProfileActions
                isOwnProfile={isOwnProfile}
                followState={followState}
                onEditProfile={onEditProfile}
                onCopyProfileLink={onCopyProfileLink}
                onOpenSettings={onOpenSettings}
                onMessage={onMessage}
                onFollow={onFollow}
                onUnfollowRequest={onUnfollowRequest}
                onReportUser={onReportUser}
                onBlockUser={onBlockUser}
              />
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 pt-2">
              {user.institute ? (
                <div
                  onClick={onOpenInstitute}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl cursor-pointer hover:border-orange-400 dark:hover:border-orange-400 transition-colors group"
                >
                  <FaBuilding className="text-orange-500 text-sm" />
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-300">{user.institute.name}</span>
                  <FaExternalLinkAlt className="text-orange-400/70 text-[10px]" />
                </div>
              ) : isOwnProfile ? (
                <button
                  onClick={onJoinInstitute}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors"
                >
                  <FaBuilding className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">No institute joined</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">Join</span>
                </button>
              ) : user.instituteId ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
                  <FaBuilding className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Member of an institute</span>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={onViewConnections}
                className="text-left rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2.5 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors"
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Connections</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{connectionsCount}</p>
              </button>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Followers</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{user.followerCount || 0}</p>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Following</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{user.followingCount || 0}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
