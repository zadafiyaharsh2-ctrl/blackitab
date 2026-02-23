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

// GET /api/user/leaderboard — top 50 users by points then streak
exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({})
            .select('name profileImage points streak followerCount')
            .sort({ points: -1, streak: -1 })
            .limit(50)
            .lean();

        const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }));
        res.json({ success: true, data: ranked });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
