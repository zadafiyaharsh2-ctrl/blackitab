const Institute = require('../models/Institute');
const User = require('../models/User');
const ExamQuestion = require('../models/ExamQuestion');
const Post = require('../models/Post');
const Attempt = require('../models/Attempt');

// GET /api/institute/verify/:code
exports.verifyCode = async (req, res) => {
    try {
        const { code } = req.params;
        const institute = await Institute.findOne({ instituteCode: code.toUpperCase() });

        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }

        res.json({
            success: true,
            data: {
                id: institute._id,
                name: institute.name,
                code: institute.instituteCode
            }
        });
    } catch (error) {
        console.error('Verify Institute error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/institute/my
exports.getMyInstitute = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }
        const institute = await Institute.findById(req.user.instituteId);
        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }
        res.json({ success: true, data: institute });
    } catch (error) {
        console.error('Get my institute error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// INSTITUTE STATS
// ══════════════════════════════════════════════════════════════

// GET /api/institute/stats
exports.getInstituteStats = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const [members, questions, posts, attempts] = await Promise.all([
            User.countDocuments({ instituteId: instId }),
            ExamQuestion.countDocuments({ instituteId: instId }),
            Post.countDocuments({ user: { $in: await User.find({ instituteId: instId }).distinct('_id') } }),
            Attempt.countDocuments({ userId: { $in: await User.find({ instituteId: instId }).distinct('_id') } })
        ]);

        const roleCounts = await User.aggregate([
            { $match: { instituteId: instId } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        const roles = {};
        roleCounts.forEach(r => { roles[r._id] = r.count; });

        const pendingQuestions = await ExamQuestion.countDocuments({ instituteId: instId, approvalStatus: 'pending' });

        res.json({
            success: true,
            data: { members, questions, pendingQuestions, posts, attempts, roleCounts: roles }
        });
    } catch (error) {
        console.error('Institute stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// MEMBER MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/institute/members
exports.getMembers = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }
        const members = await User.find({ instituteId: req.user.instituteId })
            .select('-password')
            .sort({ role: 1, name: 1 });
        res.json({ success: true, data: members });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/institute/members — Add/create member to institute
exports.addMember = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        // Check existing user
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            // If they exist but have no institute, link them
            if (!existing.instituteId) {
                existing.instituteId = instId;
                if (role && ['student', 'teacher', 'hod'].includes(role)) existing.role = role;
                await existing.save();
                return res.json({ success: true, message: `Existing user "${existing.name}" linked to your institute` });
            }
            return res.status(400).json({ success: false, message: 'User already belongs to an institute' });
        }

        const validRoles = ['student', 'teacher', 'hod'];
        const assignedRole = validRoles.includes(role) ? role : 'student';

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: assignedRole,
            instituteId: instId
        });
        await newUser.save();

        res.status(201).json({ success: true, message: `User "${name}" created as ${assignedRole} in your institute` });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/institute/members/:id/role
exports.changeMemberRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['student', 'teacher', 'hod'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: `Invalid role. Must be: ${validRoles.join(', ')}` });
        }

        // Ensure target user is in same institute
        const targetUser = await User.findById(req.params.id);
        if (!targetUser || !targetUser.instituteId || targetUser.instituteId.toString() !== req.user.instituteId.toString()) {
            return res.status(400).json({ success: false, message: 'User not in your institute' });
        }

        targetUser.role = role;
        await targetUser.save();

        res.json({ success: true, message: `Role updated to ${role}` });
    } catch (error) {
        console.error('Change member role error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/institute/members/:id/ban — Ban/unban member
exports.toggleBanMember = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const target = await User.findById(req.params.id);
        if (!target || !target.instituteId || target.instituteId.toString() !== instId.toString()) {
            return res.status(400).json({ success: false, message: 'User not in your institute' });
        }
        target.isBanned = !target.isBanned;
        await target.save();
        res.json({ success: true, message: target.isBanned ? 'Member banned' : 'Member unbanned', data: { isBanned: target.isBanned } });
    } catch (error) {
        console.error('Toggle ban member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/institute/members/:id — Remove member from institute
exports.removeMember = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const target = await User.findById(req.params.id);
        if (!target || !target.instituteId || target.instituteId.toString() !== instId.toString()) {
            return res.status(400).json({ success: false, message: 'User not in your institute' });
        }
        // Don't delete the user — just unlink from institute
        target.instituteId = null;
        target.role = 'student';
        await target.save();
        res.json({ success: true, message: `Member "${target.name}" removed from institute` });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// QUESTION MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/institute/questions — List questions created by institute teachers
exports.listInstituteQuestions = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const questions = await ExamQuestion.find({ instituteId: instId })
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, data: questions });
    } catch (error) {
        console.error('List institute questions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/institute/questions/:id
exports.deleteInstituteQuestion = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const question = await ExamQuestion.findById(req.params.id);
        if (!question || !question.instituteId || question.instituteId.toString() !== instId.toString()) {
            return res.status(404).json({ success: false, message: 'Question not found in your institute' });
        }
        await ExamQuestion.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        console.error('Delete institute question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// POST MODERATION
// ══════════════════════════════════════════════════════════════

// GET /api/institute/posts — List posts by institute members
exports.listInstitutePosts = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const memberIds = await User.find({ instituteId: instId }).distinct('_id');
        const posts = await Post.find({ user: { $in: memberIds } })
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, data: posts });
    } catch (error) {
        console.error('List institute posts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/institute/posts/:id
exports.deleteInstitutePost = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        const memberIds = await User.find({ instituteId: instId }).distinct('_id');
        const post = await Post.findById(req.params.id);
        if (!post || !memberIds.some(id => id.equals(post.user))) {
            return res.status(404).json({ success: false, message: 'Post not found in your institute' });
        }
        await Post.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete institute post error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════════════

// GET /api/institute/analytics — Institute-level analytics
exports.getInstituteAnalytics = async (req, res) => {
    try {
        const instId = req.user.instituteId;
        if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

        const members = await User.find({ instituteId: instId }).select('_id name email role points xp streak').lean();
        const memberIds = members.map(m => m._id);

        // Leaderboard — top students by points
        const leaderboard = members
            .filter(m => m.role === 'student')
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 20);

        // Aggregate attempt stats
        const attemptStats = await Attempt.aggregate([
            { $match: { userId: { $in: memberIds } } },
            { $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
                avgTime: { $avg: '$timeTakenSeconds' }
            }}
        ]);

        const stats = attemptStats[0] || { totalAttempts: 0, correctAttempts: 0, avgTime: 0 };
        const accuracy = stats.totalAttempts > 0 ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) : 0;

        // Subject-wise accuracy
        const subjectStats = await Attempt.aggregate([
            { $match: { userId: { $in: memberIds } } },
            { $lookup: { from: 'examquestions', localField: 'questionId', foreignField: '_id', as: 'question' } },
            { $unwind: '$question' },
            { $group: {
                _id: '$question.subject',
                total: { $sum: 1 },
                correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
            }},
            { $project: {
                subject: '$_id',
                total: 1,
                correct: 1,
                accuracy: { $multiply: [{ $divide: ['$correct', '$total'] }, 100] }
            }},
            { $sort: { total: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                leaderboard,
                totalAttempts: stats.totalAttempts,
                accuracy,
                avgTimeSeconds: Math.round(stats.avgTime || 0),
                subjectStats
            }
        });
    } catch (error) {
        console.error('Institute analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
