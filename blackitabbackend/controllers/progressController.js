const UserProgress = require('../models/UserProgress');

// POST /api/progress/mark-complete — mark a topic as completed
exports.markTopicComplete = async (req, res) => {
    try {
        const { subjectId, topicId } = req.body;
        const userId = req.user._id;

        if (!subjectId || !topicId) {
            return res.status(400).json({ success: false, message: 'Subject ID and Topic ID are required' });
        }

        let progress = await UserProgress.findOne({ userId, topicId });

        if (progress && progress.completed) {
            return res.status(200).json({ success: true, message: 'Topic already completed', data: progress });
        }

        progress = await UserProgress.findOneAndUpdate(
            { userId, topicId },
            { userId, subjectId, topicId, completed: true, completedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Update streak
        const user = await require('../models/User').findById(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        if (lastActive) lastActive.setHours(0, 0, 0, 0);

        if (!lastActive) {
            user.streak = 1;
            user.lastActiveDate = new Date();
        } else {
            const diffDays = Math.ceil(Math.abs(today - lastActive) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.streak += 1;
                user.lastActiveDate = new Date();
            } else if (diffDays > 1) {
                user.streak = 1;
                user.lastActiveDate = new Date();
            } else {
                user.lastActiveDate = new Date();
            }
        }

        user.points = (user.points || 0) + 10;
        await user.save();

        res.status(200).json({ success: true, message: 'Topic marked as complete', data: progress });
    } catch (error) {
        console.error('Error marking topic complete:', error);
        res.status(500).json({ success: false, message: 'Error marking topic as complete', error: error.message });
    }
};

// GET /api/progress — all completed topics for the user
// Returns format: { subjectId: { topicId: true, ... }, ... }
exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const progress = await UserProgress.find({ userId, completed: true })
            .select('subjectId topicId completedAt')
            .lean();

        const formattedProgress = {};
        progress.forEach(item => {
            const sid = item.subjectId.toString();
            const tid = item.topicId.toString();
            if (!formattedProgress[sid]) formattedProgress[sid] = {};
            formattedProgress[sid][tid] = true;
        });

        res.status(200).json({ success: true, data: formattedProgress });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({ success: false, message: 'Error fetching progress', error: error.message });
    }
};

// GET /api/progress/:subjectId — completed topics for one subject
exports.getSubjectProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { subjectId } = req.params;

        const progress = await UserProgress.find({ userId, subjectId, completed: true })
            .select('topicId completedAt')
            .lean();

        const formattedProgress = {};
        progress.forEach(item => {
            formattedProgress[item.topicId.toString()] = true;
        });

        res.status(200).json({ success: true, data: formattedProgress });
    } catch (error) {
        console.error('Error fetching subject progress:', error);
        res.status(500).json({ success: false, message: 'Error fetching subject progress' });
    }
};

// GET /api/progress/stats — user statistics (completed count, streak, rank, etc.)
exports.getProgressStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await UserProgress.aggregate([
            { $match: { userId: userId, completed: true } },
            { $group: { _id: '$subjectId', totalCompleted: { $sum: 1 }, lastCompleted: { $max: '$completedAt' } } }
        ]);

        const totalCompleted = await UserProgress.countDocuments({ userId, completed: true });

        const recentActivity = await UserProgress.find({ userId, completed: true })
            .sort({ completedAt: -1 })
            .limit(5)
            .populate('topicId', 'name')
            .populate('subjectId', 'name')
            .lean();

        const user = await require('../models/User').findById(userId);
        let streak = user.streak || 0;
        const currentPoints = user.points || 0;

        // Check if streak is broken
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil(Math.abs(today - lastActive) / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                streak = 0;
                if (user.streak !== 0) {
                    user.streak = 0;
                    await user.save();
                }
            }
        }

        // Calculate rank
        const User = require('../models/User');
        const betterUsersCount = await User.countDocuments({ points: { $gt: currentPoints } });
        const rank = betterUsersCount + 1;
        const totalUsers = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalCompleted,
                bySubject: stats,
                recentActivity,
                totalPoints: currentPoints,
                streak,
                rank: `${rank} / ${totalUsers}`,
                rankTier: currentPoints > 1000 ? 'Platinum' : currentPoints > 500 ? 'Gold' : currentPoints > 100 ? 'Silver' : 'Bronze'
            }
        });
    } catch (error) {
        console.error('Error fetching progress stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
    }
};

// GET /api/progress/heatmap — daily activity counts (topics + problems)
exports.getActivityHeatmap = async (req, res) => {
    try {
        const userId = req.user._id;
        const ProblemProgress = require('../models/ProblemProgress');

        const topicActivity = await UserProgress.aggregate([
            { $match: { userId, completed: true, completedAt: { $exists: true } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } }
        ]);

        const problemActivity = await ProblemProgress.aggregate([
            { $match: { userId, status: 'completed', completedAt: { $exists: true } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } }
        ]);

        // Merge topic + problem activity by date
        const activityMap = {};
        topicActivity.forEach(item => { activityMap[item._id] = (activityMap[item._id] || 0) + item.count; });
        problemActivity.forEach(item => { activityMap[item._id] = (activityMap[item._id] || 0) + item.count; });

        const heatmapData = Object.keys(activityMap).map(date => ({ date, count: activityMap[date] }));

        res.status(200).json({ success: true, data: heatmapData });
    } catch (error) {
        console.error('Error fetching activity heatmap:', error);
        res.status(500).json({ success: false, message: 'Error fetching activity heatmap', error: error.message });
    }
};
