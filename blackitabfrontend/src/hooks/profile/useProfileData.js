import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../../config';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getToken = () => localStorage.getItem('token');

const sameUserId = (a, b) => String(a || '') === String(b || '');

export default function useProfileData({ userId, navigate }) {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [insightsLoading, setInsightsLoading] = useState(false);
  const [followersPreview, setFollowersPreview] = useState([]);
  const [followingPreview, setFollowingPreview] = useState([]);
  const [batchPreview, setBatchPreview] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postAccess, setPostAccess] = useState({ isPrivate: false, canViewPosts: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const viewerUserId = useMemo(() => {
    const storedUser = getStoredUser();
    return storedUser?._id || storedUser?.id || null;
  }, []);

  const isMyProfile = useMemo(() => {
    const storedUser = getStoredUser();
    return (
      !userId ||
      (storedUser && (sameUserId(userId, storedUser._id) || sameUserId(userId, storedUser.id)))
    );
  }, [userId]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const viewingMyProfile = isMyProfile;
    Promise.resolve().then(() => setProfileLoading(true));

    const endpoint = viewingMyProfile
      ? `${API_URL}/api/me`
      : `${API_URL}/api/social/user/${userId}`;

    axios
      .get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!response.data?.success) return;

        const payloadUser = response.data.user;
        setUser(payloadUser);
        setProfileData(payloadUser);

        if (viewingMyProfile) {
          localStorage.setItem('user', JSON.stringify(payloadUser));
        }
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          navigate('/login');
          return;
        }

        if (error.response?.status === 404) {
          toast.error('User not found');
          navigate('/dashboard');
          return;
        }

        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      })
      .finally(() => {
        setProfileLoading(false);
      });
  }, [isMyProfile, navigate, userId]);

  useEffect(() => {
    const targetId = user?._id || user?.id;
    const token = getToken();
    if (!targetId || !token) return;

    const headers = { Authorization: `Bearer ${token}` };
    Promise.resolve().then(() => setInsightsLoading(true));

    const profileEndpoint = isMyProfile
      ? `${API_URL}/api/me`
      : `${API_URL}/api/social/user/${targetId}`;

    const requests = [
      axios.get(profileEndpoint, { headers }),
      axios.get(`${API_URL}/api/social/followers/${targetId}`, { headers }),
      axios.get(`${API_URL}/api/social/following/${targetId}`, { headers }),
      isMyProfile && user?.role === 'student'
        ? axios.get(`${API_URL}/api/user/batches`, { headers })
        : Promise.resolve(null),
      isMyProfile
        ? axios.get(`${API_URL}/api/social/notifications`, { headers })
        : Promise.resolve(null)
    ];

    Promise.allSettled(requests)
      .then(([profileResult, followersResult, followingResult, batchesResult, notificationsResult]) => {
        if (profileResult.status === 'fulfilled' && profileResult.value?.data?.success) {
          setProfileData(profileResult.value.data.user || null);
        }

        if (followersResult.status === 'fulfilled' && followersResult.value?.data?.success) {
          const followers = followersResult.value.data.users || followersResult.value.data.data || [];
          setFollowersPreview(followers.slice(0, 6));
        } else {
          setFollowersPreview([]);
        }

        if (followingResult.status === 'fulfilled' && followingResult.value?.data?.success) {
          const following = followingResult.value.data.users || followingResult.value.data.data || [];
          setFollowingPreview(following.slice(0, 6));
        } else {
          setFollowingPreview([]);
        }

        if (batchesResult.status === 'fulfilled' && batchesResult.value?.data?.success) {
          setBatchPreview((batchesResult.value.data.data || []).slice(0, 4));
        } else {
          setBatchPreview([]);
        }

        if (notificationsResult.status === 'fulfilled' && notificationsResult.value?.data?.success) {
          setNotifications(notificationsResult.value.data.data || []);
        } else if (isMyProfile) {
          setNotifications([]);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch profile insights:', error);
      })
      .finally(() => {
        setInsightsLoading(false);
      });
  }, [isMyProfile, user?._id, user?.id, user?.role]);

  useEffect(() => {
    const targetId = user?._id || user?.id;
    const token = getToken();
    if (!targetId || !token) return;

    Promise.resolve().then(() => {
      setPosts([]);
      setPostAccess({ isPrivate: false, canViewPosts: true });
      setLoadingPosts(true);
    });

    axios
      .get(`${API_URL}/api/posts/user/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (!res.data?.success) return;
        setPosts(res.data.data || []);
        setPostAccess({
          isPrivate: !!res.data.isPrivate,
          canViewPosts: res.data.canViewPosts !== false
        });
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setPosts([]);
          setPostAccess({ isPrivate: true, canViewPosts: false });
          return;
        }
        console.error('Error fetching posts:', err);
        setPostAccess({ isPrivate: false, canViewPosts: true });
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }, [user?._id, user?.id]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      Promise.resolve().then(() => setSearchResults([]));
      return;
    }

    const token = getToken();
    if (!token) return;

    const timer = setTimeout(() => {
      axios
        .get(`${API_URL}/api/social/search?query=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          if (res.data?.success) {
            setSearchResults(res.data.data || []);
          }
        })
        .catch((err) => {
          console.error('Search error:', err);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const followUser = useCallback(
    async (targetId) => {
      const token = getToken();
      if (!token) return;
      if (sameUserId(targetId, viewerUserId)) return;

      const res = await axios.post(
        `${API_URL}/api/social/follow/${targetId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const isAccepted = res.data?.status === 'accepted';

      setSearchResults((prev) =>
        prev.map((u) =>
          sameUserId(u._id, targetId)
            ? {
                ...u,
                isRequested: !isAccepted,
                isFollowing: isAccepted,
                followerCount: isAccepted ? (u.followerCount || 0) + 1 : u.followerCount
              }
            : u
        )
      );

      setUser((prev) => {
        if (!prev) return prev;
        if (!sameUserId(prev._id || prev.id, targetId)) return prev;

        return {
          ...prev,
          isRequested: !isAccepted,
          isFollowing: isAccepted,
          followerCount: isAccepted ? (prev.followerCount || 0) + 1 : prev.followerCount
        };
      });

      setProfileData((prev) => {
        if (!prev) return prev;
        if (!sameUserId(prev._id || prev.id, targetId)) return prev;

        return {
          ...prev,
          isRequested: !isAccepted,
          isFollowing: isAccepted,
          followerCount: isAccepted ? (prev.followerCount || 0) + 1 : prev.followerCount
        };
      });

      toast.success(res.data?.message || 'Follow status updated');
    },
    [viewerUserId]
  );

  const unfollowUser = useCallback(async (targetId) => {
    const token = getToken();
    if (!token) return;

    await axios.post(
      `${API_URL}/api/social/unfollow/${targetId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSearchResults((prev) =>
      prev.map((u) => (sameUserId(u._id, targetId) ? { ...u, isFollowing: false } : u))
    );

    setUser((prev) => {
      if (!prev) return prev;

      if (isMyProfile) {
        return {
          ...prev,
          followingCount: Math.max(0, (prev.followingCount || 0) - 1)
        };
      }

      if (sameUserId(prev._id || prev.id, targetId)) {
        return {
          ...prev,
          isFollowing: false,
          followerCount: Math.max(0, (prev.followerCount || 0) - 1)
        };
      }

      return prev;
    });

    setProfileData((prev) => {
      if (!prev) return prev;

      if (isMyProfile) {
        return {
          ...prev,
          followingCount: Math.max(0, (prev.followingCount || 0) - 1)
        };
      }

      if (sameUserId(prev._id || prev.id, targetId)) {
        return {
          ...prev,
          isFollowing: false,
          followerCount: Math.max(0, (prev.followerCount || 0) - 1)
        };
      }

      return prev;
    });

    toast.success('User unfollowed');
  }, [isMyProfile]);

  const updateUserFromEdit = useCallback(
    (updatedUser) => {
      setUser((prev) => ({ ...prev, ...updatedUser }));
      setProfileData((prev) => ({ ...prev, ...updatedUser }));

      if (!isMyProfile) return;

      const stored = getStoredUser() || {};
      localStorage.setItem('user', JSON.stringify({ ...stored, ...updatedUser }));
    },
    [isMyProfile]
  );

  const removePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((post) => !sameUserId(post._id, postId)));
  }, []);

  const visiblePosts = useMemo(() => {
    if (isMyProfile) return posts;
    return posts.filter((post) => post.contentType === 'post' || !post.contentType);
  }, [isMyProfile, posts]);

  const showPrivateMessage = useMemo(
    () =>
      !loadingPosts &&
      postAccess.isPrivate &&
      postAccess.canViewPosts === false,
    [loadingPosts, postAccess]
  );

  const contentStats = useMemo(
    () =>
      posts.reduce(
        (acc, post) => {
          const type = post.contentType || 'post';
          if (type === 'post') acc.regularPosts += 1;
          if (type === 'study-content') acc.studyContent += 1;
          if (type === 'paid-content') acc.paidContent += 1;
          if (post.mediaType === 'video') acc.videos += 1;
          if (post.mediaType === 'image') acc.images += 1;

          acc.likes += Array.isArray(post.likes) ? post.likes.length : 0;
          acc.comments += Array.isArray(post.comments) ? post.comments.length : 0;
          acc.views += Number(post.views || 0);
          return acc;
        },
        {
          regularPosts: 0,
          studyContent: 0,
          paidContent: 0,
          videos: 0,
          images: 0,
          likes: 0,
          comments: 0,
          views: 0
        }
      ),
    [posts]
  );

  const departmentList = useMemo(
    () => (Array.isArray(profileData?.departments) ? profileData.departments.filter(Boolean) : []),
    [profileData]
  );

  const profileCompletion = useMemo(() => {
    const signals = [
      !!profileData?.name,
      !!profileData?.bio,
      !!profileData?.profileImage,
      !!(profileData?.institute?._id || profileData?.instituteId),
      !!(profileData?.batchYear || profileData?.division || profileData?.specialization)
    ];

    return Math.round((signals.filter(Boolean).length / signals.length) * 100);
  }, [profileData]);

  const unreadNotifications = useMemo(
    () => notifications.filter((note) => !note?.read),
    [notifications]
  );

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  const connectionsPreview = useMemo(
    () => [...followersPreview, ...followingPreview].slice(0, 8),
    [followersPreview, followingPreview]
  );

  const connectionsCount = (user?.followingCount || 0) + (user?.followerCount || 0);

  return {
    user,
    profileData,
    isMyProfile,
    isOwnProfile: isMyProfile,
    profileLoading,
    insightsLoading,
    posts,
    postAccess,
    visiblePosts,
    loadingPosts,
    showPrivateMessage,
    followersPreview,
    followingPreview,
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
  };
}
