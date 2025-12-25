const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Post = require('../models/Post');
const User = require('../models/User');
const Playlist = require('../models/Playlist');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blackitab_posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'webm'],
        resource_type: 'auto' // Auto-detect image or video
    }
});

const upload = multer({ storage: storage });

exports.upload = upload; // Export the multer instance
exports.uploadMiddleware = upload.single('media'); // Keep for backward compatibility if needed

/**
 * Create a new Post
 * Route: POST /api/posts/create
 */
exports.createPost = async (req, res) => {
    try {
        const { caption, contentType, title, description, price, playlistId, newPlaylistTitle } = req.body;

        // Access files from req.files (Multer fields)
        const mediaFile = req.files && req.files['media'] ? req.files['media'][0] : null;
        const playlistThumbFile = req.files && req.files['playlistThumbnail'] ? req.files['playlistThumbnail'][0] : null;

        if (!mediaFile && !caption) {
            return res.status(400).json({ success: false, message: 'Caption or media is required' });
        }

        // Validate study-content requirements
        if (contentType === 'study-content') {
            if (!title || !title.trim()) {
                return res.status(400).json({ success: false, message: 'Title is required for study content' });
            }
            if (!description || !description.trim()) {
                return res.status(400).json({ success: false, message: 'Description is required for study content' });
            }
        }

        // Validate paid-content requirements
        if (contentType === 'paid-content') {
            if (!title || !title.trim()) {
                return res.status(400).json({ success: false, message: 'Title is required for paid content' });
            }
            if (!description || !description.trim()) {
                return res.status(400).json({ success: false, message: 'Description is required for paid content' });
            }
            if (!price || isNaN(price) || Number(price) <= 0) {
                return res.status(400).json({ success: false, message: 'Valid price is required for paid content' });
            }
        }

        const newPost = await Post.create({
            user: req.user._id,
            caption,
            contentType: contentType || 'post',
            contentType: contentType || 'post',
            title: title || undefined,
            description: description || undefined,
            price: price ? Number(price) : 0,
            currency: 'INR',
            mediaUrl: mediaFile ? mediaFile.path : '',
            mediaType: mediaFile ? (mediaFile.mimetype.startsWith('video') ? 'video' : 'image') : 'text',
            publicId: mediaFile ? mediaFile.filename : undefined
        });

        // Populate user details for immediate UI update
        await newPost.populate('user', 'name profileImage');

        // Handle Playlist Assignment
        if (playlistId) {
            // Add to existing playlist
            const playlist = await Playlist.findOne({ _id: playlistId, user: req.user._id });
            if (playlist) {
                // Check if not already added (though unlikely on new post)
                playlist.posts.push(newPost._id);
                // Set thumbnail if empty
                if (!playlist.thumbnail && newPost.mediaType === 'image') {
                    playlist.thumbnail = newPost.mediaUrl;
                } else if (!playlist.thumbnail && newPost.mediaType === 'video') {
                    // Ideally we want a thumbnail, but for now maybe just post URL or placeholder logic in frontend
                    // playlist.thumbnail = newPost.mediaUrl; // If video, this might not work as img src directly
                }
                await playlist.save();
            }
        } else if (newPlaylistTitle) {
            // Create NEW playlist and add post
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
        // If database fail, try to delete from cloudinary? (Optional improvement)
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get All Posts (Feed)
 * Route: GET /api/posts/feed
 */
exports.getFeedParams = async (req, res) => { // Preliminary feed
    try {
        // Only show regular posts in feed, not study content
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

/**
 * Get Posts by User
 * Route: GET /api/posts/user/:userId
 */
exports.getUserPosts = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Privacy Check
        if (targetUser.isPrivate && req.params.userId !== req.user._id.toString()) {
            // Check if following
            const isFollowing = await require('../models/FollowerList').exists({
                userId: req.params.userId, // The target user
                followerId: req.user._id,  // Me
                status: 'accepted' // Only accepted followers
            });

            if (!isFollowing) {
                return res.json({
                    success: true,
                    data: [],
                    isPrivate: true,
                    message: 'This account is private.'
                });
            }
        }

        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'name profileImage') // Populate user info
            .populate('comments.user', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: posts });
    } catch (err) {
        console.error('Error fetching user posts:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Delete Post
 * Route: DELETE /api/posts/:id
 */
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check user
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        // Delete from Cloudinary
        if (post.publicId) {
            await cloudinary.uploader.destroy(post.publicId, {
                resource_type: post.mediaType === 'video' ? 'video' : 'image'
            });
        }

        await post.deleteOne();

        res.json({ success: true, message: 'Post removed' });
    } catch (err) {
        console.error('Error deleting post:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Like a Post
 * Route: PUT /api/posts/like/:id
 */
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        // Check if already liked
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

/**
 * Unlike a Post
 * Route: PUT /api/posts/unlike/:id
 */
exports.unlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        // Check if not liked
        if (!post.likes.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'Post not yet liked' });
        }

        // Remove like
        post.likes = post.likes.filter(userId => userId.toString() !== req.user._id.toString());
        await post.save();

        res.json({ success: true, likes: post.likes });
    } catch (err) {
        console.error('Unlike error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Add Comment
 * Route: POST /api/posts/comment/:id
 */
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

        const newComment = {
            user: req.user._id,
            text,
            createdAt: Date.now()
        };

        post.comments.unshift(newComment);
        await post.save();

        // Populate the new comment's user for immediate display
        await post.populate('comments.user', 'name profileImage');

        // Emit real-time event
        if (req.io) {
            const addedComment = post.comments[0]; // The one we just unshifted
            req.io.emit('new_comment', {
                postId: post._id,
                comment: addedComment
            });
        }

        res.json({ success: true, comments: post.comments });
    } catch (err) {
        console.error('Add comment error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Delete Comment
 * Route: DELETE /api/posts/comment/:id/:commentId
 */
exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        // Find comment
        const comment = post.comments.find(c => c._id.toString() === req.params.commentId);
        if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

        // Check Authorization: Post Owner OR Comment Owner
        if (comment.user.toString() !== req.user._id.toString() && post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        // Remove comment
        post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
        await post.save();

        res.json({ success: true, comments: post.comments });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Get All Study Content
 * Route: GET /api/posts/study-content
 */
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

/**
 * Get Individual Content by ID (for sharing)
 * Route: GET /api/posts/content/:id
 */
exports.getPaidContent = async (req, res) => {
    try {
        const posts = await Post.find({ contentType: 'paid-content' })
            .populate('user', 'name profileImage')
            .populate('comments.user', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: posts });
    } catch (error) {
        console.error('Fetch study content error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getContentById = async (req, res) => {
    try {
        const content = await Post.findById(req.params.id)
            .populate('user', 'name profileImage followerCount')
            .populate('comments.user', 'name profileImage');

        if (!content) {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }

        let isFollowing = false;
        // Check if current user is following the content creator
        if (req.user && content.user) {
            const FollowerList = require('../models/FollowerList');
            // Note: In FollowerList, 'userId' is the person being followed (The Creator),
            // and 'followerId' is the person following (Me).
            const exists = await FollowerList.exists({
                userId: content.user._id,
                followerId: req.user._id
            });
            isFollowing = !!exists;
        }

        const contentObj = content.toObject();
        contentObj.isFollowing = isFollowing;

        res.json({ success: true, data: contentObj });
    } catch (err) {
        console.error('Get content by ID error:', err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ success: false, message: 'Content not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getRecentVideos = async (req, res) => {
    try {
        // Find all posts that have a video mediaType
        const videos = await Post.find({
            mediaType: 'video',
            mediaUrl: { $exists: true, $ne: '' } // Ensure mediaUrl exists and is not empty
        })
            .populate('user', 'name profileImage')
            .sort({ createdAt: -1 })
            .limit(20);

        console.log(`[GET RECENT VIDEOS] Found ${videos.length} videos`);
        if (videos.length > 0) {
            console.log('[GET RECENT VIDEOS] Sample:', {
                id: videos[0]._id,
                contentType: videos[0].contentType,
                mediaType: videos[0].mediaType,
                caption: videos[0].caption
            });
        }

        res.json({ success: true, data: videos });
    } catch (error) {
        console.error('Fetch recent videos error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

