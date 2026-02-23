const User = require('../models/User');
const FollowerList = require('../models/FollowerList');
const FollowingList = require('../models/FollowingList');
const SubscriberList = require('../models/SubscriberList');
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

        let results = users;

        if (currentUserId) {
            const following = await FollowingList.find({ userId: currentUserId }).select('followingId');
            const followingIds = new Set(following.map(f => f.followingId.toString()));

            const pendingRequests = await FollowerList.find({
                userId: { $in: users.map(u => u._id) },
                followerId: currentUserId,
                status: 'pending'
            }).select('userId');
            const pendingIds = new Set(pendingRequests.map(p => p.userId.toString()));

            results = users.map(user => ({
                ...user.toObject(),
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

// GET /api/social/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const followingList = await FollowingList.find({ userId: req.user._id }).select('followingId');
        const followingIds = new Set(followingList.map(f => f.followingId.toString()));

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

// POST /api/social/follow/:id — send follow request (auto-accept for public profiles)
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

        const existingFollow = await FollowerList.findOne({ userId: targetUserId, followerId: currentUserId });

        if (existingFollow) {
            if (existingFollow.status === 'accepted') {
                // Self-healing: ensure FollowingList entry exists
                const existingFollowing = await FollowingList.findOne({ userId: currentUserId, followingId: targetUserId });
                if (!existingFollowing) {
                    await FollowingList.create({ userId: currentUserId, followingId: targetUserId, status: 'accepted' });
                }
                return res.json({ success: true, message: 'You are now following this user', status: 'accepted' });
            } else {
                return res.json({ success: true, message: 'Follow request already sent', status: 'pending' });
            }
        }

        if (!targetUser.isPrivate) {
            // Public profile → auto-accept
            await FollowerList.create({ userId: targetUserId, followerId: currentUserId, status: 'accepted' });
            await FollowingList.create({ userId: currentUserId, followingId: targetUserId, status: 'accepted' });
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
            // Private profile → pending request
            await FollowerList.create({ userId: targetUserId, followerId: currentUserId, status: 'pending' });
            await Notification.create({ recipient: targetUserId, sender: currentUserId, type: 'follow_request' });
            return res.json({ success: true, message: 'Follow request sent', status: 'pending' });
        }
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/social/accept-follow/:senderId — accept a pending follow request
exports.acceptFollowRequest = async (req, res) => {
    try {
        const senderId = req.params.senderId;
        const currentUserId = req.user._id;

        const followRequest = await FollowerList.findOne({ userId: currentUserId, followerId: senderId, status: 'pending' });
        if (!followRequest) {
            return res.status(404).json({ success: false, message: 'No pending follow request found' });
        }

        followRequest.status = 'accepted';
        await followRequest.save();

        await User.findByIdAndUpdate(currentUserId, { $inc: { followerCount: 1 } });
        await User.findByIdAndUpdate(senderId, { $inc: { followingCount: 1 } });
        await FollowingList.create({ userId: senderId, followingId: currentUserId });

        await Notification.findOneAndDelete({ recipient: currentUserId, sender: senderId, type: 'follow_request' });
        await Notification.create({ recipient: senderId, sender: currentUserId, type: 'follow_accepted' });

        res.json({ success: true, message: 'Follow request accepted' });
    } catch (error) {
        console.error('Accept follow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/social/reject-follow/:senderId
exports.rejectFollowRequest = async (req, res) => {
    try {
        const senderId = req.params.senderId;
        const currentUserId = req.user._id;

        const result = await FollowerList.findOneAndDelete({ userId: currentUserId, followerId: senderId, status: 'pending' });
        if (!result) {
            return res.status(404).json({ success: false, message: 'No pending follow request found' });
        }

        res.json({ success: true, message: 'Follow request rejected' });
    } catch (error) {
        console.error('Reject follow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/social/unfollow/:id — unfollow or cancel pending request
exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        const existingFollow = await FollowerList.findOneAndDelete({ userId: targetUserId, followerId: currentUserId });

        // Also remove FollowingList entry
        await FollowingList.findOneAndDelete({ userId: currentUserId, followingId: targetUserId });

        if (!existingFollow) {
            return res.status(400).json({ success: false, message: 'You are not following this user' });
        }

        if (existingFollow.status === 'accepted') {
            await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: -1 } });
            await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
        } else if (existingFollow.status === 'pending') {
            // Cancel pending request — clean up notification
            await Notification.findOneAndDelete({ recipient: targetUserId, sender: currentUserId, type: 'follow_request' });
        }

        res.json({ success: true, message: 'User unfollowed successfully' });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Subscribe ---

// POST /api/social/subscribe/:id
exports.subscribeUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot subscribe to yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const existingSub = await SubscriberList.findOne({ userId: targetUserId, subscriberId: currentUserId });
        if (existingSub) {
            return res.status(400).json({ success: false, message: 'You are already subscribed to this user' });
        }

        await SubscriberList.create({ userId: targetUserId, subscriberId: currentUserId });
        await User.findByIdAndUpdate(targetUserId, { $inc: { subscriberCount: 1 } });

        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Subscribe user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/social/unsubscribe/:id
exports.unsubscribeUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        const existingSub = await SubscriberList.findOneAndDelete({ userId: targetUserId, subscriberId: currentUserId });
        if (!existingSub) {
            return res.status(400).json({ success: false, message: 'You are not subscribed to this user' });
        }

        await User.findByIdAndUpdate(targetUserId, { $inc: { subscriberCount: -1 } });
        res.json({ success: true, message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Unsubscribe user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- Profile & Lists ---

// GET /api/social/followers/:userId
exports.getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const currentUserId = req.user._id;

        const followers = await FollowerList.find({ userId }).populate('followerId', 'name email followerCount subscriberCount profileImage bio');

        const myFollowing = await FollowingList.find({ userId: currentUserId }).select('followingId');
        const myFollowingIds = new Set(myFollowing.map(f => f.followingId.toString()));

        const users = followers
            .map(f => f.followerId)
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

// GET /api/social/following/:userId
exports.getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const following = await FollowingList.find({ userId })
            .populate('followingId', 'name email followerCount subscriberCount profileImage bio')
            .lean();

        const myFollowing = await FollowingList.find({ userId: currentUserId }).select('followingId');
        const myFollowingIds = new Set(myFollowing.map(f => f.followingId.toString()));

        const users = following
            .map(f => f.followingId)
            .filter(u => u && u._id.toString() !== currentUserId.toString())
            .map(u => ({ ...u, isFollowing: myFollowingIds.has(u._id.toString()) }));

        res.json({ success: true, users, data: users });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/social/user/:id — public user profile with follow status
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user._id;

        const user = await User.findById(userId).select('-password').lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isFollowing = await FollowingList.exists({ userId: currentUserId, followingId: userId });
        const isRequested = await FollowerList.exists({ userId: userId, followerId: currentUserId, status: 'pending' });
        const isFollower = await FollowerList.exists({ userId: currentUserId, followerId: userId, status: 'accepted' });

        res.json({
            success: true,
            user: { ...user, isFollowing: !!isFollowing, isRequested: !!isRequested, isFollower: !!isFollower }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
