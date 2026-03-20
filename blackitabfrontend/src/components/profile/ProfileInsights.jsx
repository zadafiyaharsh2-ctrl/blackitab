import { FaBookmark, FaCheckCircle, FaCode, FaExternalLinkAlt, FaUserTag, FaUsers } from 'react-icons/fa';
import ActivityHeatmap from '../student/ActivityHeatmap';

const formatNotificationType = (type) => {
  const map = {
    follow_request: 'Follow Request',
    follow_accepted: 'Request Accepted',
    new_follower: 'New Follower'
  };
  return map[type] || 'Social Update';
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return 'Not available';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return 'Not available';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return 'just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const ProfileInsights = ({
  profileData,
  departmentList,
  profileCompletion,
  contentStats,
  connectionsPreview,
  batchPreview,
  isOwnProfile,
  insightsLoading,
  recentNotifications,
  unreadNotifications,
  heatmapUserId,
  onOpenProfile,
  onOpenClass,
  onOpenClasses
}) => {
  if (insightsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={`grid grid-cols-1 gap-4 ${isOwnProfile ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {isOwnProfile && (
          <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Account Status</p>
              <FaCheckCircle className={`${profileData?.isVerified ? 'text-emerald-500' : 'text-gray-400'}`} />
            </div>

            <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{profileCompletion}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Profile completion</p>

            <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Visibility</span>
                <span className="font-semibold text-gray-900 dark:text-white">{profileData?.isPrivate ? 'Private' : 'Public'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Verified</span>
                <span className={`font-semibold ${profileData?.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`}>
                  {profileData?.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Member Since</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatDateLabel(profileData?.createdAt)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Academic Identity</p>
            <FaCode className="text-blue-500" />
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-semibold text-gray-900 dark:text-white">{profileData?.role || 'student'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Institute</span>
              <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[170px] text-right">
                {profileData?.institute?.name || (profileData?.instituteId ? 'Joined' : 'Not joined')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Departments</span>
              <span className="font-semibold text-gray-900 dark:text-white">{departmentList.length || 0}</span>
            </div>
            {profileData?.batchYear && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Batch Year</span>
                <span className="font-semibold text-gray-900 dark:text-white">{profileData.batchYear}</span>
              </div>
            )}
            {profileData?.division && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Division</span>
                <span className="font-semibold text-gray-900 dark:text-white">{profileData.division}</span>
              </div>
            )}
            {profileData?.specialization && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Specialization</span>
                <span className="font-semibold text-gray-900 dark:text-white">{profileData.specialization}</span>
              </div>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Content Mix</p>
              <FaBookmark className="text-purple-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] p-3">
                <p className="text-[11px] text-gray-500">Posts</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{contentStats.regularPosts}</p>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] p-3">
                <p className="text-[11px] text-gray-500">Study Content</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{contentStats.studyContent}</p>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] p-3">
                <p className="text-[11px] text-gray-500">Paid Content</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{contentStats.paidContent}</p>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] p-3">
                <p className="text-[11px] text-gray-500">Videos</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{contentStats.videos}</p>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {contentStats.likes} likes · {contentStats.comments} comments · {contentStats.views} views
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Activity Heatmap</p>
          <span className="text-[11px] text-gray-500">Last 365 days</span>
        </div>
        <ActivityHeatmap targetUserId={heatmapUserId} />
      </div>

      <div className={`grid grid-cols-1 gap-4 ${isOwnProfile ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Network Preview</p>
            <FaUserTag className="text-cyan-500" />
          </div>

          {connectionsPreview.length > 0 ? (
            <div className="space-y-2">
              {connectionsPreview.slice(0, 4).map((person) => (
                <button
                  key={person._id}
                  onClick={() => onOpenProfile(person._id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center overflow-hidden text-white text-xs font-bold">
                    {person?.profileImage ? (
                      <img src={person.profileImage} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{person?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{person.name}</p>
                    <p className="text-xs text-gray-500 truncate">{person.bio || 'No bio yet'}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No network activity visible yet.</p>
          )}
        </div>

        {isOwnProfile && (
          <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Classes Joined</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold">
                  {batchPreview.length}
                </span>
                <FaUsers className="text-blue-500" />
              </div>
            </div>

            {batchPreview.length > 0 ? (
              <div className="space-y-2.5">
                {batchPreview.map((batch) => (
                  <button
                    key={batch._id}
                    type="button"
                    onClick={() => onOpenClass(batch._id)}
                    className="w-full text-left rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] p-3 hover:border-blue-300 dark:hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{batch.name || 'Classroom'}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                          {batch.classCode || 'No code'}
                        </span>
                        <FaExternalLinkAlt className="text-[10px] text-gray-500" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {batch.teacherIds?.length || 0} instructor{batch.teacherIds?.length === 1 ? '' : 's'} assigned
                    </p>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={onOpenClasses}
                  className="w-full mt-1 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-semibold py-2.5 transition-colors"
                >
                  View all classes
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">No joined classes found yet.</p>
                <button
                  type="button"
                  onClick={onOpenClasses}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-sm font-semibold py-2.5 transition-colors"
                >
                  Open classes
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Recent Notifications</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200 text-red-600 dark:border-red-500/30 dark:text-red-300 bg-red-50 dark:bg-red-500/10">
              {unreadNotifications.length} unread
            </span>
          </div>

          {recentNotifications.length > 0 ? (
            <div className="space-y-2.5">
              {recentNotifications.map((note) => (
                <div key={note._id} className="rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatNotificationType(note.type)}</p>
                    <span className="text-xs text-gray-500">{timeAgo(note.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {note.message || `${note.sender?.name || 'Someone'} sent you an update.`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileInsights;
