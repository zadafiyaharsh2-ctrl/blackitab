const Attempt = require('../models/Attempt');
const User = require('../models/User');
const ExamQuestion = require('../models/ExamQuestion');

// GET /api/analytics/overview
exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Accuracy & Total Speed
        const aggregateStats = await Attempt.aggregate([
            { $match: { userId } },
            { 
                $group: {
                    _id: null,
                    totalQuestions: { $sum: 1 },
                    correctAnswers: { $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] } },
                    totalTimeSeconds: { $sum: "$timeTakenSeconds" }
                }
            }
        ]);

        const stats = aggregateStats[0] || { totalQuestions: 0, correctAnswers: 0, totalTimeSeconds: 0 };
        const accuracy = stats.totalQuestions > 0 ? (stats.correctAnswers / stats.totalQuestions) * 100 : 0;
        const averageSpeed = stats.totalQuestions > 0 ? (stats.totalTimeSeconds / stats.totalQuestions) : 0;

        // 2. Activity Heatmap (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const heatmapData = await Attempt.aggregate([
            { $match: { userId, attemptedAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$attemptedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalQuestions: stats.totalQuestions,
                accuracy: accuracy.toFixed(2),
                averageSpeedSeconds: averageSpeed.toFixed(2),
                heatmap: heatmapData.map(d => ({ date: d._id, count: d.count }))
            }
        });
    } catch (error) {
        console.error('Get User Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/analytics/school
exports.getSchoolAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || !user.instituteId) {
            return res.status(400).json({ success: false, message: 'User is not part of an institute' });
        }
        if (user.role !== 'hod' && user.role !== 'teacher') {
            return res.status(403).json({ success: false, message: 'Access denied. Teachers/HODs only.' });
        }

        // Get all students in this institute
        const studentIds = await User.find({ instituteId: user.instituteId, role: 'student' }).distinct('_id');

        const totalAttempts = await Attempt.countDocuments({ userId: { $in: studentIds } });
        
        // This query mimics getting division/batch performance
        const studentPerformances = await Attempt.aggregate([
            { $match: { userId: { $in: studentIds } } },
            {
                $group: {
                    _id: "$userId",
                    solved: { $sum: 1 },
                    correct: { $sum: { $cond: ["$isCorrect", 1, 0] } }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalStudents: studentIds.length,
                totalInstitutionAttempts: totalAttempts,
                performances: studentPerformances
            }
        });

    } catch (error) {
        console.error('Get School Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
