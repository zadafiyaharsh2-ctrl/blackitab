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
  <div className="flex flex-wrap items-center gap-3 shrink-0 mt-6 lg:mt-0">
    <button
      onClick={onCopyProfileLink}
      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 px-5 py-3 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
      title="Copy Profile Link"
    >
      <FaShareAlt size={14} />
      <span className="hidden sm:inline">Copy Link</span>
    </button>
    <button
      onClick={onEditProfile}
      className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 p-3.5 rounded-full font-semibold transition-colors flex items-center justify-center shadow-sm"
      title="Edit Profile"
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
      ? 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 shadow-sm'
      : followState === 'requested'
        ? 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none'
        : 'bg-[#0061FF] hover:opacity-90 text-white shadow-[0_4px_14px_0_rgba(0,97,255,0.2)] dark:shadow-none';

  return (
    <div className="flex flex-wrap items-center gap-3 shrink-0 mt-6 lg:mt-0">
      <button
        onClick={onMessage}
        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-[#0061FF] dark:text-gray-300 px-6 py-3 rounded-full flex items-center gap-2 font-bold tracking-wide transition-colors shadow-sm"
        title="Message"
      >
        <FaEnvelope size={14} /> Message
      </button>

      <button
        onClick={followAction || undefined}
        disabled={!followAction}
        className={`${followActionClassName} px-8 py-3 rounded-full font-bold tracking-wide transition-all`}
      >
        {followActionLabel}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 p-3.5 rounded-full transition-colors shadow-sm"
          title="More actions"
        >
          <FaEllipsisV size={14} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#0f0f0f] shadow-xl overflow-hidden z-20">
            <button
              onClick={() => {
                setMenuOpen(false);
                onReportUser();
              }}
              className="w-full px-4 py-3 text-left text-sm font-semibold tracking-wide text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <FaFlag size={12} /> Report User
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onBlockUser();
              }}
              className="w-full px-4 py-3 text-left text-sm font-semibold tracking-wide text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
            >
              <FaBan size={12} /> Block Account
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
    <header className="mb-10 font-sans">
      <div className="bg-[#f8f9fa] dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 sm:p-12 relative overflow-hidden">
        
        {/* Subtle Decorative Background Layer */}
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] rounded-full bg-gradient-to-bl from-[#0061FF]/3 to-transparent blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          
          {/* Avatar and Info Block */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 w-full lg:w-auto">
            
            {/* Avatar */}
            <div className="flex-shrink-0 relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] p-1.5 bg-white border border-gray-200 dark:border-white/10 dark:bg-[#0a0a0a] shadow-sm transform transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="w-full h-full rounded-[1.7rem] bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-transparent">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl font-black text-[#0061FF] dark:text-gray-300 select-none">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {isOnline && (
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-[#f8f9fa] dark:border-[#0a0a0a] rounded-full shadow-sm" title="Online"></div>
              )}
            </div>

            {/* Profile Identity */}
            <div className="flex-1 w-full space-y-4 text-left">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2 break-words leading-none">
                  {user.name}
                </h1>

                {user.bio ? (
                  <p className="text-gray-500 dark:text-gray-400 max-w-xl text-[15px] leading-relaxed font-medium">{user.bio}</p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-[15px] font-medium italic">Scholarly explorer and digital curator.</p>
                )}
              </div>

              {/* Institute Block */}
              <div className="pt-2">
                {user.institute ? (
                  <button
                    onClick={onOpenInstitute}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-[#0061FF]/30 dark:hover:border-white/20 transition-all group shadow-sm"
                  >
                    <FaBuilding className="text-[#0061FF] text-sm" />
                    <span className="text-[13px] font-bold tracking-wide text-gray-800 dark:text-gray-200">{user.institute.name}</span>
                    <FaExternalLinkAlt className="text-gray-400 group-hover:text-[#0061FF] transition-colors text-[10px] ml-1" />
                  </button>
                ) : isOwnProfile ? (
                  <button
                    onClick={onJoinInstitute}
                    className="inline-flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-[#0061FF] dark:hover:border-white/20 transition-all group shadow-sm"
                  >
                    <FaBuilding className="text-gray-400 text-sm group-hover:text-[#0061FF] transition-colors" />
                    <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">No institute joined</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-[#0061FF] px-2.5 py-1 rounded-md">Link Workspace</span>
                  </button>
                ) : user.instituteId ? (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm">
                    <FaBuilding className="text-gray-400 text-sm" />
                    <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">Member of an institute</span>
                  </div>
                ) : null}
              </div>

              {/* Stats Block (Tonal Layering instead of grid borders) */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-4">
                <button onClick={onViewConnections} className="group text-left">
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{connectionsCount}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#0061FF] mt-1 group-hover:underline">Connections</p>
                </button>

                <div className="text-left">
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{user.followerCount || 0}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1">Followers</p>
                </div>

                <div className="text-left">
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{user.followingCount || 0}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1">Following</p>
                </div>
              </div>
              
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full lg:w-auto flex lg:justify-end">
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

        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
