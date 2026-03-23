import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaSearch, FaTimes } from 'react-icons/fa';
import API_URL from '../../config';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';
import usePageTitle from '../../hooks/usePageTitle';
import toast from 'react-hot-toast';
import SocialUserCard from '../../components/student/pages/socialList/SocialUserCard';

const SkeletonCard = () => (
  <div className="flex items-center justify-between py-5 px-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-white/10" />
      <div className="space-y-2">
        <div className="w-32 h-4 rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="w-20 h-3 rounded-lg bg-gray-200 dark:bg-white/10" />
      </div>
    </div>
    <div className="w-24 h-9 rounded-full bg-gray-200 dark:bg-white/10" />
  </div>
);

const SocialListPage = () => {
  const { userId, type } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(type === 'following' ? 'following' : 'followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOwner, setProfileOwner] = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false, action: null, id: null, title: '', message: '' });

  usePageTitle(activeTab === 'followers' ? 'Followers' : 'Following');
  const currentUser = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } }, []);
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    const fetchOwner = async () => {
      if (isOwnProfile) { setProfileOwner(currentUser); return; }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/social/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setProfileOwner(res.data.user);
      } catch { /* silent */ }
    };
    fetchOwner();
  }, [userId]);

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoadingFollowers(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/social/followers/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setFollowers(res.data.data);
      } catch (err) { console.error(err); toast.error('Failed to load followers'); }
      finally { setLoadingFollowers(false); }
    };
    fetchFollowers();
  }, [userId]);

  useEffect(() => {
    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/social/following/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setFollowing(res.data.data);
      } catch (err) { console.error(err); toast.error('Failed to load following'); }
      finally { setLoadingFollowing(false); }
    };
    fetchFollowing();
  }, [userId]);

  useEffect(() => { window.history.replaceState(null, '', `/network/${userId}/${activeTab}`); }, [activeTab, userId]);

  const handleFollow = async (targetId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/social/follow/${targetId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const isAccepted = res.data.status === 'accepted';
      toast.success(res.data.message || 'Follow status updated!');
      const updater = prev => prev.map(u => u._id === targetId ? { ...u, isFollowing: isAccepted, isRequested: !isAccepted } : u);
      setFollowers(updater); setFollowing(updater);
    } catch (err) { toast.error(err.response?.data?.message || 'Error following user'); }
  };

  const executeUnfollow = async (targetId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/social/unfollow/${targetId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Unfollowed successfully');
      const updater = prev => prev.map(u => u._id === targetId ? { ...u, isFollowing: false, isRequested: false } : u);
      setFollowers(updater); setFollowing(updater);
    } catch (err) { toast.error('Error unfollowing user'); }
  };

  const handleUnfollow = (targetId) => {
    setConfirmState({ isOpen: true, action: executeUnfollow, id: targetId, title: 'Unfollow User', message: 'Are you sure you want to unfollow this user?' });
  };

  const executeRemoveFollower = async (targetId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/social/remove-follower/${targetId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Follower removed');
      setFollowers(prev => prev.filter(u => u._id !== targetId));
    } catch (err) { toast.error(err.response?.data?.message || 'Error removing follower'); }
  };

  const handleRemoveFollower = (targetId) => {
    setConfirmState({ isOpen: true, action: executeRemoveFollower, id: targetId, title: 'Remove Follower', message: 'This will remove them from your followers. They can still follow you again later.' });
  };

  const activeList = activeTab === 'followers' ? followers : following;
  const isLoading = activeTab === 'followers' ? loadingFollowers : loadingFollowing;
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return activeList;
    const q = searchQuery.toLowerCase();
    return activeList.filter(u => u.name?.toLowerCase().includes(q));
  }, [activeList, searchQuery]);

  const ownerName = profileOwner?.name || '';

  return (
    <div className="relative overflow-hidden font-sans text-gray-900 dark:text-white min-h-[80vh]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 pt-4 sm:pt-8 px-2 sm:px-0">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button onClick={() => navigate(`/profile/${userId}`)} className="p-2.5 sm:p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full transition-colors group flex-shrink-0">
            <FaArrowLeft size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{isOwnProfile ? 'Your Network' : `${ownerName}'s Network`}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{followers.length} followers · {following.length} following</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 dark:bg-white/5 rounded-2xl p-1.5 border border-gray-200 dark:border-white/10">
          {['followers', 'following'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
              className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className={`ml-1.5 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                {tab === 'followers' ? followers.length : following.length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        {activeList.length > 0 && (
          <div className="relative mb-6 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
            </div>
            <input type="text" placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <FaTimes size={14} />
              </button>
            )}
          </div>
        )}

        {/* List */}
        <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-xl">
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              {searchQuery ? (
                <><div className="text-4xl sm:text-5xl mb-4">🔍</div><div className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2">No results found</div><div className="text-sm text-gray-500 dark:text-gray-400">No {activeTab} matching &ldquo;{searchQuery}&rdquo;</div></>
              ) : (
                <><div className="text-4xl sm:text-5xl mb-4">{activeTab === 'followers' ? '👥' : '🔗'}</div><div className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2">{activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}</div><div className="text-sm text-gray-500 dark:text-gray-400">{activeTab === 'followers' ? (isOwnProfile ? "When people follow you, they'll appear here." : "This user doesn't have any followers yet.") : (isOwnProfile ? 'People you follow will appear here.' : "This user isn't following anyone yet.")}</div></>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredList.map(u => (
                <SocialUserCard key={u._id} user={u} currentUserId={currentUserId} isOwnProfile={isOwnProfile} activeTab={activeTab} handleFollow={handleFollow} handleUnfollow={handleUnfollow} handleRemoveFollower={handleRemoveFollower} />
              ))}
            </div>
          )}
        </div>
      </div>

      <SimpleConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false, id: null, action: null })}
        onConfirm={() => { if (confirmState.action && confirmState.id) confirmState.action(confirmState.id); setConfirmState({ ...confirmState, isOpen: false, id: null, action: null }); }}
        title={confirmState.title} message={confirmState.message} confirmText="Confirm" isDanger={true}
      />
    </div>
  );
};

export default SocialListPage;
