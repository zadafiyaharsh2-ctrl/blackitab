import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaChartLine, FaTh } from 'react-icons/fa';
import toast from 'react-hot-toast';

import usePageTitle from '../../hooks/usePageTitle';
import useProfileData from '../../hooks/profile/useProfileData';
import { useSocketContext } from '../../context/SocketContext';

import ProfileNav from '../../components/profile/ProfileNav';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileInsights from '../../components/profile/ProfileInsights';
import ProfilePosts from '../../components/profile/ProfilePosts';

import PostDetailModal from '../../components/student/PostDetailModal';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';
import JoinInstituteModal from '../../components/student/modals/JoinInstituteModal';
import EditProfileModal from '../../components/shared/EditProfileModal';

const DEFAULT_CLASSES_INSTITUTE_MESSAGE = 'You must join an institute before joining any class.';

const Profile = () => {
  usePageTitle('Profile');

  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { onlineUsers } = useSocketContext();

  const [activeTab, setActiveTab] = useState('insights');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJoinInstituteModal, setShowJoinInstituteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null
  });

  const {
    user,
    profileData,
    isOwnProfile,
    profileLoading,
    insightsLoading,
    visiblePosts,
    loadingPosts,
    showPrivateMessage,
    batchPreview,
    notifications,
    unreadNotifications,
    recentNotifications,
    connectionsPreview,
    contentStats,
    departmentList,
    profileCompletion,
    connectionsCount,
    searchQuery,
    setSearchQuery,
    searchResults,
    showDropdown,
    setShowDropdown,
    viewerUserId,
    followUser,
    unfollowUser,
    updateUserFromEdit,
    removePost
  } = useProfileData({ userId, navigate });

  useEffect(() => {
    if (!location.state?.openJoinInstituteModal) return;

    const redirectMessage =
      location.state.instituteRequiredMessage || DEFAULT_CLASSES_INSTITUTE_MESSAGE;

    toast.error(redirectMessage);
    Promise.resolve().then(() => setShowJoinInstituteModal(true));

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  const handleUnfollowRequest = (targetId) => {
    setConfirmState({
      isOpen: true,
      title: 'Unfollow User',
      message: 'Are you sure you want to unfollow?',
      action: async () => {
        try {
          await unfollowUser(targetId);
        } catch (error) {
          console.error('Unfollow error:', error);
          toast.error(error.response?.data?.message || 'Failed to unfollow');
        }
      }
    });
  };

  const handleOpenInstitute = () => {
    const isInstituteRole = ['institute_admin', 'institute', 'hod', 'teacher'].includes(user?.role);
    navigate(isInstituteRole ? '/institute/profile' : '/institute-view');
  };

  const handleViewConnections = () => {
    const targetId = user?._id || user?.id;
    if (!targetId) {
      toast.error('User ID missing. Please refresh.');
      return;
    }
    navigate(`/network/${targetId}/followers`);
  };

  const handleOpenClass = (classId) => {
    if (!classId) return;

    const isTeachingRole = ['teacher', 'hod', 'institute', 'institute_admin'].includes(user?.role);
    navigate(isTeachingRole ? `/teacher/batch/${classId}` : `/classes/${classId}`);
  };

  const handleOpenClasses = () => {
    const isTeachingRole = ['teacher', 'hod', 'institute', 'institute_admin'].includes(user?.role);
    navigate(isTeachingRole ? '/teacher/batches' : '/classes');
  };

  if (profileLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#05000a]">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05000a] text-gray-900 dark:text-white p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <ProfileNav
          isOwnProfile={isOwnProfile}
          currentUserId={viewerUserId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          notificationsCount={notifications.length}
          onBack={() => navigate(-1)}
          onOpenNotifications={() => navigate('/notifications')}
          onOpenProfile={(targetId) => navigate(`/profile/${targetId}`)}
          onFollow={followUser}
          onUnfollowRequest={handleUnfollowRequest}
        />

        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          onlineUsers={onlineUsers}
          connectionsCount={connectionsCount}
          onViewConnections={handleViewConnections}
          onEditProfile={() => setShowEditModal(true)}
          onCopyProfileLink={() => {
            navigator.clipboard.writeText(`${window.location.origin}/profile/${user._id || user.id}`);
            toast.success('Profile link copied!');
          }}
          onMessage={() => navigate(`/messages/${user._id || user.id}`)}
          onFollow={() => followUser(user._id || user.id)}
          onUnfollowRequest={() => handleUnfollowRequest(user._id || user.id)}
          onJoinInstitute={() => setShowJoinInstituteModal(true)}
          onOpenInstitute={handleOpenInstitute}
          onOpenSettings={() => toast.success('Settings panel will be available soon.')}
          onReportUser={() => toast.success('Report submitted. Our team will review this profile.')}
          onBlockUser={() => toast.success('User blocked successfully.')}
        />

        <div className="mt-6 border-t border-gray-200 dark:border-white/10 pt-6">
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 mb-6">
            <div className="flex items-center gap-6 md:gap-10 overflow-x-auto w-full hide-scrollbar">
              <button
                onClick={() => setActiveTab('insights')}
                className={`pb-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors ${activeTab === 'insights' ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <FaChartLine size={12} /> Insights
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors ${activeTab === 'posts' ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <FaTh size={12} /> Posts
              </button>
            </div>

            {isOwnProfile && activeTab === 'posts' && (
              <button
                onClick={() => navigate('/create-post')}
                className="mb-3 shrink-0 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
              >
                {visiblePosts.length > 0 ? 'Share another post' : 'Share first post'}
              </button>
            )}
          </div>

          {activeTab === 'insights' && (
            <ProfileInsights
              profileData={profileData}
              departmentList={departmentList}
              profileCompletion={profileCompletion}
              contentStats={contentStats}
              connectionsPreview={connectionsPreview}
              batchPreview={batchPreview}
              isOwnProfile={isOwnProfile}
              insightsLoading={insightsLoading}
              recentNotifications={recentNotifications}
              unreadNotifications={unreadNotifications}
              heatmapUserId={user?._id || user?.id}
              onOpenClass={handleOpenClass}
              onOpenClasses={handleOpenClasses}
              onOpenProfile={(targetId) => navigate(`/profile/${targetId}`)}
            />
          )}

          {activeTab === 'posts' && (
            <ProfilePosts
              visiblePosts={visiblePosts}
              loadingPosts={loadingPosts}
              showPrivateMessage={showPrivateMessage}
              isOwnProfile={isOwnProfile}
              onCreatePost={() => navigate('/create-post')}
              onSelectPost={setSelectedPost}
            />
          )}
        </div>

        {selectedPost && (
          <PostDetailModal
            isOpen={!!selectedPost}
            onClose={() => setSelectedPost(null)}
            post={selectedPost}
            onPostDeleted={(postId) => {
              removePost(postId);
              setSelectedPost(null);
            }}
          />
        )}

        <SimpleConfirmationModal
          isOpen={confirmState.isOpen}
          onClose={() =>
            setConfirmState({
              isOpen: false,
              title: '',
              message: '',
              action: null
            })
          }
          onConfirm={async () => {
            if (confirmState.action) {
              await confirmState.action();
            }
            setConfirmState({
              isOpen: false,
              title: '',
              message: '',
              action: null
            });
          }}
          title={confirmState.title}
          message={confirmState.message}
          confirmText="Confirm"
          isDanger={true}
        />

        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onUpdate={updateUserFromEdit}
        />

        <JoinInstituteModal
          isOpen={showJoinInstituteModal}
          onClose={() => setShowJoinInstituteModal(false)}
          user={user}
        />
      </div>
    </div>
  );
};

export default Profile;
