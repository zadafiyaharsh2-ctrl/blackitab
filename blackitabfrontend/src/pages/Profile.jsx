import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaCog, FaTh, FaBookmark, FaUserTag, FaPlus, FaSearch, FaBell, FaEnvelope, FaPen, FaHeart, FaComment, FaPlay, FaLock, FaGraduationCap, FaRupeeSign, FaListUl, FaArrowLeft, FaShareAlt, FaBuilding, FaSignInAlt, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

import { SearchModal, NotificationModal, UserListModal } from '../components/SocialModals';
import PostDetailModal from '../components/PostDetailModal';
import EditProfileModal from '../components/EditProfileModal';
import StudyContentCard from '../components/StudyContentCard';
import PlaylistCard from '../components/PlaylistCard';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import { useSocketContext } from '../context/SocketContext';
import { motion } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();
  const [isMyProfile, setIsMyProfile] = useState(true);

  // State for Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJoinInstituteModal, setShowJoinInstituteModal] = useState(false);
  const [joinInstituteCode, setJoinInstituteCode] = useState('');
  const [joiningInstitute, setJoiningInstitute] = useState(false);

  // State for Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // State for User Lists (Followers/Following)
  const [showUserList, setShowUserList] = useState(false);
  const [userListTitle, setUserListTitle] = useState('');
  const [userList, setUserList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Get online users from Socket Context
  const { onlineUsers } = useSocketContext();

  // Helper to check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId) || onlineUsers.includes(user?.id) || onlineUsers.includes(user?._id);
  };

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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

  const handleUnfollowRequest = async (targetId) => {
    if (!window.confirm('Are you sure you want to unfollow?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/social/unfollow/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update Lists (optimistic)
      setUserList(prev => prev.map(u => u._id === targetId ? { ...u, isFollowing: false } : u));
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
      await axios.post(`${API_URL}/api/social/follow/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Follow request sent!');

      // Update Lists
      setSearchResults(prev => prev.map(u => u._id === targetId ? { ...u, isRequested: true } : u));
      setUserList(prev => prev.map(u => u._id === targetId ? { ...u, isRequested: true } : u));

      // Update Stats (Optimistic) - NO inc for pending request
      if (user._id === targetId) {
        setUser(prev => ({ ...prev, isRequested: true }));
      }
    } catch (err) {
      console.error('Follow error:', err);
      toast.error(err.response?.data?.message || 'Error following user');
    }
  };

  // Notification Logic
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/social/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
  };

  const handleAcceptFollow = async (senderId, noteId) => {
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
      fetchPlaylists();
    }
  }, [user?._id, user?.id]);

  const fetchPlaylists = async () => {
    // Playlist API not built yet, setting empty to avoid 404 error
    setPlaylists([]);
  };

  const handleDeletePlaylist = (deletedId) => {
    setPlaylists(prev => prev.filter(p => p._id !== deletedId));
  };

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
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>
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

      {/* TOP NAVIGATION BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6 w-full z-20">

        {!isMyProfile && (
          <button
            onClick={() => navigate('/profile')}
            className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white hover:bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white transition-colors border border-gray-300 dark:border-gray-700 hover:border-gray-500 group flex-shrink-0"
            title="Back to My Profile"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-400 group-hover:text-white" size={18} />
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
                className="relative p-3 rounded-full bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-colors group">
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

            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">{user.name}</h1>
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
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                  <button
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white hover:bg-gray-200 dark:hover:bg-gray-700 text-white p-3 rounded-xl border border-gray-300 dark:border-gray-700 transition-all shadow-lg"
                    title="Message">
                    <FaEnvelope size={18} />
                  </button>
                  {user.isFollowing ? (
                    <button
                      onClick={() => handleUnfollowRequest(user._id)}
                      className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white border border-gray-600 hover:border-red-500 hover:text-red-500 text-gray-700 dark:text-gray-300 px-8 py-2.5 rounded-xl font-semibold transition-all shadow-lg">
                      Following
                    </button>
                  ) : user.isRequested ? (
                    <button
                      disabled
                      className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white border border-gray-600 text-gray-600 dark:text-gray-400 px-8 py-2.5 rounded-xl font-semibold transition-all shadow-lg cursor-not-allowed">
                      Requested
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollowRequest(user._id)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all scale-100 hover:scale-[1.02] active:scale-95">
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
              <div className="w-px h-10 bg-white/10 hidden md:block"></div>
              <div className="group text-center md:text-left transition-all hover:-translate-y-1">
                <span className="block text-2xl font-bold text-gray-900 dark:text-white">{user.subscriberCount || 0}</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Subscribers</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* POSTS SECTION */}
      <div className="mt-8 border-t border-gray-200 dark:border-white/5 pt-8">
        <div className="flex items-center justify-start md:justify-center gap-6 md:gap-12 border-b border-gray-200 dark:border-gray-800 pb-0 mb-6 overflow-x-auto w-full hide-scrollbar">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors relative ${activeTab === 'posts' ? 'text-gray-900 border-gray-900 dark:text-white border-t dark:border-white -mt-[1px]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <FaTh size={12} /> Posts
          </button>
          <button
            onClick={() => setActiveTab('study-content')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors relative ${activeTab === 'study-content' ? 'text-gray-900 border-gray-900 dark:text-white border-t dark:border-white -mt-[1px]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <FaGraduationCap size={12} /> Study Content
          </button>
          <button
            onClick={() => setActiveTab('paid-content')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors relative ${activeTab === 'paid-content' ? 'text-gray-900 border-gray-900 dark:text-white border-t dark:border-white -mt-[1px]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <FaRupeeSign size={12} /> Paid Content
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`pb-4 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors relative ${activeTab === 'playlists' ? 'text-gray-900 border-gray-900 dark:text-white border-t dark:border-white -mt-[1px]' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <FaListUl size={12} /> Playlists
          </button>
        </div>

        {activeTab === 'playlists' ? (
          // PLAYLISTS TAB
          loadingPlaylists ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading playlists...</div>
          ) : playlists.length > 0 ? (
            <>
              {isMyProfile && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowCreatePlaylist(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FaPlus /> Create Playlist
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map(playlist => (
                  <PlaylistCard
                    key={playlist._id}
                    playlist={playlist}
                    onDelete={handleDeletePlaylist}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Playlists Yet</div>
              <div className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                {isMyProfile ? 'Create your first playlist to organize your videos' : 'This user has no playlists'}
              </div>
              {isMyProfile && (
                <button
                  onClick={() => setShowCreatePlaylist(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
                >
                  <FaPlus /> Create Playlist
                </button>
              )}
            </div>
          )
        ) : loadingPosts ? (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">Loading {activeTab === 'posts' ? 'posts' : 'study content'}...</div>
        ) : posts.filter(p => {
          if (activeTab === 'posts') return p.contentType === 'post' || !p.contentType;
          if (activeTab === 'study-content') return p.contentType === 'study-content';
          if (activeTab === 'paid-content') return p.contentType === 'paid-content';
          return false;
        }).length > 0 ? (
          <div className={`grid gap-4 ${activeTab === 'posts' ? 'grid-cols-3 gap-1 md:gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
            {posts
              .filter(p => {
                if (activeTab === 'posts') return p.contentType === 'post' || !p.contentType;
                if (activeTab === 'study-content') return p.contentType === 'study-content';
                if (activeTab === 'paid-content') return p.contentType === 'paid-content';
                return false;
              })
              .map(post => (
                activeTab === 'study-content' || activeTab === 'paid-content' ? (
                  <StudyContentCard key={post._id} content={post} />
                ) : (
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
                )
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

      {showCreatePlaylist && (
        <CreatePlaylistModal
          isOpen={showCreatePlaylist}
          onClose={() => setShowCreatePlaylist(false)}
          onPlaylistCreated={(newPlaylist) => {
            setPlaylists(prev => [newPlaylist, ...prev]);
          }}
        />
      )}

      {showSearch && <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />}
      {showNotifications && <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />}
      {showEditModal && (
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
      )}

      {/* Join Institute Modal */}
      {showJoinInstituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowJoinInstituteModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowJoinInstituteModal(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <FaTimes size={16} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
                <FaBuilding className="text-orange-500 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Join an Institute</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter the institute code provided by your institute</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Institute Code</label>
                <input
                  type="text"
                  value={joinInstituteCode}
                  onChange={e => setJoinInstituteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SURAT123"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-center text-lg font-bold tracking-widest uppercase mb-4"
                  autoFocus
                />
              </div>

              <div className={`grid ${user?.role === 'student' ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-2`}>
                {user?.role === 'student' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Batch Year</label>
                    <input
                      type="text"
                      value={joinBatchYear}
                      onChange={e => setJoinBatchYear(e.target.value)}
                      placeholder="e.g. 2025"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-center"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Department</label>
                  <input
                    type="text"
                    value={joinDepartments}
                    onChange={e => setJoinDepartments(e.target.value)}
                    placeholder="e.g. CS"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-center"
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!joinInstituteCode.trim()) return toast.error('Please enter an institute code');
                  if (user?.role === 'student' && !joinBatchYear.trim()) return toast.error('Please enter your batch year');
                  if (!joinDepartments.trim()) return toast.error('Please enter your department/division');

                  setJoiningInstitute(true);
                  try {
                    const token = localStorage.getItem('token');
                    const res = await axios.post(`${API_URL}/api/institute/join`, {
                      instituteCode: joinInstituteCode,
                      batchYear: joinBatchYear,
                      departments: joinDepartments
                    }, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.success) {
                      toast.success(res.data.message);
                      setShowJoinInstituteModal(false);
                      setJoinInstituteCode('');
                      setJoinBatchYear('');
                      setJoinDepartments('');
                    }
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to join institute');
                  } finally {
                    setJoiningInstitute(false);
                  }
                }}
                disabled={joiningInstitute || !joinInstituteCode.trim() || (user?.role === 'student' && !joinBatchYear.trim()) || !joinDepartments.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joiningInstitute ? (
                  <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Joining...</span></>
                ) : (
                  <><FaSignInAlt /><span>Join Institute</span></>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Profile;
