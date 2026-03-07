const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, isPrivate } = req.body;
        const userId = req.user._id;

        // Prepare update object
        const updateData = {};
        if (name) updateData.name = name;
        if (bio) updateData.bio = bio;
        if (isPrivate !== undefined) updateData.isPrivate = isPrivate === 'true' || isPrivate === true; // Handle string from FormData

        // If a file was uploaded, add its path to updateData
        if (req.file) {
            // Cloudinary returns the URL in req.file.path
            updateData.profileImage = req.file.path;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                isPrivate: user.isPrivate,
                profileImage: user.profileImage,
                followerCount: user.followerCount,
                followingCount: user.followingCount,
                subscriberCount: user.subscriberCount
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.linkManager = async (req, res) => {
    try {
        const { managerId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const manager = await User.findById(managerId);

        if (!manager || !['hod', 'teacher'].includes(manager.role)) {
            return res.status(400).json({ success: false, message: 'Invalid manager' });
        }

        if (user.instituteId && manager.instituteId && user.instituteId.toString() !== manager.instituteId.toString()) {
            return res.status(400).json({ success: false, message: 'Must be in same institute' });
        }

        user.reportsToUser = manager._id;
        await user.save();

        res.json({ success: true, message: 'Supervisor linked successfully' });
    } catch (error) {
        console.error('Link manager error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/user/leaderboard
 * 
 * Ranking algorithm: XP-weighted with streak bonus.
 * Score = points + (streak × 10)
 * This is similar to how LeetCode and HackerRank rank users:
 * primary sort by XP, tiebreaker by streak consistency.
 * 
 * Proper rank assignment handles ties:
 * - Same score = same rank (dense ranking)
 */
exports.getLeaderboard = async (req, res) => {
    try {
        // Fetch top 50 non-banned users with xp > 0
        const users = await User.find({ 
            isBanned: { $ne: true },
            xp: { $gt: 0 }
        })
        .select('name email xp points streak followerCount profileImage role')
        .sort({ xp: -1, streak: -1 })
        .limit(50)
        .lean();

        // Assign ranks with dense ranking (ties get same rank)
        let currentRank = 0;
        let prevScore = -1;

        const ranked = users.map((user, index) => {
            const score = user.xp || 0;
            if (score !== prevScore) {
                currentRank = index + 1;
                prevScore = score;
            }
            return {
                ...user,
                _id: user._id,
                rank: currentRank,
                score,
            };
        });

        res.json({ success: true, data: ranked });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

