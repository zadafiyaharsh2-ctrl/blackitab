import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import PageShimmer from '../../components/shared/PageShimmer';
import { FaArrowLeft, FaHeart, FaComment, FaShare, FaUser, FaRegHeart, FaPaperPlane, FaEllipsisH, FaBookmark, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AddToPlaylistModal from '../../components/student/AddToPlaylistModal';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';
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

    // Generic Confirmation Modal State
    const [confirmState, setConfirmState] = useState({
      isOpen: false,
      action: null,
      id: null,
      title: '',
      message: ''
    });


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

    const executeDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/posts/${contentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(-1);
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleDelete = () => {
        setConfirmState({
            isOpen: true,
            action: executeDelete,
            id: contentId,
            title: 'Delete Content',
            message: 'Are you sure you want to delete this content?'
        });
    };

    const isOwner = currentUser && content && (currentUser.id === content.user?._id || currentUser._id === content.user?._id);

    if (loading) return <PageShimmer variant="detail" />;

    if (!content) return <div className="text-center py-20 font-bold text-gray-500">Content not found or has been removed.</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white font-sans selection:bg-[#0061FF]/20 selection:text-gray-900">

      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 md:px-8 py-4 flex items-center gap-6 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="group flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-[#0061FF]/5 hover:border-[#0061FF]/30 transition-all focus:outline-none"
        >
          <FaArrowLeft className="text-gray-500 group-hover:text-[#0061FF] text-xs transition-colors" />
        </button>
        <div className="font-extrabold text-lg md:text-xl text-gray-900 dark:text-white truncate flex-1 tracking-tight">
          {content.title}
        </div>
        
        {/* Owner Menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="group w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-all focus:outline-none"
            >
              <FaEllipsisH className="text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-5 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-bold transition-colors flex items-center gap-3"
                  >
                    <FaTrash className="text-xs" /> Expunge Record
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-[85rem] mx-auto p-4 md:p-8 lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 items-start">

        {/* ======================= LEFT COLUMN ======================= */}
        <div className="flex flex-col gap-6 w-full min-w-0">

          {/* Media Player Container */}
          <div className="w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 relative group">
            {content.mediaType === 'video' ? (
              <video
                key={content.mediaUrl}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
                controlsList="nodownload"
              >
                <source src={content.mediaUrl} />
              </video>
            ) : (
              <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-contain bg-gray-100 dark:bg-[#0a0a0a]" />
            )}
          </div>

          <div className="px-1 space-y-6">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              {content.title}
            </h1>

            {/* Author Row & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
              
              {/* Creator Profile */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 text-gray-600 font-black flex items-center justify-center flex-shrink-0">
                  {content.user?.profileImage ? (
                    <img src={content.user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    content.user?.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px]">
                    {content.user?.name}
                  </h3>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                    {content.user?.followerCount || 0} Followers
                  </div>
                </div>

                {!isOwner && (
                  <button
                    onClick={handleFollow}
                    className={`ml-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-4 focus:ring-[#0061FF]/20 ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/20'
                        : 'bg-[#0061FF] text-white hover:bg-[#004bcc] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide flex-shrink-0 snap-x py-1">
                
                {/* Like Pill */}
                <div className="snap-center flex bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full overflow-hidden shadow-sm flex-shrink-0">
                  <button
                    onClick={handleLike}
                    className="flex items-center gap-2 px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-r border-gray-200 dark:border-white/10 focus:outline-none"
                  >
                    {liked ? <FaHeart className="text-rose-500 text-sm" /> : <FaRegHeart className="text-gray-600 dark:text-gray-300 text-sm" />}
                    <span className={`font-bold text-sm ${liked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {content.likes?.length || 0}
                    </span>
                  </button>
                  <button 
                    onClick={() => toast.success('Dislike interaction recorded.')} 
                    className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none" 
                    title="Dislike"
                  >
                    <FaEllipsisH className="rotate-90 text-[10px]" />
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="snap-center flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-gray-700 dark:text-gray-200 transition-all shadow-sm focus:outline-none whitespace-nowrap"
                >
                  <FaShare className="text-xs" /> Share
                </button>

                {isOwner && (
                  <button
                    onClick={() => setShowPlaylistModal(true)}
                    className="snap-center flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm text-gray-700 dark:text-gray-200 transition-all shadow-sm focus:outline-none whitespace-nowrap"
                  >
                    <FaBookmark className="text-xs" /> Save
                  </button>
                )}
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 cursor-text text-sm transition-all shadow-sm">
              <div className="flex gap-4 font-black mb-4 text-gray-900 dark:text-white items-center">
                <span className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full text-xs">{(content.views || 0).toLocaleString()} Views</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest">{new Date(content.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 font-serif text-[15px]">
                {content.description || 'No description provided.'}
              </p>
            </div>

            {/* ======================= COMMENTS ======================= */}
            <div className="pt-8 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Discourse</h3>
                <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold shadow-inner">
                  {content.comments?.length || 0}
                </span>
              </div>

              {/* Input Area */}
              <div className="flex gap-4 mb-10 items-start">
                <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-lg font-black text-gray-600 dark:text-white shrink-0 shadow-sm relative overflow-hidden">
                   {currentUser?.profileImage 
                      ? <img src={currentUser.profileImage} className="w-full h-full object-cover" alt="" />
                      : (currentUser?.name?.[0]?.toUpperCase() || "U")
                   }
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                    ref={commentInputRef}
                    placeholder="Contribute to the discussion..."
                    className="w-full bg-transparent border-b-2 border-gray-200 dark:border-white/10 py-2 focus:border-[#0061FF] focus:outline-none transition-colors text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <div className="flex justify-end gap-2">
                    {commentText.trim() && (
                      <button 
                        onClick={() => setCommentText('')} 
                        className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 transition-colors focus:outline-none"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || commentLoading}
                      className={`text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-all flex items-center gap-2 focus:outline-none ${
                        commentText.trim() 
                          ? 'bg-[#0061FF] text-white shadow-md hover:bg-[#004bcc] hover:-translate-y-0.5' 
                          : 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <FaPaperPlane className="text-[10px]" /> Post
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment List */}
              <div className="space-y-8">
                {content.comments?.map((comment, index) => {
                  const cLike = commentLikes[comment._id] || { liked: false, count: (comment.likes || []).length };
                  return (
                    <div key={comment._id || index} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 shrink-0 overflow-hidden flex items-center justify-center text-sm font-black text-gray-600 dark:text-gray-300">
                        {comment.user?.profileImage ? (
                          <img src={comment.user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          comment.user?.name?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-white block truncate max-w-full">
                            {comment.user?.name}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed font-serif text-pretty">
                          {comment.text}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => handleCommentLike(comment._id)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all focus:outline-none hover:-translate-y-0.5 ${
                              cLike.liked ? 'text-rose-500' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            {cLike.liked ? <FaHeart /> : <FaRegHeart />} 
                            <span>{cLike.count || 0}</span>
                          </button>
                          <button 
                            onClick={() => { commentInputRef.current?.focus(); setCommentText(`@${comment.user?.name} `); }} 
                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 transition-colors focus:outline-none opacity-0 md:opacity-100 group-hover:opacity-100"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ======================= RIGHT COLUMN ======================= */}
        <div className="hidden lg:flex flex-col gap-6 w-full sticky top-[6rem]">
          
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight px-1">Discover</h3>

          {/* Master Filters */}
          <div className="flex flex-wrap gap-2 px-1">
            <button 
              onClick={() => setRelatedFilter('all')} 
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#0061FF]/30 ${
                relatedFilter === 'all' 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                  : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              Feed
            </button>
            <button 
              onClick={() => setRelatedFilter('author')} 
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#0061FF]/30 ${
                relatedFilter === 'author' 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                  : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              Author
            </button>
            <button 
              onClick={() => setRelatedFilter('related')} 
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#0061FF]/30 ${
                relatedFilter === 'related' 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                  : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              Similar
            </button>
          </div>

          <div className="space-y-4 px-1 pb-10">
            {(relatedFilter === 'author' ? relatedContent.filter(p => p.user?._id === content.user?._id) : relatedContent).length > 0 ? (
              (relatedFilter === 'author' ? relatedContent.filter(p => p.user?._id === content.user?._id) : relatedContent).map((post) => (
                <div
                  key={post._id}
                  onClick={() => {
                      navigate(`/content/${post._id}`);
                      window.scrollTo(0, 0);
                  }}
                  className="flex gap-4 cursor-pointer group bg-white dark:bg-white/[0.02] border border-transparent dark:border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-md p-2 -mx-2 rounded-2xl transition-all duration-300 items-start"
                >
                  <div className="w-[160px] aspect-video bg-black rounded-xl overflow-hidden shrink-0 relative shadow-sm border border-gray-100 dark:border-white/5">
                    {post.mediaType === 'video' ? (
                      <video src={post.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <img src={post.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    {post.mediaType === 'video' && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest shadow border border-white/10">
                        Vid
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0 py-1">
                    <h4 className="text-[13px] font-bold leading-[1.3] text-gray-900 dark:text-white group-hover:text-[#0061FF] transition-colors line-clamp-2 mb-1.5 text-pretty">
                      {post.title || post.caption || "Untitled Publication"}
                    </h4>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">{post.user?.name || "Unknown Author"}</div>
                    <div className="text-[10px] font-medium text-gray-400 mt-0.5">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse px-2">
                    <div className="w-[160px] aspect-video bg-gray-200 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5"></div>
                    <div className="flex-1 space-y-3 py-1.5">
                      <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-full w-[90%]"></div>
                      <div className="h-3.5 bg-gray-200 dark:bg-white/10 rounded-full w-[60%]"></div>
                      <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full w-[40%] mt-3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          contentId={contentId}
        />
      )}

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
        confirmText="Execute Deletion"
        isDanger={true}
      />
    </div>
  );
};

export default ContentDetail;
