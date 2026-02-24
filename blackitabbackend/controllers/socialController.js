const User = require('../models/User');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');

// --- Search ---

// GET /api/social/search — search users by name or email
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user ? req.user._id : null;

        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query required' });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('name email followerCount subscriberCount profileImage bio');

        let results = users.map(u => u.toObject());

        if (currentUserId) {
            const myFollows = await Connection.find({ sourceUserId: currentUserId, connectionType: 'follow' });
            
            const followingIds = new Set(
                myFollows.filter(c => c.status === 'accepted').map(c => c.targetUserId.toString())
            );
            const pendingIds = new Set(
                myFollows.filter(c => c.status === 'pending').map(c => c.targetUserId.toString())
            );

            results = results.map(user => ({
                ...user,
                isFollowing: followingIds.has(user._id.toString()),
                isRequested: pendingIds.has(user._id.toString())
            }));
        }

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Notifications ---
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const myFollows = await Connection.find({ sourceUserId: req.user._id, connectionType: 'follow', status: 'accepted' });
        const followingIds = new Set(myFollows.map(c => c.targetUserId.toString()));

        const notificationsWithStatus = notifications.map(note => ({
            ...note,
            isFollowing: note.sender ? followingIds.has(note.sender._id.toString()) : false
        }));

        res.json({ success: true, data: notificationsWithStatus });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/social/notifications/unread-count
exports.getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ recipient: req.user._id, read: false });
        res.json({ success: true, count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Follow ---

exports.followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const existingConnection = await Connection.findOne({ sourceUserId: currentUserId, targetUserId, connectionType: 'follow' });

        if (existingConnection) {
            return res.json({ success: true, message: existingConnection.status === 'accepted' ? 'You are now following' : 'Follow request already sent', status: existingConnection.status });
        }

        if (!targetUser.isPrivate) {
            // Auto accept
            await Connection.create({ sourceUserId: currentUserId, targetUserId, connectionType: 'follow', status: 'accepted' });
            
            await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: 1 } });
            await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });
            
            await Notification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'new_follower',
                message: `${req.user.name} started following you`
            });
            return res.json({ success: true, message: 'You are now following this user', status: 'accepted' });
        } else {
            // Pending request
            await Connection.create({ sourceUserId: currentUserId, targetUserId, connectionType: 'follow', status: 'pending' });
            await Notification.create({ recipient: targetUserId, sender: currentUserId, type: 'follow_request' });
            return res.json({ success: true, message: 'Follow request sent', status: 'pending' });
        }
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.acceptFollowRequest = async (req, res) => {
    try {
        const senderId = req.params.senderId;
        const currentUserId = req.user._id;

        const connection = await Connection.findOne({ sourceUserId: senderId, targetUserId: currentUserId, connectionType: 'follow', status: 'pending' });
        if (!connection) {
            return res.status(404).json({ success: false, message: 'No pending request found' });
        }

        connection.status = 'accepted';
        await connection.save();

        await User.findByIdAndUpdate(currentUserId, { $inc: { followerCount: 1 } });
        await User.findByIdAndUpdate(senderId, { $inc: { followingCount: 1 } });

        await Notification.findOneAndDelete({ recipient: currentUserId, sender: senderId, type: 'follow_request' });
        await Notification.create({ recipient: senderId, sender: currentUserId, type: 'follow_accepted' });

        res.json({ success: true, message: 'Follow request accepted' });
    } catch (error) {
        console.error('Accept follow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.rejectFollowRequest = async (req, res) => {
    try {
        const senderId = req.params.senderId;
        const currentUserId = req.user._id;

        const result = await Connection.findOneAndDelete({ sourceUserId: senderId, targetUserId: currentUserId, connectionType: 'follow', status: 'pending' });
        if (!result) return res.status(404).json({ success: false, message: 'No pending request found' });

        res.json({ success: true, message: 'Follow request rejected' });
    } catch (error) {
        console.error('Reject follow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        const existingConnection = await Connection.findOneAndDelete({ sourceUserId: currentUserId, targetUserId, connectionType: 'follow' });

        if (!existingConnection) {
            return res.status(400).json({ success: false, message: 'You are not following' });
        }

        if (existingConnection.status === 'accepted') {
            await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: -1 } });
            await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
        } else if (existingConnection.status === 'pending') {
            await Notification.findOneAndDelete({ recipient: targetUserId, sender: currentUserId, type: 'follow_request' });
        }

        res.json({ success: true, message: 'User unfollowed successfully' });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Subscribe ---
exports.subscribeUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) return res.status(400).json({ success: false, message: 'Cannot subscribe to self' });

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

        const existingSub = await Connection.findOne({ sourceUserId: currentUserId, targetUserId, connectionType: 'subscribe' });
        if (existingSub) return res.status(400).json({ success: false, message: 'Already subscribed' });

        await Connection.create({ sourceUserId: currentUserId, targetUserId, connectionType: 'subscribe', status: 'accepted' });
        await User.findByIdAndUpdate(targetUserId, { $inc: { subscriberCount: 1 } });

        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscribe user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.unsubscribeUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        const existingSub = await Connection.findOneAndDelete({ sourceUserId: currentUserId, targetUserId, connectionType: 'subscribe' });
        if (!existingSub) return res.status(400).json({ success: false, message: 'Not subscribed' });

        await User.findByIdAndUpdate(targetUserId, { $inc: { subscriberCount: -1 } });
        res.json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Unsubscribe user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Profile & Lists ---
exports.getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const currentUserId = req.user._id;

        const connections = await Connection.find({ targetUserId: userId, connectionType: 'follow', status: 'accepted' })
                                  .populate('sourceUserId', 'name email followerCount subscriberCount profileImage bio');

        const myFollows = await Connection.find({ sourceUserId: currentUserId, connectionType: 'follow', status: 'accepted' });
        const myFollowingIds = new Set(myFollows.map(f => f.targetUserId.toString()));

        const users = connections
            .map(c => c.sourceUserId)
            .filter(u => u && u._id.toString() !== currentUserId.toString())
            .map(u => ({
                ...(u.toObject ? u.toObject() : u),
                isFollowing: myFollowingIds.has(u._id.toString())
            }));

        res.json({ success: true, users, data: users });
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const connections = await Connection.find({ sourceUserId: userId, connectionType: 'follow', status: 'accepted' })
                                  .populate('targetUserId', 'name email followerCount subscriberCount profileImage bio');

        const myFollows = await Connection.find({ sourceUserId: currentUserId, connectionType: 'follow', status: 'accepted' });
        const myFollowingIds = new Set(myFollows.map(f => f.targetUserId.toString()));

        const users = connections
            .map(c => c.targetUserId)
            .filter(u => u && u._id.toString() !== currentUserId.toString())
            .map(u => ({ 
                ...(u.toObject ? u.toObject() : u), 
                isFollowing: myFollowingIds.has(u._id.toString()) 
            }));

        res.json({ success: true, users, data: users });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user._id;

        const user = await User.findById(userId).select('-password').lean();
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isFollowing = await Connection.exists({ sourceUserId: currentUserId, targetUserId: userId, connectionType: 'follow', status: 'accepted' });
        const isRequested = await Connection.exists({ sourceUserId: currentUserId, targetUserId: userId, connectionType: 'follow', status: 'pending' });
        const isFollower = await Connection.exists({ sourceUserId: userId, targetUserId: currentUserId, connectionType: 'follow', status: 'accepted' });

        res.json({
            success: true,
            user: { ...user, isFollowing: !!isFollowing, isRequested: !!isRequested, isFollower: !!isFollower }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
