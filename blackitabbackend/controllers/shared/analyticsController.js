/**
 * ============================================================================
 * ANALYTICS CONTROLLER — Real Data, No Dummies
 * ============================================================================
 *
 * All analytics are computed from real database queries:
 *   - Attempt collection    → accuracy, speed, activity
 *   - UserProgress collection → theory topics completed
 *   - User collection        → ranks, streaks, XP, roles, institute
 *   - ExamQuestion collection → subject mapping
 *
 * Endpoints:
 *   GET /api/analytics/overview               → Student's own analytics
 *   GET /api/analytics/school                  → Institute student list + stats (teacher+)
 *   GET /api/analytics/school/student/:studentId → Deep-dive for one student (teacher+)
 *   GET /api/analytics/school/trends           → Weekly trends for the institute (teacher+)
 */

const Attempt = require('../../models/Attempt');
const User = require('../../models/User');
const ExamQuestion = require('../../models/ExamQuestion');
const UserProgress = require('../../models/UserProgress');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/overview — Student's own analytics
// ─────────────────────────────────────────────────────────────────────────────
exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Accuracy & Speed
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

        // 2. Activity Heatmap (Last 90 Days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const heatmapData = await Attempt.aggregate([
            { $match: { userId, attemptedAt: { $gte: ninetyDaysAgo } } },
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
                accuracy: parseFloat(accuracy.toFixed(2)),
                averageSpeedSeconds: parseFloat(averageSpeed.toFixed(2)),
                heatmap: heatmapData.map(d => ({ date: d._id, count: d.count }))
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/school — Institute Student List + Stats
// ─────────────────────────────────────────────────────────────────────────────
// Returns every student in the caller's institute with their computed stats.
// Accessible by: teacher, hod, institute
// ─────────────────────────────────────────────────────────────────────────────
exports.getSchoolAnalytics = async (req, res) => {
    try {
        const caller = req.user;

        if (!caller.instituteId) {
            return res.status(400).json({ success: false, message: 'You are not linked to any institute.' });
        }

        // Fetch institute info
        const Institute = require('../../models/Institute');
        const institute = await Institute.findById(caller.instituteId);

        // Fetch all students in this institute
        const students = await User.find({
            instituteId: caller.instituteId,
            role: 'student'
        }).select('name email profileImage batchYear division points globalRank streak longestStreak rating createdAt').lean();

        if (students.length === 0) {
            return res.json({
                success: true,
                data: {
                    institute: { name: institute?.name || 'Unknown', code: institute?.instituteCode || '' },
                    totalStudents: 0,
                    students: [],
                    divisionBreakdown: [],
                    batchBreakdown: [],
                    aggregateStats: { avgAccuracy: 0, totalAttempts: 0, activeThisWeek: 0 }
                }
            });
        }

        const studentIds = students.map(s => s._id);

        // Per-student attempt stats (one aggregation for all students)
        const attemptStats = await Attempt.aggregate([
            { $match: { userId: { $in: studentIds } } },
            {
                $group: {
                    _id: "$userId",
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: ["$isCorrect", 1, 0] } },
                    totalTimeSec: { $sum: "$timeTakenSeconds" },
                    lastAttempt: { $max: "$attemptedAt" }
                }
            }
        ]);

        // Per-student theory progress count
        const progressStats = await UserProgress.aggregate([
            { $match: { userId: { $in: studentIds }, completed: true } },
            {
                $group: {
                    _id: "$userId",
                    topicsCompleted: { $sum: 1 }
                }
            }
        ]);

        // Build lookup maps
        const attemptMap = {};
        attemptStats.forEach(a => { attemptMap[a._id.toString()] = a; });
        const progressMap = {};
        progressStats.forEach(p => { progressMap[p._id.toString()] = p; });

        // Active this week check
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Merge everything into student objects
        let totalAccuracy = 0;
        let totalAttempts = 0;
        let activeThisWeek = 0;

        const enrichedStudents = students.map(s => {
            const sid = s._id.toString();
            const attempts = attemptMap[sid] || { totalAttempts: 0, correctAttempts: 0, totalTimeSec: 0, lastAttempt: null };
            const progress = progressMap[sid] || { topicsCompleted: 0 };
            const accuracy = attempts.totalAttempts > 0
                ? parseFloat(((attempts.correctAttempts / attempts.totalAttempts) * 100).toFixed(1))
                : 0;

            totalAccuracy += accuracy;
            totalAttempts += attempts.totalAttempts;
            if (attempts.lastAttempt && new Date(attempts.lastAttempt) >= oneWeekAgo) {
                activeThisWeek++;
            }

            return {
                _id: s._id,
                name: s.name,
                email: s.email,
                profileImage: s.profileImage,
                batchYear: s.batchYear || 'Unassigned',
                division: s.division || 'Unassigned',
                points: s.points || 0,
                globalRank: s.globalRank || 0,
                streak: s.streak || 0,
                longestStreak: s.longestStreak || 0,
                rating: s.rating || 0,
                accuracy,
                totalAttempts: attempts.totalAttempts,
                correctAttempts: attempts.correctAttempts,
                avgSpeed: attempts.totalAttempts > 0 ? parseFloat((attempts.totalTimeSec / attempts.totalAttempts).toFixed(1)) : 0,
                topicsCompleted: progress.topicsCompleted,
                lastActive: attempts.lastAttempt,
                joinedAt: s.createdAt
            };
        });

        // Division breakdown
        const divisionMap = {};
        enrichedStudents.forEach(s => {
            if (!divisionMap[s.division]) {
                divisionMap[s.division] = { division: s.division, count: 0, totalAccuracy: 0, totalAttempts: 0 };
            }
            divisionMap[s.division].count++;
            divisionMap[s.division].totalAccuracy += s.accuracy;
            divisionMap[s.division].totalAttempts += s.totalAttempts;
        });
        const divisionBreakdown = Object.values(divisionMap).map(d => ({
            division: d.division,
            studentCount: d.count,
            avgAccuracy: d.count > 0 ? parseFloat((d.totalAccuracy / d.count).toFixed(1)) : 0,
            totalAttempts: d.totalAttempts
        }));

        // Batch breakdown
        const batchMap = {};
        enrichedStudents.forEach(s => {
            if (!batchMap[s.batchYear]) {
                batchMap[s.batchYear] = { batch: s.batchYear, count: 0, totalAccuracy: 0 };
            }
            batchMap[s.batchYear].count++;
            batchMap[s.batchYear].totalAccuracy += s.accuracy;
        });
        const batchBreakdown = Object.values(batchMap).map(b => ({
            batch: b.batch,
            studentCount: b.count,
            avgAccuracy: b.count > 0 ? parseFloat((b.totalAccuracy / b.count).toFixed(1)) : 0
        }));

        // Staff counts
        const staffCounts = await User.aggregate([
            { $match: { instituteId: caller.instituteId, role: { $ne: 'student' } } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                institute: {
                    name: institute?.name || 'Unknown',
                    code: institute?.instituteCode || '',
                    plan: institute?.subscriptionPlan || 'free'
                },
                totalStudents: students.length,
                staffCounts: staffCounts.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
                students: enrichedStudents.sort((a, b) => b.points - a.points),
                divisionBreakdown,
                batchBreakdown,
                aggregateStats: {
                    avgAccuracy: students.length > 0 ? parseFloat((totalAccuracy / students.length).toFixed(1)) : 0,
                    totalAttempts,
                    activeThisWeek
                }
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/school/student/:studentId — Per-Student Deep Dive
// ─────────────────────────────────────────────────────────────────────────────
// Returns detailed analytics for a single student in the caller's institute.
// ─────────────────────────────────────────────────────────────────────────────
exports.getStudentDetail = async (req, res) => {
    try {
        const caller = req.user;
        const { studentId } = req.params;

        // Verify student is in same institute
        const student = await User.findById(studentId).select('-password').lean();
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        if (!student.instituteId || student.instituteId.toString() !== caller.instituteId?.toString()) {
            return res.status(403).json({ success: false, message: 'Student is not in your institute' });
        }

        const studentObjectId = student._id;

        // 1. Subject-wise accuracy breakdown
        const subjectBreakdown = await Attempt.aggregate([
            { $match: { userId: studentObjectId } },
            {
                $lookup: {
                    from: 'examquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$question.subject',
                    totalAttempts: { $sum: 1 },
                    correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                    totalTimeSec: { $sum: '$timeTakenSeconds' }
                }
            },
            { $sort: { totalAttempts: -1 } }
        ]);

        // 2. Weekly activity (last 8 weeks)
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

        const weeklyActivity = await Attempt.aggregate([
            { $match: { userId: studentObjectId, attemptedAt: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: {
                        year: { $isoWeekYear: "$attemptedAt" },
                        week: { $isoWeek: "$attemptedAt" }
                    },
                    attempts: { $sum: 1 },
                    correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
                }
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]);

        // 3. Difficulty breakdown
        const difficultyBreakdown = await Attempt.aggregate([
            { $match: { userId: studentObjectId } },
            {
                $lookup: {
                    from: 'examquestions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'question'
                }
            },
            { $unwind: { path: '$question', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$question.difficulty',
                    totalAttempts: { $sum: 1 },
                    correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
                }
            }
        ]);

        // 4. Theory topics completed
        const topicsCompleted = await UserProgress.countDocuments({
            userId: studentObjectId,
            completed: true
        });

        // 5. Recent activity (last 20 attempts with question text)
        const recentAttempts = await Attempt.find({ userId: studentObjectId })
            .sort({ attemptedAt: -1 })
            .limit(20)
            .populate('questionId', 'question subject difficulty')
            .lean();

        // 6. Overall stats
        const overallStats = await Attempt.aggregate([
            { $match: { userId: studentObjectId } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                    totalTimeSec: { $sum: '$timeTakenSeconds' }
                }
            }
        ]);
        const overall = overallStats[0] || { totalAttempts: 0, correct: 0, totalTimeSec: 0 };

        res.json({
            success: true,
            data: {
                student: {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    profileImage: student.profileImage,
                    batchYear: student.batchYear || 'Unassigned',
                    division: student.division || 'Unassigned',
                    points: student.points || 0,
                    globalRank: student.globalRank || 0,
                    streak: student.streak || 0,
                    longestStreak: student.longestStreak || 0,
                    rating: student.rating || 0,
                    joinedAt: student.createdAt
                },
                overallStats: {
                    totalAttempts: overall.totalAttempts,
                    correctAttempts: overall.correct,
                    accuracy: overall.totalAttempts > 0
                        ? parseFloat(((overall.correct / overall.totalAttempts) * 100).toFixed(1))
                        : 0,
                    avgSpeed: overall.totalAttempts > 0
                        ? parseFloat((overall.totalTimeSec / overall.totalAttempts).toFixed(1))
                        : 0,
                    topicsCompleted
                },
                subjectBreakdown: subjectBreakdown.map(s => ({
                    subject: s._id || 'Unknown',
                    totalAttempts: s.totalAttempts,
                    correct: s.correct,
                    accuracy: s.totalAttempts > 0 ? parseFloat(((s.correct / s.totalAttempts) * 100).toFixed(1)) : 0,
                    avgSpeed: s.totalAttempts > 0 ? parseFloat((s.totalTimeSec / s.totalAttempts).toFixed(1)) : 0
                })),
                difficultyBreakdown: difficultyBreakdown.map(d => ({
                    difficulty: d._id || 'Unknown',
                    totalAttempts: d.totalAttempts,
                    correct: d.correct,
                    accuracy: d.totalAttempts > 0 ? parseFloat(((d.correct / d.totalAttempts) * 100).toFixed(1)) : 0
                })),
                weeklyActivity: weeklyActivity.map(w => ({
                    week: `W${w._id.week}`,
                    year: w._id.year,
                    attempts: w.attempts,
                    correct: w.correct,
                    accuracy: w.attempts > 0 ? parseFloat(((w.correct / w.attempts) * 100).toFixed(1)) : 0
                })),
                recentAttempts: recentAttempts.map(a => ({
                    question: a.questionId?.question || 'Deleted question',
                    subject: a.questionId?.subject || 'Unknown',
                    difficulty: a.questionId?.difficulty || 'Unknown',
                    isCorrect: a.isCorrect,
                    selectedOption: a.selectedOption,
                    timeTaken: a.timeTakenSeconds,
                    date: a.attemptedAt
                }))
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/school/trends — Institute Weekly Trends
// ─────────────────────────────────────────────────────────────────────────────
exports.getInstituteTrends = async (req, res) => {
    try {
        const caller = req.user;

        if (!caller.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute.' });
        }

        const studentIds = await User.find({
            instituteId: caller.instituteId,
            role: 'student'
        }).distinct('_id');

        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

        // Weekly attempt trends
        const weeklyTrends = await Attempt.aggregate([
            { $match: { userId: { $in: studentIds }, attemptedAt: { $gte: eightWeeksAgo } } },
            {
                $group: {
                    _id: {
                        year: { $isoWeekYear: "$attemptedAt" },
                        week: { $isoWeek: "$attemptedAt" }
                    },
                    totalAttempts: { $sum: 1 },
                    correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                    uniqueStudents: { $addToSet: "$userId" }
                }
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]);

        // New student signups per week
        const newStudentsPerWeek = await User.aggregate([
            {
                $match: {
                    instituteId: caller.instituteId,
                    role: 'student',
                    createdAt: { $gte: eightWeeksAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $isoWeekYear: "$createdAt" },
                        week: { $isoWeek: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]);

        // Top 5 most active students this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const topActiveThisWeek = await Attempt.aggregate([
            { $match: { userId: { $in: studentIds }, attemptedAt: { $gte: oneWeekAgo } } },
            {
                $group: {
                    _id: "$userId",
                    attempts: { $sum: 1 },
                    correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
                }
            },
            { $sort: { attempts: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' }
        ]);

        res.json({
            success: true,
            data: {
                weeklyTrends: weeklyTrends.map(w => ({
                    week: `W${w._id.week}`,
                    year: w._id.year,
                    totalAttempts: w.totalAttempts,
                    correctAttempts: w.correctAttempts,
                    accuracy: w.totalAttempts > 0 ? parseFloat(((w.correctAttempts / w.totalAttempts) * 100).toFixed(1)) : 0,
                    activeStudents: w.uniqueStudents.length
                })),
                newStudentsPerWeek: newStudentsPerWeek.map(w => ({
                    week: `W${w._id.week}`,
                    year: w._id.year,
                    count: w.count
                })),
                topActiveThisWeek: topActiveThisWeek.map(t => ({
                    name: t.user.name,
                    profileImage: t.user.profileImage,
                    attempts: t.attempts,
                    correct: t.correct,
                    accuracy: t.attempts > 0 ? parseFloat(((t.correct / t.attempts) * 100).toFixed(1)) : 0
                }))
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
