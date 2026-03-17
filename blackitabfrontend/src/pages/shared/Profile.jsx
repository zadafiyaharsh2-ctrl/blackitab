import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaCog, FaTh, FaBookmark, FaUserTag, FaSearch, FaBell, FaEnvelope, FaPen, FaHeart, FaComment, FaPlay, FaLock, FaRupeeSign, FaArrowLeft, FaShareAlt, FaBuilding, FaSignInAlt, FaTimes, FaExternalLinkAlt, FaChartLine, FaFire, FaCheckCircle } from 'react-icons/fa';
import API_URL from '../../config';
import usePageTitle from '../../hooks/usePageTitle';
import toast from 'react-hot-toast';

import { SearchModal, NotificationModal } from '../../components/student/SocialModals';
import PostDetailModal from '../../components/student/PostDetailModal';
import StudentHomeContent from '../../components/student/StudentHomeContent';
import ActivityHeatmap from '../../components/student/ActivityHeatmap.jsx';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';
import JoinInstituteModal from '../../components/student/modals/JoinInstituteModal';
import { useSocketContext } from '../../context/SocketContext';

import EditProfileModal from '../../components/shared/EditProfileModal';
const Profile = () => {
  usePageTitle('Profile');
  const { userId } = useParams(); // Get userId from URL parameters
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;

    // If visiting a specific profile that isn't mine, start empty to avoid flashing my data
    if (userId && parsedUser && userId !== parsedUser._id && userId !== parsedUser.id) {
      return null;
    }
    return parsedUser;
  });
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const [isMyProfile, setIsMyProfile] = useState(true);

  // State for Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJoinInstituteModal, setShowJoinInstituteModal] = useState(false);

  // State for Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // State for Notifications
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    action: null,
    id: null,
    title: '',
    message: ''
  });

  // Stats and Heatmap for Overview Tab
  const [stats, setStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const showStudentProgress = user?.role === 'student';
  const showHeatmap = showStudentProgress;

  // Get online users from Socket Context
  const { onlineUsers } = useSocketContext();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

      if (token) {
        try {
          // Determine if we are fetching "me" or another "user"
          // If userId param is present AND generic "user" logic is needed

          let endpoint = `${API_URL}/api/me`;
          let viewingMyProfile = true;

          if (userId && userId !== 'undefined' && storedUser && userId !== storedUser._id && userId !== storedUser.id) {
            endpoint = `${API_URL}/api/social/user/${userId}`;
            viewingMyProfile = false;
          } else if (userId === 'undefined') {
            // Redirect to clean profile if undefined
            navigate('/profile');
            return;
          }

          setIsMyProfile(viewingMyProfile);

          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            setUser(response.data.user);
            // If viewing MY profile, update local storage to keep it fresh
            if (viewingMyProfile) {
              localStorage.setItem('user', JSON.stringify(response.data.user));
              // Ensure URL is unique/shareable
              if (!userId) {
                window.history.replaceState(null, '', `/profile/${response.data.user.id}`);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          if (error.response && error.response.status === 401) {
            navigate('/login');
          }
          if (error.response && error.response.status === 404) {
            toast.error('User not found');
            navigate('/dashboard');
          }
        }
      } else {
        navigate('/login');
      }
    };

    // Clear previous posts immediately when switching profiles
    setPosts([]);
    fetchProfile();
  }, [navigate, userId]);

  // Fetch Stats for Overview
  useEffect(() => {
    const fetchStats = async () => {
      const targetId = user?._id || user?.id;
      if (!targetId) return;
      const token = localStorage.getItem('token');
      try {
        setLoadingStats(true);
        const requests = [
          axios.get(`${API_URL}/api/progress/stats?userId=${targetId}`, { headers: { Authorization: `Bearer ${token}` } })
        ];

        if (showHeatmap) {
          requests.push(
            axios.get(`${API_URL}/api/progress/heatmap?userId=${targetId}`, { headers: { Authorization: `Bearer ${token}` } })
          );
        }

        const [statsRes, heatmapRes] = await Promise.all(requests);
        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (showHeatmap && heatmapRes?.data?.success) {
          setHeatmapData(heatmapRes.data.data);
        } else {
          setHeatmapData([]);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    if (user) {
      fetchStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHeatmap, user?._id, user?.id]);

  // List Navigation Handlers
  const fetchFollowers = () => {
    const targetId = user._id || user.id;
    if (!targetId) {
      toast.error('User ID missing. Please refresh.');
      return;
    }
    navigate(`/network/${targetId}/followers`);
  };

  const fetchFollowing = () => {
    const targetId = user._id || user.id;
    if (!targetId) {
      toast.error('User ID missing. Please refresh.');
      return;
    }
    navigate(`/network/${targetId}/following`);
  };

  const executeUnfollowRequest = async (targetId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/social/unfollow/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update Lists (optimistic)
      setSearchResults(prev => prev.map(u => u._id === targetId ? { ...u, isFollowing: false } : u));

      // Update Stats
      if (isMyProfile) {
        // If on my profile, my "following" count decreases
        setUser(prev => ({ ...prev, followingCount: Math.max(0, (prev.followingCount || 0) - 1) }));
      } else if (user._id === targetId) {
        // If on their profile, their "follower" count decreases AND button toggles
        setUser(prev => ({
          ...prev,
          followerCount: Math.max(0, (prev.followerCount || 0) - 1),
          isFollowing: false
        }));
      }

    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  const handleUnfollowRequest = (targetId) => {
    setConfirmState({
      isOpen: true,
      action: executeUnfollowRequest,
      id: targetId,
      title: 'Unfollow User',
      message: 'Are you sure you want to unfollow?'
    });
  };

  // Search Logic (Debounce could be added here for better perf)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/social/search?query=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setSearchResults(res.data.data);
        }
      } catch (err) { console.error(err); }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);



  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Logic handled by effect, but keeping handler for form submit ref
  };

    const handleFollowRequest = async (targetId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/social/follow/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message || 'Follow status updated!');

      const isAccepted = res.data.status === 'accepted';

      // Update Lists
      setSearchResults(prev => prev.map(u => u._id === targetId ? { ...u, isRequested: !isAccepted, isFollowing: isAccepted, followerCount: isAccepted ? (u.followerCount || 0) + 1 : u.followerCount } : u));

      // Update Stats (Optimistic)
      if (user._id === targetId || user.id === targetId) {
        setUser(prev => ({ 
           ...prev, 
           isRequested: !isAccepted,
           isFollowing: isAccepted,
           followerCount: isAccepted ? (prev.followerCount || 0) + 1 : prev.followerCount
        }));
      }
    } catch (err) {
      console.error('Follow error:', err);
      toast.error(err.response?.data?.message || 'Error following user');
    }
  };

  const handleAcceptFollow = async (senderId) => {
    // console.log("Accepting:", senderId, noteId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/social/accept-follow/${senderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update UI
      setNotifications(prev => prev.map(n =>
        (n.sender && n.sender._id === senderId) ? { ...n, isAccepted: true } : n
      ));

      // Refresh profile to update counts
      const userRes = await axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.data.success) setUser(userRes.data.user);

      toast.success('Request Accepted!');

    } catch (err) {
      console.error('Accept error:', err);
      toast.error('Failed to accept: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectFollow = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/social/reject-follow/${senderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => n.sender && n.sender._id !== senderId));
      toast.success('Request Deleted!');

    } catch (err) {
      console.error('Reject error:', err);
      toast.error('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };


  // Placeholder data for stats and content
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.id]);

  const fetchPosts = async () => {
    const targetId = user?._id || user?.id;
    if (!targetId) return;

    try {
      setLoadingPosts(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/posts/user/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPosts(res.data.data);
        // Debug: Log posts with their contentType
        console.log('Profile: Fetched posts:', res.data.data.map(p => ({
          id: p._id,
          contentType: p.contentType,
          title: p.title,
          caption: p.caption?.substring(0, 30)
        })));
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };



  // Logic to handle Private Account Display
  const showPrivateMessage = posts.length === 0 && !loadingPosts && !isMyProfile && user?.isPrivate && !user?.isFollowing;



  if (!user) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen text-gray-900 dark:text-white p-4 py-8 relative overflow-hidden font-sans">

      <div className="max-w-6xl mx-auto relative z-10">

      {/* MODALS */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        query={searchQuery}
        setQuery={setSearchQuery}
        onSearch={handleSearchSubmit}
        results={searchResults}
        onFollow={handleFollowRequest}
        currentUserId={user.id}
      />

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onAccept={handleAcceptFollow}
        onReject={handleRejectFollow}
        onFollowBack={handleFollowRequest}
      />

      <SimpleConfirmationModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false, id: null, action: null })}
        onConfirm={() => {
          if (confirmState.action && confirmState.id) {
            confirmState.action(confirmState.id);
          }
          setConfirmState({ ...confirmState, isOpen: false, id: null, action: null });
        }}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Confirm"
        isDanger={true}
      />

      {/* TOP NAVIGATION BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6 w-full z-20">

        {!isMyProfile && (
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-white border border-gray-300 dark:bg-white/5 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors group flex-shrink-0 shadow-sm"
            title="Go Back"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" size={18} />
          </button>
        )}

        {/* Search Bar - Prominent & Centered */}
        <div className="relative w-full md:flex-1 max-w-2xl group z-20">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search for creators..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="w-full bg-white dark:bg-gray-900/80 border border-gray-300 dark:border-gray-700 rounded-full py-3 pl-12 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all backdrop-blur-sm shadow-sm"
          />

          {/* Live Search Dropdown */}
          {showDropdown && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-30 max-h-80 overflow-y-auto custom-scrollbar">
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div
                    key={result._id}
                    className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-800 last:border-0"
                    onClick={() => {
                      navigate(`/profile/${result._id}`);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <span className="font-bold text-gray-700 dark:text-gray-300">{result.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{result.name}</div>
                      <div className="text-xs text-blue-400 truncate">@user</div>
                    </div>
                    {!result.isFollowing && String(result._id) !== String(user._id || user.id) && (
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white">Follow</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-600 dark:text-gray-400 text-sm">No users found</div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions (Notifications & Settings) */}
        <div className="flex items-center gap-4">
          {isMyProfile && (
            <>
              <button
                onClick={() => navigate('/notifications')}
                className="hidden md:block relative p-3 rounded-full bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-colors group">
                <FaBell size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* PROFILE HEADER CARD */}
      <header className="relative mb-16">
        {/* Decorative Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-3xl blur-3xl -z-10 opacity-60"></div>

        <div className="glass-panel border-white/5 rounded-2xl md:rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-[0_0_50px_rgba(59,130,246,0.1)] flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-16 relative overflow-hidden group">
          {/* Subtle internal shine */}
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Profile Picture */}
          <div className="flex-shrink-0 relative group">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full p-1 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
              <div className="w-full h-full rounded-full border-4 border-black bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-bold text-gray-700 dark:text-gray-300 select-none">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {(onlineUsers.includes(user._id) || onlineUsers.includes(user.id)) && (
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-black rounded-full shadow-lg" title="Online"></div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="flex-1 text-center md:text-left space-y-6 w-full">

            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 w-full">
              <div className="text-center md:text-left flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 break-words">{user.name}</h1>
                {!isMyProfile && user.institute?.name && (
                  <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 md:justify-start">
                    <FaBuilding className="text-xs text-orange-500" />
                    <span>Joined to {user.institute.name}</span>
                  </div>
                )}
                {user.bio && (
                  <p className="text-gray-700 dark:text-gray-300 max-w-lg text-sm leading-relaxed mb-4">{user.bio}</p>
                )}
              </div>

              {/* Edit Profile (For Owner) */}
              {isMyProfile && (
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4 md:mb-0">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2 text-sm"
                  >
                    <FaPen size={14} /> Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/profile/${user._id}`);
                      toast.success('Profile link copied!');
                    }}
                    className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2 text-sm"
                    title="Copy Profile Link"
                  >
                    <FaShareAlt size={14} />
                  </button>
                </div>
              )}

              {/* Follow Actions (For Visitors) */}
              {!isMyProfile && (
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 shrink-0">
                  <button
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 p-3 rounded-xl transition-all shadow-sm"
                    title="Message">
                    <FaEnvelope size={18} className="text-gray-700 dark:text-gray-300" />
                  </button>
                  {user.isFollowing ? (
                    <button
                      onClick={() => handleUnfollowRequest(user._id)}
                      className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 px-8 py-2.5 rounded-xl font-semibold transition-all shadow-sm">
                      Following
                    </button>
                  ) : user.isRequested ? (
                    <button
                      disabled
                      className="bg-white dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-8 py-2.5 rounded-xl font-semibold transition-all shadow-sm cursor-not-allowed">
                      Requested
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollowRequest(user._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-semibold shadow-sm transition-colors">
                      Follow
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="max-w-2xl text-gray-700 dark:text-gray-300 text-base leading-relaxed font-light mx-auto md:mx-0">
              {/* Bio Content */}
            </div>

            {/* Institute Badge */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-4">
              {user.institute ? (
                <div
                  onClick={() => {
                    const isInstituteRole = ['institute_admin', 'institute', 'hod', 'teacher'].includes(user.role);
                    navigate(isInstituteRole ? '/institute/profile' : '/institute-view');
                  }}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-500/20 rounded-xl cursor-pointer hover:border-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all group"
                >
                  <FaBuilding className="text-orange-500 text-sm" />
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 group-hover:text-orange-500 dark:group-hover:text-orange-300 transition-colors">{user.institute.name}</span>
                  <FaExternalLinkAlt className="text-orange-400/50 text-[10px] group-hover:text-orange-400 transition-colors" />
                </div>
              ) : isMyProfile ? (
                <button
                  onClick={() => setShowJoinInstituteModal(true)}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                >
                  <FaBuilding className="text-gray-400 group-hover:text-blue-400 transition-colors text-sm" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors">No institute joined</span>
                  <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">Join</span>
                </button>
              ) : user.instituteId ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
                  <FaBuilding className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Member of an institute</span>
                </div>
              ) : null}
            </div>

            {/* Stats Grid */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 sm:gap-10 md:gap-14 pt-6 border-t border-gray-200 dark:border-white/5 mt-2">
              <div onClick={fetchFollowing} className="cursor-pointer group text-center md:text-left transition-all hover:-translate-y-1">
                <span className="block text-3xl font-black text-gray-900 dark:text-white group-hover:text-glow group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all">{user.followingCount || 0}</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider group-hover:text-gray-700 dark:text-gray-300 transition-colors">Following</span>
              </div>
              <div className="w-px h-10 bg-white/10 hidden md:block"></div>
              <div onClick={fetchFollowers} className="cursor-pointer group text-center md:text-left transition-all hover:-translate-y-1">
                <span className="block text-3xl font-black text-gray-900 dark:text-white group-hover:text-glow group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all">{user.followerCount || 0}</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider group-hover:text-gray-700 dark:text-gray-300 transition-colors">Followers</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* POSTS SECTION */}
      <div className="mt-8 border-t border-gray-200 dark:border-white/5 pt-8">
        <div className="flex items-center justify-start md:justify-center gap-6 md:gap-12 border-b border-gray-200 dark:border-gray-800 pb-0 mb-6 overflow-x-auto w-full hide-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors relative ${activeTab === 'overview' ? 'text-gray-900 border-gray-900 dark:text-white border-t dark:border-white -mt-[1px]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <FaChartLine size={12} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors relative ${activeTab === 'posts' ? 'text-gray-900 border-gray-900 dark:text-white border-t dark:border-white -mt-[1px]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <FaTh size={12} /> Posts
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            {loadingStats ? (
              <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
            ) : (
              <>
                {/* Stats row */}
                 {showStudentProgress && (
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">Rank</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white">{stats?.rank || 'Unranked'}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">Total XP</div>
                        <div className="text-2xl font-black text-blue-500 dark:text-blue-400">{stats?.totalPoints || 0}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">Current Streak</div>
                        <div className="text-2xl font-black text-orange-500 dark:text-orange-400">{stats?.streak || 0} <FaFire className="inline" /></div>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-1">Solved</div>
                        <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{stats?.totalCompleted || 0}</div>
                      </div>
                   </div>
                 )}
                
                {showHeatmap && (
                  <div className="bg-white dark:bg-[#080808] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Activity Heatmap</h3>
                    <ActivityHeatmap data={heatmapData} />
                  </div>
                )}

                {/* Recent Activity */}
                {stats?.recentActivity?.length > 0 && (
                  <div className="bg-white dark:bg-[#080808] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {stats.recentActivity.map((act, i) => (
                        <div key={i} className="flex items-center gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${act.type === 'completed' || act.completed ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                             <FaCheckCircle />
                          </div>
                          <div>
                            <div className="text-gray-900 dark:text-white font-medium">{act.topicId?.title || act.title || 'Completed a task'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(act.completedAt || act.attemptedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isMyProfile && user?.role === 'student' && (
                  <div className="space-y-4">
                    <div className="pt-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student Workspace</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your previous dashboard content now lives inside your profile.</p>
                    </div>
                    <StudentHomeContent embedded />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {loadingPosts ? (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading posts...</div>
        ) : posts.filter(p => p.contentType === 'post' || !p.contentType).length > 0 ? (
          <div className="grid gap-4 grid-cols-3 gap-1 md:gap-4">
            {posts
              .filter(p => p.contentType === 'post' || !p.contentType)
              .map(post => (
                <div
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  className="relative aspect-square group cursor-pointer bg-white dark:bg-gray-900 overflow-hidden"
                >
                  {/* Media Thumbnail */}
                  {post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={post.mediaUrl} alt="Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  )}

                  {/* Video Indicator */}
                  {post.mediaType === 'video' && (
                    <div className="absolute top-2 right-2 text-white drop-shadow-md">
                      <FaPlay size={16} />
                    </div>
                  )}

                  {/* Hover Overlay */}
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
        ) : showPrivateMessage ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full border-4 border-gray-300 dark:border-white/10 flex items-center justify-center mb-6 bg-gray-100 dark:bg-white/5">
              <FaLock size={40} className="text-white/50" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">This Account is Private</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">Follow this account to see their photos and videos.</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share Photos</div>
            <div className="text-gray-600 dark:text-gray-400 mb-6 text-sm">When you share photos, they will appear on your profile.</div>
            {isMyProfile && (
              <button onClick={() => navigate('/create-post')} className="text-blue-400 font-semibold text-sm hover:text-white transition-colors">
                Share your first photo
              </button>
            )}
          </div>
        )}
      </div>

      {selectedPost && (
        <PostDetailModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onPostDeleted={(postId) => {
            setPosts(prev => prev.filter(p => p._id !== postId));
            setSelectedPost(null);
          }}
        />
      )}

      {showSearch && <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />}
      {showNotifications && <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />}
      <EditProfileModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        user={user} 
        onUpdate={(updatedUser) => {
          setUser(prev => ({ ...prev, ...updatedUser }));
          // Update local storage if it's me
          if (isMyProfile) {
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, ...updatedUser }));
          }
        }}
      />

      {/* Join Institute Modal */}
      <JoinInstituteModal
        isOpen={showJoinInstituteModal}
        onClose={() => setShowJoinInstituteModal(false)}
        user={user}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onUpdate={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...updatedUser }));
        }}
      />
    </div>
    </div>
  );
};

export default Profile;
