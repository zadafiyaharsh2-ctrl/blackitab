const User = require('../models/User');
const FollowerList = require('../models/FollowerList');
const FollowingList = require('../models/FollowingList'); // Import FollowingList
const SubscriberList = require('../models/SubscriberList');
const Notification = require('../models/Notification');

// ... (Search and Notifications code unchanged) ...

/**
 * Accept Follow Request
 */
exports.acceptFollowRequest = async (req, res) => {
    try {
        const senderId = req.params.senderId; // The user who SENT the request (Follower)
        const currentUserId = req.user._id;   // The user accepting (Target)

        const followRequest = await FollowerList.findOne({
            userId: currentUserId,
            followerId: senderId,
            status: 'pending'
        });

        if (!followRequest) {
            return res.status(404).json({ success: false, message: 'No pending follow request found' });
        }

        // Update status to accepted
        followRequest.status = 'accepted';
        await followRequest.save();

        // 1. Increment follower count for ME (Target)
        await User.findByIdAndUpdate(currentUserId, { $inc: { followerCount: 1 } });

        // 2. Increment following count for SENDER (Follower)
        // Sender (userId) is Following (followingId = Me)
        // Use atomic update to ensure it persists
        const updateResult = await User.findByIdAndUpdate(
            senderId,
            { $inc: { followingCount: 1 } },
            { new: true } // Return the updated document
        );
        console.error('DEBUG: Updated Sender followingCount:', updateResult ? updateResult.followingCount : 'Sender Not Found');

        // 3. Create entry in FollowingList for SENDER
        await FollowingList.create({
            userId: senderId,
            followingId: currentUserId
        });
        // Sender (userId) is Following (followingId = Me)
        await FollowingList.create({
            userId: senderId,
            followingId: currentUserId
        });

        // 4. Delete the original follow_request notification (Housekeeping)
        await Notification.findOneAndDelete({
            recipient: currentUserId,
            sender: senderId,
            type: 'follow_request'
        });

        // Create notification for sender that request was accepted
        await Notification.create({
            recipient: senderId,
            sender: currentUserId,
            type: 'follow_accepted'
        });

        res.json({ success: true, message: 'Follow request accepted' });

    } catch (error) {
        console.error('Accept follow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ... (Reject Follow Request unchanged) ...

/**
 * Unfollow a user
 */
exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id; // User being unfollowed
        const currentUserId = req.user._id; // User performing unfollow

        // Check if follow relationship exists (FollowerList: target is userId, I am follower)
        const existingFollow = await FollowerList.findOneAndDelete({
            userId: targetUserId,
            followerId: currentUserId
        });

        if (!existingFollow) {
            return res.status(400).json({ success: false, message: 'You are not following this user' });
        }

        // Only update counts if it was accepted
        if (existingFollow.status === 'accepted') {
            // 1. Decrement follower count for Target
            await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: -1 } });

            // 2. Decrement following count for Me
            await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });

            // 3. Delete FollowingList entry
            await FollowingList.findOneAndDelete({
                userId: currentUserId,
                followingId: targetUserId
            });
        }

        res.json({ success: true, message: 'User unfollowed successfully' });

    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ========================================
// SEARCH FEATURES
// ========================================

/**
 * Search users by name or email
 * Route: GET /api/social/search
 */
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        // Check if user is authenticated (might be optional for public search, but here we assume logged in for 'isFollowing')
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
            // Fetch who the current user is following
            // Get Following List (Accepted)
            const following = await FollowingList.find({ userId: currentUserId }).select('followingId');
            const followingIds = new Set(following.map(f => f.followingId.toString()));

            // Get Pending Requests (I am follower, status is pending)
            // Query FollowerList where userId is in 'users' list and followerId is ME
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

// ========================================
// NOTIFICATION FEATURES
// ========================================

/**
 * Get user notifications
 * Route: GET /api/social/notifications
 */
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 })
            .lean(); // Use lean() to allow adding properties

        // Get list of IDs the current user is following
        const followingList = await FollowingList.find({ userId: req.user._id }).select('followingId');
        const followingIds = new Set(followingList.map(f => f.followingId.toString()));

        // Add isFollowing property to each notification
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

// ========================================
// FOLLOW FEATURES
// ========================================

/**
 * Send Follow Request
 * Route: POST /api/social/follow/:id
 */
exports.followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id; // The user to be followed
        const currentUserId = req.user._id; // The logged-in user

        // Prevent following yourself
        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
        }

        // Check if user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if already following or pending
        const existingFollow = await FollowerList.findOne({
            userId: targetUserId,
            followerId: currentUserId
        });

        if (existingFollow) {
            if (existingFollow.status === 'accepted') {
                return res.status(400).json({ success: false, message: 'You are already following this user' });
            } else {
                return res.status(400).json({ success: false, message: 'Follow request already sent' });
            }
        }

        // CASE 1: PUBLIC PROFILE - Auto Follow
        if (!targetUser.isPrivate) {
            // 1. Create Follower Entry (Accepted)
            await FollowerList.create({
                userId: targetUserId,
                followerId: currentUserId,
                status: 'accepted'
            });

            // 2. Create Following Entry (Accepted)
            // (Assuming FollowingList mirrors FollowerList but keyed differently or just for redundancy)
            // Note: If FollowingList is just a mirror, we add it. 
            // Checking imports, FollowingList is imported. 
            // Standard practice: if we maintain two lists, we add to both. 
            // If the app only uses FollowerList for everything, these lines might be redundant but safe.
            // Let's assume we need it based on typical designs or check acceptRequest. 
            // (I will assume yes based on imports)
            await FollowingList.create({
                userId: currentUserId,      // Me
                followingId: targetUserId,  // Them
                status: 'accepted'
            });

            // 3. Update Counts
            await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: 1 } });
            await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });

            // 4. Create Notification (New Follower)
            await Notification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'new_follower',
                message: `${req.user.name} started following you` // Optional message field if schema supports
            });

            return res.json({ success: true, message: 'You are now following this user', status: 'accepted' });

        } else {
            // CASE 2: PRIVATE PROFILE - Send Request

            // Create follow relationship with 'pending' status
            await FollowerList.create({
                userId: targetUserId,
                followerId: currentUserId,
                status: 'pending'
            });

            // Create Notification (Follow Request)
            await Notification.create({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow_request'
            });

            return res.json({ success: true, message: 'Follow request sent', status: 'pending' });
        }

    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Accept Follow Request
 * Route: POST /api/social/accept-follow/:requestId
 */
exports.acceptFollowRequest = async (req, res) => {
    try {
        const { requestId } = req.params; // Using Notification ID or simpler logic? Let's use Sender ID for simplicity if needed, but request ID usually implies notification ID.
        // Actually, user accepts a request from a specific USER.
        // Let's change param to :senderId to be clearer
        const senderId = req.params.senderId;
        const currentUserId = req.user._id;
        console.log(`DEBUG: Accept. senderId=${senderId}, currentUserId=${currentUserId}`);

        const followRequest = await FollowerList.findOne({
            userId: currentUserId,
            followerId: senderId,
            status: 'pending'
        });

        if (!followRequest) {
            return res.status(404).json({ success: false, message: 'No pending follow request found' });
        }

        // Update status to accepted
        followRequest.status = 'accepted';
        await followRequest.save();

        // Increment follower count
        await User.findByIdAndUpdate(currentUserId, { $inc: { followerCount: 1 } });

        // 2. Increment following count for SENDER (Follower)
        const updateResult = await User.findByIdAndUpdate(
            senderId,
            { $inc: { followingCount: 1 } },
            { new: true }
        );
        console.log(`Updated Sender ${senderId} followingCount to ${updateResult ? updateResult.followingCount : 'ERROR'}`);

        // 3. Create entry in FollowingList for SENDER
        // Sender (userId) is Following (followingId = Me)
        await FollowingList.create({
            userId: senderId,
            followingId: currentUserId
        });

        // 4. Delete the original follow_request notification (Housekeeping)
        await Notification.findOneAndDelete({
            recipient: currentUserId,
            sender: senderId,
            type: 'follow_request'
        });

        // 5. Create notification for sender that request was accepted
        await Notification.create({
            recipient: senderId,
            sender: currentUserId,
            type: 'follow_accepted'
        });

        res.json({ success: true, message: 'Follow request accepted' });

    } catch (error) {
        console.error('Accept follow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Reject Follow Request
 * Route: POST /api/social/reject-follow/:senderId
 */
exports.rejectFollowRequest = async (req, res) => {
    try {
        const senderId = req.params.senderId;
        const currentUserId = req.user._id;

        const result = await FollowerList.findOneAndDelete({
            userId: currentUserId,
            followerId: senderId,
            status: 'pending'
        });

        if (!result) {
            return res.status(404).json({ success: false, message: 'No pending follow request found' });
        }

        res.json({ success: true, message: 'Follow request rejected' });

    } catch (error) {
        console.error('Reject follow error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


/**
 * Unfollow a user (unchanged mostly, but handles pending deletion too)
 * Route: POST /api/social/unfollow/:id
 */
exports.unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        // 1. Remove from Target's FollowerList
        // (Target is User, I am Follower)
        const existingFollow = await FollowerList.findOneAndDelete({
            userId: targetUserId,
            followerId: currentUserId
        });

        if (!existingFollow) {
            // Check if we were just in FollowingList (data inconsistency)?
            // But let's assume we proceed if we find EITHER.
            // But usually checking FollowerList is the source of truth.
        }

        // 2. Remove from My FollowingList
        // (I am User, Target is FollowingId)
        await FollowingList.findOneAndDelete({
            userId: currentUserId,
            followingId: targetUserId
        });

        // 3. Decrement Counts IF it was an accepted follow
        if (existingFollow && existingFollow.status === 'accepted') {
            // Decrement Target's Follower Count
            await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: -1 } });

            // Decrement My Following Count
            await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
        } else if (existingFollow && existingFollow.status === 'pending') {
            // If it was pending, we just cancelled the request. No counts to update.
            // We should also delete the notification sent
            await Notification.findOneAndDelete({
                recipient: targetUserId,
                sender: currentUserId,
                type: 'follow_request'
            });
        }

        // If no existingFollow found, but we want to ensure cleanup, we ran the FollowingList delete already.

        if (!existingFollow) {
            return res.status(400).json({ success: false, message: 'You are not following this user' });
        }

        res.json({ success: true, message: 'User unfollowed successfully' });

    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ========================================
// SUBSCRIBE FEATURES
// ========================================

/**
 * Subscribe to a user
 * Route: POST /api/social/subscribe/:id
 */
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

        const existingSub = await SubscriberList.findOne({
            userId: targetUserId,
            subscriberId: currentUserId
        });

        if (existingSub) {
            return res.status(400).json({ success: false, message: 'You are already subscribed to this user' });
        }

        await SubscriberList.create({
            userId: targetUserId,
            subscriberId: currentUserId
        });

        await User.findByIdAndUpdate(targetUserId, { $inc: { subscriberCount: 1 } });

        res.json({ success: true, message: 'Subscribed successfully' });

    } catch (error) {
        console.error('Subscribe user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Unsubscribe from a user
 * Route: POST /api/social/unsubscribe/:id
 */
exports.unsubscribeUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        const existingSub = await SubscriberList.findOneAndDelete({
            userId: targetUserId,
            subscriberId: currentUserId
        });

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

/**
 * Get User Followers
 * Route: GET /api/social/followers/:userId
 */
exports.getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const currentUserId = req.user._id;

        const followers = await FollowerList.find({ userId }).populate('followerId', 'name email followerCount subscriberCount profileImage bio');

        const myFollowing = await FollowingList.find({ userId: currentUserId }).select('followingId');
        const myFollowingIds = new Set(myFollowing.map(f => f.followingId.toString()));

        // Filter out current user and map
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

/**
 * Get User Following
 * Route: GET /api/social/following/:userId
 */
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
            .map(u => ({
                ...u,
                isFollowing: myFollowingIds.has(u._id.toString())
            }));

        res.json({ success: true, users, data: users });
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get Public User Profile
 * Route: GET /api/social/user/:id
 */
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.user._id;

        const user = await User.findById(userId).select('-password -otp -otpExpires').lean();
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if I follow them (Accepted)
        const isFollowing = await FollowingList.exists({ userId: currentUserId, followingId: userId });

        // Check is pending request
        const isRequested = await FollowerList.exists({ userId: userId, followerId: currentUserId, status: 'pending' });

        // Check if they follow me (for mutual/friends status)
        const isFollower = await FollowerList.exists({ userId: currentUserId, followerId: userId, status: 'accepted' });

        res.json({
            success: true,
            user: {
                ...user,
                isFollowing: !!isFollowing,
                isRequested: !!isRequested,
                isFollower: !!isFollower
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
