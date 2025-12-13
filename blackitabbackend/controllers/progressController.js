/**
 * ============================================================================
 * PROGRESS CONTROLLER
 * ============================================================================
 * 
 * Handles API endpoints for tracking user progress through topics
 */

const UserProgress = require('../models/UserProgress');

/**
 * Mark a topic as completed for a user
 * Route: POST /api/progress/mark-complete
 * Body: { subjectId, topicId }
 * Auth: Required (user must be logged in)
 */
exports.markTopicComplete = async (req, res) => {
    try {
        const { subjectId, topicId } = req.body;
        const userId = req.user._id; // From auth middleware

        // Validation
        if (!subjectId || !topicId) {
            return res.status(400).json({
                success: false,
                message: 'Subject ID and Topic ID are required'
            });
        }

        // Check if progress already exists
        let progress = await UserProgress.findOne({ userId, topicId });

        if (progress && progress.completed) {
            // Already completed, do nothing
            return res.status(200).json({
                success: true,
                message: 'Topic already completed',
                data: progress
            });
        }

        // Create or update progress
        progress = await UserProgress.findOneAndUpdate(
            { userId, topicId },
            {
                userId,
                subjectId,
                topicId,
                completed: true,
                completedAt: new Date()
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        // Update User Streak
        const user = await require('../models/User').findById(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        if (lastActive) lastActive.setHours(0, 0, 0, 0);

        if (!lastActive) {
            // First time active
            user.streak = 1;
            user.lastActiveDate = new Date();
        } else {
            const diffTime = Math.abs(today - lastActive);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                user.streak += 1;
                user.lastActiveDate = new Date();
            } else if (diffDays > 1) {
                // Streak broken
                user.streak = 1;
                user.lastActiveDate = new Date();
            } else {
                // Same day, do nothing to streak, but update lastActiveDate to keep it fresh
                user.lastActiveDate = new Date();
            }
        }

        // Add points for topic completion (only if it wasn't completed before)
        user.points = (user.points || 0) + 10;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Topic marked as complete',
            data: progress
        });

    } catch (error) {
        console.error('Error marking topic complete:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking topic as complete',
            error: error.message
        });
    }
};

/**
 * Get all completed topics for a user
 * Route: GET /api/progress
 * Auth: Required (user must be logged in)
 */
exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.user._id; // From auth middleware

        // Find all completed topics for this user
        const progress = await UserProgress.find({ userId, completed: true })
            .select('subjectId topicId completedAt')
            .lean(); // Convert to plain JavaScript objects for better performance

        // Transform to frontend-friendly format
        // { subjectId: { topicId: true, topicId2: true } }
        const formattedProgress = {};

        progress.forEach(item => {
            const subjectId = item.subjectId.toString();
            const topicId = item.topicId.toString();

            if (!formattedProgress[subjectId]) {
                formattedProgress[subjectId] = {};
            }

            formattedProgress[subjectId][topicId] = true;
        });

        res.status(200).json({
            success: true,
            data: formattedProgress
        });

    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progress',
            error: error.message
        });
    }
};

/**
 * Get completed topics for a specific subject
 * Route: GET /api/progress/:subjectId
 * Auth: Required (user must be logged in)
 */
exports.getSubjectProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { subjectId } = req.params;

        // Find completed topics for this user and subject
        const progress = await UserProgress.find({
            userId,
            subjectId,
            completed: true
        })
            .select('topicId completedAt')
            .lean();

        // Transform to { topicId: true, topicId2: true }
        const formattedProgress = {};
        progress.forEach(item => {
            formattedProgress[item.topicId.toString()] = true;
        });

        res.status(200).json({
            success: true,
            data: formattedProgress
        });

    } catch (error) {
        console.error('Error fetching subject progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subject progress',
        });
    }
};

/**
 * Get user statistics (total completed, by subject, points, streak, activity)
 * Route: GET /api/progress/stats
 * Auth: Required (user must be logged in)
 */
exports.getProgressStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Aggregate subject-wise progress
        const stats = await UserProgress.aggregate([
            { $match: { userId: userId, completed: true } },
            {
                $group: {
                    _id: '$subjectId',
                    totalCompleted: { $sum: 1 },
                    lastCompleted: { $max: '$completedAt' }
                }
            }
        ]);

        // 2. Get total completed count
        const totalCompleted = await UserProgress.countDocuments({
            userId,
            completed: true
        });

        // 3. Get Recent Activity (last 5 items)
        // Populate topic and subject details to show names
        const recentActivity = await UserProgress.find({ userId, completed: true })
            .sort({ completedAt: -1 })
            .limit(5)
            .populate('topicId', 'name')
            .populate('subjectId', 'name')
            .lean();

        // 4. Calculate Points (e.g., 10 points per topic)
        const totalPoints = totalCompleted * 10;

        // 5. Get Streak and Points from User model
        const user = await require('../models/User').findById(userId);
        let streak = user.streak || 0;
        const currentPoints = user.points || 0;

        // Check if streak is broken (if last active was more than 1 day ago)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.lastActiveDate) {
            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(today - lastActive);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                // Streak is broken
                streak = 0;
                // Update DB only if it's not already 0 to avoid unnecessary writes
                if (user.streak !== 0) {
                    user.streak = 0;
                    await user.save();
                }
            }
        }

        // 6. Calculate Rank
        // Count users with more points than current user
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
                totalPoints: currentPoints, // Use persisted points
                streak,
                rank: `${rank} / ${totalUsers}`, // Return formatted rank string
                rankTier: currentPoints > 1000 ? 'Platinum' : currentPoints > 500 ? 'Gold' : currentPoints > 100 ? 'Silver' : 'Bronze'
            }
        });

    } catch (error) {
        console.error('Error fetching progress stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

/**
 * Get activity heatmap data (daily counts of completed topics and problems)
 * Route: GET /api/progress/heatmap
 * Auth: Required
 */
exports.getActivityHeatmap = async (req, res) => {
    try {
        const userId = req.user._id;
        const ProblemProgress = require('../models/ProblemProgress');

        // 1. Aggregate Topic Completions by Date
        const topicActivity = await UserProgress.aggregate([
            {
                $match: {
                    userId: userId,
                    completed: true,
                    completedAt: { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$completedAt" }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 2. Aggregate Problem Completions by Date
        const problemActivity = await ProblemProgress.aggregate([
            {
                $match: {
                    userId: userId,
                    status: 'completed',
                    completedAt: { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$completedAt" }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Merge Data
        const activityMap = {};

        topicActivity.forEach(item => {
            activityMap[item._id] = (activityMap[item._id] || 0) + item.count;
        });

        problemActivity.forEach(item => {
            activityMap[item._id] = (activityMap[item._id] || 0) + item.count;
        });

        // Convert to array format for frontend
        const heatmapData = Object.keys(activityMap).map(date => ({
            date,
            count: activityMap[date]
        }));

        res.status(200).json({
            success: true,
            data: heatmapData
        });

    } catch (error) {
        console.error('Error fetching activity heatmap:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity heatmap',
            error: error.message
        });
    }
};
