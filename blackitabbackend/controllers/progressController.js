const UserProgress = require('../models/UserProgress');

// ═════════════════════════════════════════════════════════════════════════════
// HELPER: Compute streak from actual activity dates
// ═════════════════════════════════════════════════════════════════════════════
// Instead of trusting a stored number, we compute the streak from real data.
// This is the approach used by GitHub, LeetCode, and Duolingo.
//
// Algorithm:
//   1. Collect all activity dates (topics + problems + exam attempts)
//   2. Deduplicate → Set of "YYYY-MM-DD" strings
//   3. Walk backwards from today (or yesterday) counting consecutive days
//   4. Also compute longestStreak by scanning ALL consecutive runs
// ═════════════════════════════════════════════════════════════════════════════
async function computeStreakFromActivity(userId) {
    const ProblemProgress = require('../models/ProblemProgress');
    const Attempt = require('../models/Attempt');

    // Fetch all activity dates in parallel
    const [topicDates, problemDates, attemptDates] = await Promise.all([
        UserProgress.find({ userId, completed: true, completedAt: { $exists: true } })
            .select('completedAt').lean(),
        ProblemProgress.find({ userId, status: 'completed', completedAt: { $exists: true } })
            .select('completedAt').lean(),
        Attempt.find({ userId, attemptedAt: { $exists: true } })
            .select('attemptedAt').lean(),
    ]);

    // Build unique date-string set (YYYY-MM-DD)
    const dateSet = new Set();
    const toDateStr = (d) => {
        const dt = new Date(d);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };

    topicDates.forEach(d => dateSet.add(toDateStr(d.completedAt)));
    problemDates.forEach(d => dateSet.add(toDateStr(d.completedAt)));
    attemptDates.forEach(d => dateSet.add(toDateStr(d.attemptedAt)));

    if (dateSet.size === 0) {
        return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
    }

    // Sort dates ascending
    const sortedDates = [...dateSet].sort();
    const today = toDateStr(new Date());
    const yesterday = toDateStr(new Date(Date.now() - 86400000));

    // Current streak: walk backward from today (or yesterday)
    let currentStreak = 0;
    const lastDate = sortedDates[sortedDates.length - 1];

    if (lastDate === today || lastDate === yesterday) {
        // Start counting from the most recent active date
        let checkDate = new Date(lastDate + 'T00:00:00');
        for (let i = sortedDates.length - 1; i >= 0; i--) {
            const dateStr = toDateStr(checkDate);
            if (dateSet.has(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
    }
    // If last activity was more than 1 day ago, currentStreak = 0

    // Longest streak: scan all consecutive runs
    let longestStreak = 0;
    let runLength = 1;
    for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1] + 'T00:00:00');
        const curr = new Date(sortedDates[i] + 'T00:00:00');
        const diffDays = Math.round((curr - prev) / 86400000);

        if (diffDays === 1) {
            runLength++;
        } else {
            longestStreak = Math.max(longestStreak, runLength);
            runLength = 1;
        }
    }
    longestStreak = Math.max(longestStreak, runLength);

    return {
        currentStreak,
        longestStreak,
        totalActiveDays: dateSet.size
    };
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPER: Percentile-based tier
// ═════════════════════════════════════════════════════════════════════════════
// Uses actual user distribution instead of hardcoded thresholds.
// Tiers: Legendary (top 1%), Platinum (top 5%), Gold (top 20%),
//        Silver (top 50%), Bronze (bottom 50%)
// ═════════════════════════════════════════════════════════════════════════════
function getTierFromPercentile(percentile) {
    if (percentile >= 99) return 'Legendary';
    if (percentile >= 95) return 'Platinum';
    if (percentile >= 80) return 'Gold';
    if (percentile >= 50) return 'Silver';
    return 'Bronze';
}

// ═════════════════════════════════════════════════════════════════════════════
// XP configuration — difficulty-weighted scoring
// ═════════════════════════════════════════════════════════════════════════════
const XP_TABLE = {
    topic: 10,           // Completing a theory topic
    streakBonus: 5,      // Bonus when streak ≥ 7 days
};

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/progress/mark-complete — mark a topic as completed
// ═════════════════════════════════════════════════════════════════════════════
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

        // Compute XP with streak bonus
        const { currentStreak, longestStreak } = await computeStreakFromActivity(userId);
        let xpGain = XP_TABLE.topic;
        if (currentStreak >= 7) {
            xpGain += XP_TABLE.streakBonus;
        }

        // Update user: points + streak + longestStreak + lastActiveDate
        const user = await require('../models/User').findById(userId);
        user.points = (user.points || 0) + xpGain;
        user.xp = (user.xp || 0) + 10;
        user.streak = currentStreak;
        user.longestStreak = Math.max(user.longestStreak || 0, longestStreak);
        user.lastActiveDate = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: `Topic marked as complete (+${xpGain} XP)`,
            data: progress,
            xpGain,
            currentStreak});
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error marking topic as complete' });
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/progress — all completed topics for the user
// ═════════════════════════════════════════════════════════════════════════════
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
        
        res.status(500).json({ success: false, message: 'Error fetching progress' });
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/progress/:subjectId — completed topics for one subject
// ═════════════════════════════════════════════════════════════════════════════
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
        
        res.status(500).json({ success: false, message: 'Error fetching subject progress' });
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/progress/stats — MAIN STATS ENDPOINT
// ═════════════════════════════════════════════════════════════════════════════
// Returns: totalCompleted, streak, longestStreak, totalActiveDays,
//          points, rank (#N), percentile, tier, bySubject, recentActivity
// ═════════════════════════════════════════════════════════════════════════════
exports.getProgressStats = async (req, res) => {
    try {
        const userId = req.query.userId || req.user._id;
        const User = require('../models/User');

        // 1. Per-subject completion stats
        const subjectStats = await UserProgress.aggregate([
            { $match: { userId: new require('mongoose').Types.ObjectId(userId), completed: true } },
            { $group: { _id: '$subjectId', totalCompleted: { $sum: 1 }, lastCompleted: { $max: '$completedAt' } } }
        ]);

        // 2. Total completed count
        const totalCompleted = await UserProgress.countDocuments({ userId, completed: true });

        // 3. Recent activity (last 5)
        const recentActivity = await UserProgress.find({ userId: new require('mongoose').Types.ObjectId(userId), completed: true })
            .sort({ completedAt: -1 })
            .limit(5)
            .populate('subjectId', 'name')
            .populate('topicId', 'title')
            .lean();

        // 4. Compute TRUE streak from activity data (not from stored User.streak)
        const streakData = await computeStreakFromActivity(userId);

        // 5. Get user's current points and xp
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const currentPoints = user.points || 0;
        const currentXP = user.xp || 0;

        // Sync streak on User doc (keep it accurate for other queries)
        if (user.streak !== streakData.currentStreak || user.longestStreak < streakData.longestStreak) {
            user.streak = streakData.currentStreak;
            user.longestStreak = Math.max(user.longestStreak || 0, streakData.longestStreak);
            await user.save();
        }

        // 6. Percentile-based rank
        //    rank = position (1 = highest xp)
        //    percentile = what % of users you're better than
        const betterUsersCount = await User.countDocuments({ xp: { $gt: currentXP } });
        const rank = betterUsersCount + 1;
        const totalUsers = await User.countDocuments();
        const percentile = totalUsers > 1
            ? Math.round(((totalUsers - rank) / (totalUsers - 1)) * 100)
            : 0;

        // 7. Dynamic tier based on percentile
        const rankTier = totalUsers <= 1
            ? (currentPoints > 0 ? 'Silver' : 'Bronze')
            : getTierFromPercentile(percentile);

        // Update rating on user doc
        if (user.rating !== percentile || user.globalRank !== rank) {
            user.rating = percentile;
            user.globalRank = rank;
            await user.save();
        }

        res.status(200).json({
            success: true,
            data: {
                totalCompleted,
                bySubject: subjectStats,
                recentActivity,
                totalPoints: currentXP, // Dashboard uses this to display "XP"
                totalCoins: currentPoints, // If you ever need old points
                streak: streakData.currentStreak,
                longestStreak: streakData.longestStreak,
                totalActiveDays: streakData.totalActiveDays,
                rank: `#${rank}`,
                rankPosition: rank,
                totalUsers,
                percentile,
                rankTier}
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET /api/progress/heatmap — daily activity counts (topics + problems)
// ═════════════════════════════════════════════════════════════════════════════
exports.getActivityHeatmap = async (req, res) => {
    try {
        const userId = req.query.userId || req.user._id;
        const mongoose = require('mongoose');
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const ProblemProgress = require('../models/ProblemProgress');

        const topicActivity = await UserProgress.aggregate([
            { $match: { userId: userObjectId, completed: true, completedAt: { $exists: true } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } }
        ]);

        const problemActivity = await ProblemProgress.aggregate([
            { $match: { userId: userObjectId, status: 'completed', completedAt: { $exists: true } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } }
        ]);

        const Attempt = require('../models/Attempt');
        const examActivity = await Attempt.aggregate([
            { $match: { userId: userObjectId, attemptedAt: { $exists: true } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } }, count: { $sum: 1 } } }
        ]);

        // Merge topic + problem + exam activity by date
        const activityMap = {};
        topicActivity.forEach(item => { activityMap[item._id] = (activityMap[item._id] || 0) + item.count; });
        problemActivity.forEach(item => { activityMap[item._id] = (activityMap[item._id] || 0) + item.count; });
        examActivity.forEach(item => { activityMap[item._id] = (activityMap[item._id] || 0) + item.count; });

        const heatmapData = Object.keys(activityMap).map(date => ({ date, count: activityMap[date] }));

        res.status(200).json({ success: true, data: heatmapData });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error fetching activity heatmap' });
    }
};
