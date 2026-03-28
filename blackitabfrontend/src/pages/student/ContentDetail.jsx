import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../config';
import PageShimmer from '../../components/shared/PageShimmer';
import AddToPlaylistModal from '../../components/student/AddToPlaylistModal';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';
import toast from 'react-hot-toast';

import ContentHeader from '../../components/student/pages/contentDetail/ContentHeader';
import ContentAuthorActions from '../../components/student/pages/contentDetail/ContentAuthorActions';
import ContentComments from '../../components/student/pages/contentDetail/ContentComments';
import ContentDiscoverSidebar from '../../components/student/pages/contentDetail/ContentDiscoverSidebar';

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

    const [confirmState, setConfirmState] = useState({
      isOpen: false, action: null, id: null, title: '', message: ''
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
                setIsFollowing(contentData.isFollowing || false);

                if (currentUser) {
                    setLiked(contentData.likes?.includes(currentUser._id || currentUser.id));
                    const likesMap = {};
                    (contentData.comments || []).forEach(c => {
                        likesMap[c._id] = {
                            liked: (c.likes || []).some(id => id === (currentUser._id || currentUser.id)),
                            count: (c.likes || []).length
                        };
                    });
                    setCommentLikes(likesMap);
                }
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
            const endpoint = type === 'study-content'
                ? `${API_URL}/api/posts/study-content`
                : `${API_URL}/api/posts/feed`;
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRelatedContent(response.data.data.filter(post => post._id !== contentId).slice(0, 10));
            }
        } catch (error) {
            console.error('Error fetching related content:', error);
        }
    };

    const handleFollow = async () => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !isFollowing;
            setIsFollowing(newStatus);
            const endpoint = newStatus
                ? `${API_URL}/api/social/follow/${content.user._id}`
                : `${API_URL}/api/social/unfollow/${content.user._id}`;
            await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
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
            setIsFollowing(!isFollowing);
        }
    };

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            const newLikedState = !liked;
            setLiked(newLikedState);
            setContent(prev => ({
                ...prev,
                likes: newLikedState
                    ? [...(prev.likes || []), currentUser._id]
                    : (prev.likes || []).filter(id => id !== currentUser._id)
            }));
            if (newLikedState) {
                await axios.put(`${API_URL}/api/posts/like/${contentId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.put(`${API_URL}/api/posts/unlike/${contentId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            }
        } catch (error) {
            console.error('Like error:', error);
            setLiked(!liked);
            fetchContent();
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
                setContent(prev => ({ ...prev, comments: response.data.comments }));
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
            setCommentLikes(m => ({ ...m, [commentId]: prev }));
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
            isOpen: true, action: executeDelete, id: contentId,
            title: 'Delete Content', message: 'Are you sure you want to delete this content?'
        });
    };

    const isOwner = currentUser && content && (currentUser.id === content.user?._id || currentUser._id === content.user?._id);

    if (loading) return <PageShimmer variant="detail" />;
    if (!content) return <div className="text-center py-20 font-bold text-gray-500">Content not found or has been removed.</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white font-sans selection:bg-[#0061FF]/20 selection:text-gray-900">

      <ContentHeader
        title={content.title}
        isOwner={isOwner}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        onBack={() => navigate(-1)}
        onDelete={handleDelete}
      />

      {/* Main Grid Layout */}
      <div className="max-w-[85rem] mx-auto p-4 md:p-8 lg:grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 items-start">

        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6 w-full min-w-0">

          {/* Media Player */}
          <div className="w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-lg border border-gray-200 dark:border-white/10 relative group">
            {content.mediaType === 'video' ? (
              <video key={content.mediaUrl} controls autoPlay className="w-full h-full object-contain bg-black" controlsList="nodownload">
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

            <ContentAuthorActions
              content={content}
              isOwner={isOwner}
              isFollowing={isFollowing}
              liked={liked}
              onFollow={handleFollow}
              onLike={handleLike}
              onSave={() => setShowPlaylistModal(true)}
            />

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

            <ContentComments
              comments={content.comments}
              commentText={commentText}
              setCommentText={setCommentText}
              commentLoading={commentLoading}
              commentLikes={commentLikes}
              currentUser={currentUser}
              onComment={handleComment}
              onCommentLike={handleCommentLike}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <ContentDiscoverSidebar
          relatedContent={relatedContent}
          relatedFilter={relatedFilter}
          setRelatedFilter={setRelatedFilter}
          currentAuthorId={content.user?._id}
        />
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
          if (confirmState.action && confirmState.id) confirmState.action(confirmState.id);
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
