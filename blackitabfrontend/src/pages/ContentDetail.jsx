import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { FaArrowLeft, FaHeart, FaComment, FaShare, FaUser, FaRegHeart, FaPaperPlane, FaEllipsisH, FaBookmark, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import toast from 'react-hot-toast';

const ContentDetail = () => {
    const { contentId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentLikes, setCommentLikes] = useState({});
    const [showMenu, setShowMenu] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [relatedContent, setRelatedContent] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [relatedFilter, setRelatedFilter] = useState('all');
    const commentInputRef = useRef(null);


    useEffect(() => {
        fetchContent();
    }, [contentId]);

    const fetchContent = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/posts/content/${contentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const contentData = response.data.data;
                setContent(contentData);
                // Set initial states
                setIsFollowing(contentData.isFollowing || false);

                if (currentUser) {
                    setLiked(contentData.likes?.includes(currentUser._id || currentUser.id));
                    // Init comment likes from data
                    const likesMap = {};
                    (contentData.comments || []).forEach(c => {
                        likesMap[c._id] = {
                            liked: (c.likes || []).some(id => id === (currentUser._id || currentUser.id)),
                            count: (c.likes || []).length
                        };
                    });
                    setCommentLikes(likesMap);
                }
                // Fetch related content based on type
                fetchRelated(contentData.contentType);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelated = async (type) => {
        try {
            const token = localStorage.getItem('token');
            // Determine endpoint based on content type
            const endpoint = type === 'study-content'
                ? `${API_URL}/api/posts/study-content`
                : `${API_URL}/api/posts/feed`;

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Filter out current post and limit to 10
                const filtered = response.data.data
                    .filter(post => post._id !== contentId)
                    .slice(0, 10);
                setRelatedContent(filtered);
            }
        } catch (error) {
            console.error('Error fetching related content:', error);
        }
    };

    const handleFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            const newStatus = !isFollowing;
            setIsFollowing(newStatus);

            // Determine endpoint
            const endpoint = newStatus
                ? `${API_URL}/api/social/follow/${content.user._id}`
                : `${API_URL}/api/social/unfollow/${content.user._id}`;

            await axios.post(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Optionally update local follower count
            setContent(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    followerCount: newStatus
                        ? (prev.user.followerCount || 0) + 1
                        : Math.max(0, (prev.user.followerCount || 0) - 1)
                }
            }));
        } catch (error) {
            console.error('Follow error:', error);
            setIsFollowing(!isFollowing); // Revert
        }
    };

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            // Optimistic update
            const newLikedState = !liked;
            setLiked(newLikedState);

            setContent(prev => ({
                ...prev,
                likes: newLikedState
                    ? [...(prev.likes || []), currentUser._id]
                    : (prev.likes || []).filter(id => id !== currentUser._id)
            }));

            if (newLikedState) {
                await axios.put(`${API_URL}/api/posts/like/${contentId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.put(`${API_URL}/api/posts/unlike/${contentId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Like error:', error);
            // Revert on error
            setLiked(!liked);
            fetchContent(); // Refresh to get server state
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setCommentLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/posts/comment/${contentId}`,
                { text: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setContent(prev => ({
                    ...prev,
                    comments: response.data.comments
                }));
                setCommentText('');
            }
        } catch (error) {
            console.error('Comment error:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleCommentLike = async (commentId) => {
        const prev = commentLikes[commentId] || { liked: false, count: 0 };
        // Optimistic update
        setCommentLikes(m => ({
            ...m,
            [commentId]: { liked: !prev.liked, count: prev.liked ? prev.count - 1 : prev.count + 1 }
        }));
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/posts/${contentId}/comments/${commentId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch {
            // Revert on error
            setCommentLikes(m => ({ ...m, [commentId]: prev }));
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Could not copy link');
            console.error('Failed to copy:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this content?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_URL}/api/posts/${contentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate(-1);
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    const isOwner = currentUser && content && (currentUser.id === content.user?._id || currentUser._id === content.user?._id);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-900 dark:text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-gray-900 dark:text-white gap-4">
                <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">Content not found</h2>
                <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-gray-900 dark:text-white font-sans selection:bg-blue-500/30">

            {/* Standard Sticky Header */}
            <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-gray-300 dark:border-white/10 px-4 md:px-6 py-3 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-900 dark:text-white"
                >
                    <FaArrowLeft />
                </button>
                <div className="font-semibold text-lg truncate flex-1">
                    {content.title}
                </div>
                {/* Owner Menu */}
                {isOwner && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaEllipsisH />
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#222] rounded-xl shadow-xl border border-gray-300 dark:border-white/10 overflow-hidden z-50 py-1">
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-100 dark:bg-white/5 text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <FaEllipsisH /> Delete Content
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="max-w-[1700px] mx-auto p-4 md:p-6 lg:grid lg:grid-cols-[1fr_400px] gap-6 items-start">

                {/* LEFT COLUMN: Main Content */}
                <div className="flex flex-col gap-4">

                    {/* VIDEO PLAYER */}
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-white/5 relative group">
                        {content.mediaType === 'video' ? (
                            <video
                                key={content.mediaUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            >
                                <source src={content.mediaUrl} />
                            </video>
                        ) : (
                            <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-contain" />
                        )}
                    </div>

                    {/* TITLE */}
                    <h1 className="text-xl md:text-2xl font-bold mt-2">{content.title}</h1>

                    {/* ACTIONS & METADATA ROW */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-300 dark:border-white/10 pb-4">
                        <div className="flex items-center gap-4">
                            {/* User Info */}
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center text-sm font-bold">
                                {content.user?.profileImage ? (
                                    <img src={content.user.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    content.user?.name?.[0]
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-base">{content.user?.name}</h3>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {content.user?.followerCount || 0} Followers
                                </div>
                            </div>

                            {/* Follow Button - Hidden for Owner */}
                            {!isOwner && (
                                <button
                                    onClick={handleFollow}
                                    className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ml-4 ${isFollowing
                                        ? 'bg-[#222] text-gray-900 dark:text-white hover:bg-[#333]'
                                        : 'bg-white text-black hover:bg-gray-200'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                            <div className="flex bg-[#222] rounded-full overflow-hidden">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors border-r border-gray-200 dark:border-white/5 ${liked ? 'text-gray-900 dark:text-white' : 'text-gray-200'}`}
                                >
                                    {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                                    <span className="font-medium text-sm">{content.likes?.length || 0}</span>
                                </button>
                                <button onClick={() => toast.success('Feedback noted! Thank you.')} className="px-3 py-2 hover:bg-white/10 transition-colors text-gray-200 hover:text-gray-900 dark:text-white" title="Dislike">
                                    <FaEllipsisH className="rotate-90" size={14} />
                                </button>
                            </div>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] rounded-full font-medium text-sm transition-colors text-gray-200 hover:text-gray-900 dark:text-white"
                            >
                                <FaShare /> Share
                            </button>

                            {isOwner && (
                                <button
                                    onClick={() => setShowPlaylistModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] rounded-full font-medium text-sm transition-colors text-gray-200 hover:text-gray-900 dark:text-white"
                                >
                                    <FaBookmark /> Save
                                </button>
                            )}
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="bg-[#222] rounded-xl p-4 text-sm cursor-pointer hover:bg-[#2a2a2a] transition-colors">
                        <div className="flex gap-2 font-bold mb-2">
                            <span>{content.views || 0} views</span>
                            <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                            {content.description}
                        </p>
                    </div>

                    {/* COMMENTS SECTION */}
                    <div className="mt-6">
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="text-xl font-bold">Comments</h3>
                            <span className="text-gray-600 dark:text-gray-400">{content.comments?.length}</span>
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-4 mb-8">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                                {currentUser?.name?.[0] || "U"}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                    ref={commentInputRef}
                                    placeholder="Add a comment..."
                                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 pb-1 focus:border-white focus:outline-none transition-colors text-sm mb-2"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setCommentText('')} className="text-sm font-medium px-3 py-1.5 rounded-full hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors">Cancel</button>
                                    <button
                                        onClick={handleComment}
                                        disabled={!commentText.trim() || commentLoading}
                                        className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${commentText.trim() ? 'bg-blue-600 text-black hover:bg-blue-500' : 'bg-[#222] text-gray-500 cursor-not-allowed'}`}
                                    >
                                        Comment
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {content.comments?.map((comment, index) => {
                                const cLike = commentLikes[comment._id] || { liked: false, count: (comment.likes || []).length };
                                return (
                                    <div key={comment._id || index} className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#222] shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
                                            {comment.user?.profileImage ? (
                                                <img src={comment.user.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                comment.user?.name?.[0]
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{comment.user?.name}</span>
                                                <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.text}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <button
                                                    onClick={() => handleCommentLike(comment._id)}
                                                    className={`flex items-center gap-1 text-xs transition-colors ${cLike.liked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                >
                                                    {cLike.liked ? <FaHeart /> : <FaRegHeart />} {cLike.count || 0}
                                                </button>
                                                <button onClick={() => { commentInputRef.current?.focus(); setCommentText(`@${comment.user?.name} `); }} className="text-xs font-semibold px-2 py-1 rounded-full hover:bg-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Reply</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar / Recommendations */}
                <div className="hidden lg:block space-y-4">
                    {/* Filter Buttons */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        <button onClick={() => setRelatedFilter('all')} className={`${relatedFilter === 'all' ? 'bg-white text-black' : 'bg-[#222] text-gray-900 dark:text-white hover:bg-[#333]'} px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors`}>All</button>
                        <button onClick={() => setRelatedFilter('author')} className={`${relatedFilter === 'author' ? 'bg-white text-black' : 'bg-[#222] text-gray-900 dark:text-white hover:bg-[#333]'} px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap`}>From {content.user?.name}</button>
                        <button onClick={() => setRelatedFilter('related')} className={`${relatedFilter === 'related' ? 'bg-white text-black' : 'bg-[#222] text-gray-900 dark:text-white hover:bg-[#333]'} px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap`}>Related</button>
                    </div>

                    {/* Real Recommended List */}
                    {(relatedFilter === 'author' ? relatedContent.filter(p => p.user?._id === content.user?._id) : relatedContent).length > 0 ? (
                        (relatedFilter === 'author' ? relatedContent.filter(p => p.user?._id === content.user?._id) : relatedContent).map((post) => (
                            <div
                                key={post._id}
                                onClick={() => {
                                    navigate(`/content/${post._id}`);
                                    window.scrollTo(0, 0);
                                }}
                                className="flex gap-2 cursor-pointer group"
                            >
                                <div className="w-40 aspect-video bg-[#222] rounded-lg overflow-hidden shrink-0 relative">
                                    {post.mediaType === 'video' ? (
                                        <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                                    )}
                                    {post.mediaType === 'video' && <div className="absolute bottom-1 right-1 bg-black/80 text-gray-900 dark:text-white text-[10px] font-bold px-1 rounded">Video</div>}
                                </div>
                                <div className="flex flex-col gap-1 min-w-0">
                                    <h4 className="text-sm font-bold leading-tight line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-400 transition-colors">
                                        {post.title || post.caption || "Untitled"}
                                    </h4>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">{post.user?.name || "Unknown User"}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-2 animate-pulse">
                                    <div className="w-40 h-24 bg-[#222] rounded-lg"></div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-[#222] rounded w-3/4"></div>
                                        <div className="h-3 bg-[#222] rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {showPlaylistModal && (
                <AddToPlaylistModal
                    isOpen={showPlaylistModal}
                    onClose={() => setShowPlaylistModal(false)}
                    contentId={contentId}
                />
            )}
        </div>
    );
};

export default ContentDetail;
