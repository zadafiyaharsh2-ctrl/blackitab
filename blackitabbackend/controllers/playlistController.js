const Playlist = require('../models/Playlist');
const Post = require('../models/Post');

// Create a new playlist
// Create a new playlist
exports.createPlaylist = async (req, res) => {
    try {
        const { title, description, isPrivate } = req.body;
        const thumbnailFile = req.file; // From uploadMiddleware

        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const newPlaylist = await Playlist.create({
            title,
            description,
            isPrivate: isPrivate === 'true' || isPrivate === true || false, // Handle string 'true' from FormData
            user: req.user._id,
            posts: [],
            thumbnail: thumbnailFile ? thumbnailFile.path : undefined
        });

        res.status(201).json({ success: true, playlist: newPlaylist });
    } catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all public playlists
exports.getAllPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ isPrivate: false })
            .populate('user', 'name profileImage')
            .populate('posts', 'mediaUrl') // Populate just enough for video count/thumbnails
            .sort({ createdAt: -1 });

        res.json({ success: true, playlists });
    } catch (error) {
        console.error('Get all playlists error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all playlists for a user
exports.getUserPlaylists = async (req, res) => {
    try {
        const userId = req.params.userId;
        const isOwner = req.user._id.toString() === userId;

        const query = { user: userId };
        if (!isOwner) {
            query.isPrivate = false; // Only show public playlists to others
        }

        const playlists = await Playlist.find(query)
            .populate('user', 'name profileImage')
            .populate('posts', 'mediaUrl') // Populate just enough for thumbnail
            .sort({ createdAt: -1 });

        res.json({ success: true, playlists });
    } catch (error) {
        console.error('Get playlists error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get a single playlist by ID
exports.getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate('user', 'name profileImage')
            .populate({
                path: 'posts',
                populate: { path: 'user', select: 'name' }
            });

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Privacy check
        if (playlist.isPrivate && playlist.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, playlist });
    } catch (error) {
        console.error('Get playlist details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add a post to a playlist
exports.addToPlaylist = async (req, res) => {
    try {
        const { playlistId, postId } = req.body;

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Check if post exists and Ownership check (Security)
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        // CRITICAL: Prevent adding other people's content
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only add your own videos to playlists' });
        }

        // Check duplicates
        if (playlist.posts.includes(postId)) {
            return res.status(400).json({ success: false, message: 'Video already in playlist' });
        }

        playlist.posts.push(postId);

        // Update thumbnail if it's the first video and no thumbnail exists
        if (!playlist.thumbnail) {
            playlist.thumbnail = post.mediaUrl;
        }

        await playlist.save();

        res.json({ success: true, message: 'Added to playlist', playlist });
    } catch (error) {
        console.error('Add to playlist error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Remove a post from a playlist
exports.removeFromPlaylist = async (req, res) => {
    try {
        const { playlistId, postId } = req.params;

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        playlist.posts = playlist.posts.filter(id => id.toString() !== postId);
        await playlist.save();

        res.json({ success: true, message: 'Removed from playlist', playlist });
    } catch (error) {
        console.error('Remove from playlist error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a playlist
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await playlist.deleteOne();
        res.json({ success: true, message: 'Playlist deleted' });
    } catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update Playlist (Title, Description, Thumbnail)
exports.updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, isPrivate } = req.body;
        const thumbnailFile = req.file;

        let playlist = await Playlist.findById(id);

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        if (playlist.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Update fields if provided
        if (title) playlist.title = title;
        if (description) playlist.description = description;
        if (isPrivate !== undefined) playlist.isPrivate = isPrivate === 'true' || isPrivate === true;
        if (thumbnailFile) playlist.thumbnail = thumbnailFile.path;

        await playlist.save();

        res.json({ success: true, playlist });
    } catch (error) {
        console.error('Update playlist error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
