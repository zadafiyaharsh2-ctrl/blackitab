const SystemAdmin = require('../models/SystemAdmin');
const User = require('../models/User');
const Institute = require('../models/Institute');
const Attempt = require('../models/Attempt');
const Post = require('../models/Post');
const ExamQuestion = require('../models/ExamQuestion');
const Contest = require('../models/Contest');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════

// POST /api/admin/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required' });
        }

        const admin = await SystemAdmin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        const token = jwt.sign(
            { adminId: admin._id, isSystemAdmin: true },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PLATFORM STATS
// ══════════════════════════════════════════════════════════════

// GET /api/admin/stats
exports.getPlatformStats = async (req, res) => {
    try {
        const [totalUsers, totalInstitutes, totalAttempts, totalPosts, totalQuestions, pendingQuestions] = await Promise.all([
            User.countDocuments(),
            Institute.countDocuments(),
            Attempt.countDocuments(),
            Post.countDocuments(),
            ExamQuestion.countDocuments(),
            ExamQuestion.countDocuments({ approvalStatus: 'pending' })
        ]);

        const roleCounts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyActiveUsers = await Attempt.distinct('userId', { attemptedAt: { $gte: today } });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalInstitutes,
                totalAttempts,
                totalPosts,
                totalQuestions,
                pendingQuestions,
                dailyActiveUsers: dailyActiveUsers.length,
                roleCounts: roleCounts.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {})
            }
        });
    } catch (error) {
        console.error('Get platform stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/admin/users?page=1&limit=20&role=student&search=name
exports.listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search, instituteId } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (instituteId) filter.instituteId = instituteId;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .populate('instituteId', 'name instituteCode')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('instituteId', 'name instituteCode');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/users/:id/role
exports.changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const validRoles = ['student', 'teacher', 'hod', 'institute_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: `Invalid role. Must be: ${validRoles.join(', ')}` });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: `Role updated to ${role}`, data: user });
    } catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/users/:id/ban
exports.toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isBanned = !user.isBanned;
        await user.save();
        res.json({
            success: true,
            message: user.isBanned ? 'User banned' : 'User unbanned',
            data: { isBanned: user.isBanned }
        });
    } catch (error) {
        console.error('Toggle ban error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/admin/users — Admin creates a new user (any role, bypass validations)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, instituteCode, batchYear, division } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'A user with this email already exists' });
        }

        // Resolve institute code to ID if provided
        let instituteId = null;
        if (instituteCode) {
            const institute = await Institute.findOne({ instituteCode: instituteCode.toUpperCase() });
            if (!institute) {
                return res.status(400).json({ success: false, message: `Invalid institute code: ${instituteCode}` });
            }
            instituteId = institute._id;
        }

        const validRoles = ['student', 'teacher', 'hod', 'institute_admin'];
        const assignedRole = validRoles.includes(role) ? role : 'student';

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: assignedRole,
            instituteId,
            batchYear: batchYear || undefined,
            division: division || undefined
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: `User "${name}" created as ${assignedRole}`,
            data: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                instituteId: newUser.instituteId
            }
        });
    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Clean up related data
        await Promise.all([
            Post.deleteMany({ userId: req.params.id }),
            Attempt.deleteMany({ userId: req.params.id }),
            ExamQuestion.updateMany({ createdBy: req.params.id }, { $set: { createdBy: null } })
        ]);
        res.json({ success: true, message: 'User deleted and related data cleaned up' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// INSTITUTE MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/admin/institutes
exports.listInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.find().sort({ createdAt: -1 });

        // Enrich with member counts
        const enriched = await Promise.all(institutes.map(async (inst) => {
            const memberCount = await User.countDocuments({ instituteId: inst._id });
            return { ...inst.toObject(), memberCount };
        }));

        res.json({ success: true, data: enriched });
    } catch (error) {
        console.error('List institutes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/admin/institutes
exports.createInstitute = async (req, res) => {
    try {
        const { name, instituteCode, subscriptionPlan, adminEmails } = req.body;
        if (!name || !instituteCode) {
            return res.status(400).json({ success: false, message: 'Name and institute code required' });
        }

        const existing = await Institute.findOne({ instituteCode: instituteCode.toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Institute code already exists' });
        }

        const institute = await Institute.create({
            name,
            instituteCode: instituteCode.toUpperCase(),
            subscriptionPlan: subscriptionPlan || 'free',
            adminEmails: adminEmails || []
        });

        res.status(201).json({ success: true, data: institute });
    } catch (error) {
        console.error('Create institute error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/admin/institutes/:id
exports.deleteInstitute = async (req, res) => {
    try {
        const institute = await Institute.findByIdAndDelete(req.params.id);
        if (!institute) {
            return res.status(404).json({ success: false, message: 'Institute not found' });
        }

        // Unlink users from the deleted institute
        await User.updateMany({ instituteId: req.params.id }, { $set: { instituteId: null } });

        res.json({ success: true, message: 'Institute deleted and users unlinked' });
    } catch (error) {
        console.error('Delete institute error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// QUESTION APPROVAL MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/admin/questions?page=1&limit=20&status=pending&exam=jee&subject=Physics
exports.listQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, exam, subject, search } = req.query;
        const filter = {};

        if (status) filter.approvalStatus = status;
        if (exam) filter.exam = exam;
        if (subject) filter.subject = { $regex: subject, $options: 'i' };
        if (search) filter.question = { $regex: search, $options: 'i' };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [questions, total] = await Promise.all([
            ExamQuestion.find(filter)
                .populate('createdBy', 'name email role')
                .populate('instituteId', 'name instituteCode')
                .populate('approvedBy', 'username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ExamQuestion.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: questions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('List questions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/admin/questions/pending
exports.listPendingQuestions = async (req, res) => {
    try {
        const questions = await ExamQuestion.find({ approvalStatus: 'pending' })
            .populate('createdBy', 'name email role')
            .populate('instituteId', 'name instituteCode')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: questions, total: questions.length });
    } catch (error) {
        console.error('List pending questions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/questions/:id/approve
exports.approveQuestion = async (req, res) => {
    try {
        const question = await ExamQuestion.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        question.approvalStatus = 'approved';
        question.approvedBy = req.admin._id;
        question.approvalNote = '';
        await question.save();

        res.json({ success: true, message: 'Question approved for global visibility', data: question });
    } catch (error) {
        console.error('Approve question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/questions/:id/reject
exports.rejectQuestion = async (req, res) => {
    try {
        const { note } = req.body;
        const question = await ExamQuestion.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        question.approvalStatus = 'rejected';
        question.approvalNote = note || 'Rejected by admin';
        question.approvedBy = req.admin._id;
        await question.save();

        res.json({ success: true, message: 'Question rejected', data: question });
    } catch (error) {
        console.error('Reject question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/admin/questions/:id
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await ExamQuestion.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// POST MODERATION
// ══════════════════════════════════════════════════════════════

// GET /api/admin/posts?page=1&limit=20
exports.listPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [posts, total] = await Promise.all([
            Post.find()
                .populate('userId', 'name email profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Post.countDocuments()
        ]);

        res.json({
            success: true,
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('List posts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/admin/posts/:id
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// CONTEST MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/admin/contests
exports.listContests = async (req, res) => {
    try {
        const contests = await Contest.find().sort({ createdAt: -1 });
        res.json({ success: true, data: contests });
    } catch (error) {
        console.error('List contests error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/admin/contests/:id
exports.deleteContest = async (req, res) => {
    try {
        const contest = await Contest.findByIdAndDelete(req.params.id);
        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }
        res.json({ success: true, message: 'Contest deleted' });
    } catch (error) {
        console.error('Delete contest error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE A: ADDITIONAL ADMIN CRUD (USER EDIT, QUESTION CREATE, CONTEST CREATE/EDIT)
// ══════════════════════════════════════════════════════════════

// PUT /api/admin/users/:id — Edit any user field
exports.editUser = async (req, res) => {
    try {
        const allowedFields = ['name', 'email', 'role', 'bio', 'points', 'xp', 'streak', 'isVerified', 'isPrivate', 'batchYear', 'division'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Handle institute code change
        if (req.body.instituteCode !== undefined) {
            if (req.body.instituteCode === '' || req.body.instituteCode === null) {
                updates.instituteId = null;
            } else {
                const institute = await Institute.findOne({ instituteCode: req.body.instituteCode.toUpperCase() });
                if (!institute) {
                    return res.status(400).json({ success: false, message: `Invalid institute code: ${req.body.instituteCode}` });
                }
                updates.instituteId = institute._id;
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User updated', data: user });
    } catch (error) {
        console.error('Edit user error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// POST /api/admin/questions — Admin creates question (auto-approved)
exports.createQuestion = async (req, res) => {
    try {
        const { exam, subject, question, options, correctAnswer, difficulty, explanation, tags, isPublic } = req.body;

        if (!exam || !subject || !question || !options || correctAnswer === undefined) {
            return res.status(400).json({ success: false, message: 'Exam, subject, question, options, and correctAnswer are required' });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ success: false, message: 'At least 2 options are required' });
        }

        const newQuestion = await ExamQuestion.create({
            exam,
            subject,
            question,
            options,
            correctAnswer: parseInt(correctAnswer),
            difficulty: difficulty || 'Medium',
            explanation: explanation || '',
            tags: tags || [],
            isPublic: isPublic !== false,
            approvalStatus: 'approved', // Admin-created = auto-approved
            approvedBy: req.admin._id,
            createdBy: null, // Created by system admin, not a regular user
            instituteId: null
        });

        res.status(201).json({ success: true, message: 'Question created and auto-approved', data: newQuestion });
    } catch (error) {
        console.error('Admin create question error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/admin/contests — Create contest
exports.createContest = async (req, res) => {
    try {
        const { title, description, startTime, endTime, difficultyLevel, questionIds } = req.body;

        if (!title || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'Title, startTime, and endTime are required' });
        }

        const contest = await Contest.create({
            title,
            description: description || '',
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            difficultyLevel: difficultyLevel || 'Intermediate',
            questions: questionIds || [],
            isActive: false
        });

        res.status(201).json({ success: true, message: 'Contest created', data: contest });
    } catch (error) {
        console.error('Create contest error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/contests/:id — Edit contest
exports.editContest = async (req, res) => {
    try {
        const allowedFields = ['title', 'description', 'startTime', 'endTime', 'difficultyLevel', 'isActive'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Handle question IDs update
        if (req.body.questionIds !== undefined) {
            updates.questions = req.body.questionIds;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        const contest = await Contest.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        res.json({ success: true, message: 'Contest updated', data: contest });
    } catch (error) {
        console.error('Edit contest error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
