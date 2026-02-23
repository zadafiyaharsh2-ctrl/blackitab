const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Post = require('../models/Post');
const User = require('../models/User');
const Playlist = require('../models/Playlist');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blackitab_posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'webm'],
        resource_type: 'auto'
    }
});

const upload = multer({ storage: storage });

exports.upload = upload;
exports.uploadMiddleware = upload.single('media');

// POST /api/posts/create
exports.createPost = async (req, res) => {
    try {
        const { caption, contentType, title, description, price, playlistId, newPlaylistTitle } = req.body;

        const mediaFile = req.files && req.files['media'] ? req.files['media'][0] : null;
        const playlistThumbFile = req.files && req.files['playlistThumbnail'] ? req.files['playlistThumbnail'][0] : null;

        if (!mediaFile && !caption) {
            return res.status(400).json({ success: false, message: 'Caption or media is required' });
        }

        if (contentType === 'study-content') {
            if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required for study content' });
            if (!description || !description.trim()) return res.status(400).json({ success: false, message: 'Description is required for study content' });
        }

        if (contentType === 'paid-content') {
            if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required for paid content' });
            if (!description || !description.trim()) return res.status(400).json({ success: false, message: 'Description is required for paid content' });
            if (!price || isNaN(price) || Number(price) <= 0) return res.status(400).json({ success: false, message: 'Valid price is required for paid content' });
        }

        const newPost = await Post.create({
            user: req.user._id,
            caption,
            contentType: contentType || 'post',
            title: title || undefined,
            description: description || undefined,
            price: price ? Number(price) : 0,
            currency: 'INR',
            mediaUrl: mediaFile ? mediaFile.path : '',
            mediaType: mediaFile ? (mediaFile.mimetype.startsWith('video') ? 'video' : 'image') : 'text',
            publicId: mediaFile ? mediaFile.filename : undefined
        });

        await newPost.populate('user', 'name profileImage');

        // Handle playlist assignment
        if (playlistId) {
            const playlist = await Playlist.findOne({ _id: playlistId, user: req.user._id });
            if (playlist) {
                playlist.posts.push(newPost._id);
                if (!playlist.thumbnail && newPost.mediaType === 'image') {
                    playlist.thumbnail = newPost.mediaUrl;
                }
                await playlist.save();
            }
        } else if (newPlaylistTitle) {
            await Playlist.create({
                title: newPlaylistTitle,
                user: req.user._id,
                posts: [newPost._id],
                isPrivate: false,
                thumbnail: playlistThumbFile ? playlistThumbFile.path : (newPost.mediaType === 'image' ? newPost.mediaUrl : undefined)
            });
        }

        res.status(201).json({ success: true, post: newPost });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/posts/feed — regular posts only (not study content)
exports.getFeedParams = async (req, res) => {
    try {
        const posts = await Post.find({ contentType: 'post' })
            .populate('user', 'name profileImage')
            .populate('comments.user', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/posts/user/:userId — posts by user (with privacy check)
exports.getUserPosts = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Privacy: only show posts if public, self, or accepted follower
        if (targetUser.isPrivate && req.params.userId !== req.user._id.toString()) {
            const isFollowing = await require('../models/FollowerList').exists({
                userId: req.params.userId,
                followerId: req.user._id,
                status: 'accepted'
            });

            if (!isFollowing) {
                return res.json({ success: true, data: [], isPrivate: true, message: 'This account is private.' });
            }
        }

        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'name profileImage')
            .populate('comments.user', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: posts });
    } catch (err) {
        console.error('Error fetching user posts:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        if (post.publicId) {
            await cloudinary.uploader.destroy(post.publicId, {
                resource_type: post.mediaType === 'video' ? 'video' : 'image'
            });
        }

        await post.deleteOne();
        res.json({ success: true, message: 'Post removed' });
    } catch (err) {
        console.error('Error deleting post:', err);
        if (err.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Post not found' });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/posts/like/:id
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        if (post.likes.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'Post already liked' });
        }

        post.likes.push(req.user._id);
        await post.save();
        res.json({ success: true, likes: post.likes });
    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/posts/unlike/:id
exports.unlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        if (!post.likes.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'Post not yet liked' });
        }

        post.likes = post.likes.filter(userId => userId.toString() !== req.user._id.toString());
        await post.save();
        res.json({ success: true, likes: post.likes });
    } catch (err) {
        console.error('Unlike error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/posts/comment/:id
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

        post.comments.unshift({ user: req.user._id, text, createdAt: Date.now() });
        await post.save();
        await post.populate('comments.user', 'name profileImage');

        // Real-time comment event
        if (req.io) {
            req.io.emit('new_comment', { postId: post._id, comment: post.comments[0] });
        }

        res.json({ success: true, comments: post.comments });
    } catch (err) {
        console.error('Add comment error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/posts/comment/:id/:commentId — post owner or comment author can delete
exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.find(c => c._id.toString() === req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

        if (comment.user.toString() !== req.user._id.toString() && post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
        await post.save();
        res.json({ success: true, comments: post.comments });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/posts/study-content
exports.getStudyContent = async (req, res) => {
    try {
        const studyContent = await Post.find({ contentType: 'study-content' })
            .populate('user', 'name profileImage')
            .populate('comments.user', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: studyContent });
    } catch (err) {
        console.error('Get study content error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/posts/paid-content
exports.getPaidContent = async (req, res) => {
    try {
        const posts = await Post.find({ contentType: 'paid-content' })
            .populate('user', 'name profileImage')
            .populate('comments.user', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: posts });
    } catch (error) {
        console.error('Fetch paid content error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/posts/content/:id — single content item with follow status
exports.getContentById = async (req, res) => {
    try {
        const content = await Post.findById(req.params.id)
            .populate('user', 'name profileImage followerCount')
            .populate('comments.user', 'name profileImage');

        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

        let isFollowing = false;
        if (req.user && content.user) {
            const FollowerList = require('../models/FollowerList');
            const exists = await FollowerList.exists({ userId: content.user._id, followerId: req.user._id });
            isFollowing = !!exists;
        }

        // Increment view count
        await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

        res.json({ success: true, data: { ...content.toObject(), isFollowing } });
    } catch (err) {
        console.error('Get content by ID error:', err);
        if (err.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Content not found' });
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/posts/recent-videos — latest 20 video posts
exports.getRecentVideos = async (req, res) => {
    try {
        const videos = await Post.find({
            mediaType: 'video',
            mediaUrl: { $exists: true, $ne: '' }
        })
            .populate('user', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, data: videos });
    } catch (error) {
        console.error('Fetch recent videos error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/posts/:id/comments/:commentId/like — toggle like on a comment
exports.likeComment = async (req, res) => {
    try {
        const { id: postId, commentId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

        const alreadyLiked = comment.likes.some(id => id.toString() === userId.toString());
        if (alreadyLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
        } else {
            comment.likes.push(userId);
        }

        await post.save();
        res.json({ success: true, liked: !alreadyLiked, likeCount: comment.likes.length });
    } catch (err) {
        console.error('Like comment error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
