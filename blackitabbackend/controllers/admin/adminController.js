const SystemAdmin = require('../../models/SystemAdmin');
const User = require('../../models/User');
const Institute = require('../../models/Institute');
const Attempt = require('../../models/Attempt');
const Post = require('../../models/Post');
const ExamQuestion = require('../../models/ExamQuestion');

const Contest = require('../../models/Contest');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_ROLE_CHANGE_ERROR = 'Only teacher <-> hod role changes are allowed.';

const normalizeRoleValue = (role) => String(role || '').trim().toLowerCase();

const canAdminChangeRole = (currentRole, nextRole) => {
    if (!nextRole) return false;
    if (currentRole === nextRole) return true;
    return (currentRole === 'teacher' && nextRole === 'hod') || (currentRole === 'hod' && nextRole === 'teacher');
};

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
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PLATFORM STATS
// ══════════════════════════════════════════════════════════════

// GET /api/admin/stats
exports.getPlatformStats = async (req, res) => {
    try {
        const [totalUsers, totalInstitutes, totalAttempts, totalPosts, totalQuestions] = await Promise.all([
            User.countDocuments(),
            Institute.countDocuments(),
            Attempt.countDocuments(),
            Post.countDocuments(),
            ExamQuestion.countDocuments()
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

                dailyActiveUsers: dailyActiveUsers.length,
                roleCounts: roleCounts.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {})
            }
        });
    } catch (error) {
        
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
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/users/:id/role
exports.changeUserRole = async (req, res) => {
    try {
        const requestedRole = normalizeRoleValue(req.body.role);
        if (!requestedRole) {
            return res.status(400).json({ success: false, message: 'Role is required' });
        }

        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentRole = normalizeRoleValue(user.role);
        if (!canAdminChangeRole(currentRole, requestedRole)) {
            return res.status(403).json({ success: false, message: ADMIN_ROLE_CHANGE_ERROR });
        }

        if (requestedRole !== currentRole) {
            user.role = requestedRole;
            await user.save();
        }

        res.json({ success: true, message: `Role updated to ${requestedRole}`, data: user });
    } catch (error) {
        
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

        const validRoles = ['student', 'teacher', 'hod', 'institute'];
        const assignedRole = validRoles.includes(role) ? role : 'student';

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: assignedRole,
            instituteId,
            instituteCode: instituteId ? instituteCode.toUpperCase() : '',
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
            ExamQuestion.updateMany({ createdBy: req.params.id }, { $set: { createdBy: null } }),
            ExamQuestion.updateMany({ createdBy: req.params.id }, { $set: { createdBy: null } })
        ]);
        res.json({ success: true, message: 'User deleted and related data cleaned up' });
    } catch (error) {
        
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
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// QUESTION APPROVAL MANAGEMENT
// ══════════════════════════════════════════════════════════════

// GET /api/admin/questions?page=1&limit=20&exam=jee&subject=Physics
exports.listQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 20, exam, subject, search } = req.query;
        // Admins see all Published questions (which includes globals) plus explicitly isGlobal ones
        const filter = { status: 'Published', isActive: true };

        if (exam) filter.exam = exam;
        if (subject) filter.subject = { $regex: subject, $options: 'i' };
        if (search) filter.question = { $regex: search, $options: 'i' };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [questions, total] = await Promise.all([
            ExamQuestion.find(filter)
                .populate('createdBy', 'name email role')
                .populate('instituteId', 'name instituteCode')
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
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/admin/questions/:id/clone-global
exports.cloneToGlobal = async (req, res) => {
    try {
        const original = await ExamQuestion.findById(req.params.id);
        if (!original) {
            return res.status(404).json({ success: false, message: 'Original question not found' });
        }

        const clonedData = original.toObject();
        delete clonedData._id;
        delete clonedData.createdAt;
        delete clonedData.updatedAt;
        
        clonedData.instituteId = null;
        clonedData.departmentId = null;
        clonedData.isGlobal = true;
        clonedData.status = 'Published';
        clonedData.isModerated = false;
        clonedData.isActive = true;
        
        const newQuestion = await ExamQuestion.create(clonedData);

        res.status(201).json({ success: true, message: 'Question successfully cloned to Global Bank', data: newQuestion });
    } catch (error) {
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
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/questions/:id — Admin edits any question (full CRUD)
exports.updateQuestion = async (req, res) => {
    try {
        const question = await ExamQuestion.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const allowedQuestionFields = [
            'exam', 'subject', 'question', 'options', 'correctAnswer',
            'difficulty', 'explanation', 'tags', 'format', 'status',
            'isGlobal', 'isModerated', 'isActive', 'isProblem'
        ];
        const updates = {};
        for (const field of allowedQuestionFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }
        if (updates.correctAnswer !== undefined) updates.correctAnswer = parseInt(updates.correctAnswer);

        const updated = await ExamQuestion.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true, context: 'query' });

        res.json({ success: true, message: 'Question updated', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// PHASE 11: COMPREHENSIVE ADMIN CONTROL PANEL (SUPER ADMIN)
// ══════════════════════════════════════════════════════════════

// GET /api/admin/users/full/:id
exports.getUserFullDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('instituteId', 'name instituteCode');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/users/full/:id
exports.editUserFull = async (req, res) => {
    try {
        // Super Admin allowlist — expanded set of fields compared to regular editUser
        const superAdminAllowedFields = [
            'name', 'email', 'role', 'bio', 'points', 'xp', 'streak',
            'isVerified', 'isPrivate', 'isBanned', 'batchYear', 'division',
            'departmentId', 'departments', 'specialization', 'globalRank',
            'longestStreak', 'rating', 'followerCount', 'followingCount', 'subscriberCount'
        ];
        const updates = {};
        for (const field of superAdminAllowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const existingUser = await User.findById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (updates.role !== undefined) {
            const requestedRole = normalizeRoleValue(updates.role);
            const currentRole = normalizeRoleValue(existingUser.role);
            if (!canAdminChangeRole(currentRole, requestedRole)) {
                return res.status(403).json({ success: false, message: ADMIN_ROLE_CHANGE_ERROR });
            }
            updates.role = requestedRole;
        }

        // Handle institute mapping manually to ensure consistency
        if (updates.instituteCode !== undefined) {
            if (updates.instituteCode === '' || updates.instituteCode === null) {
                updates.instituteId = null;
                updates.instituteCode = '';
            } else {
                const institute = await Institute.findOne({ instituteCode: updates.instituteCode.toUpperCase() });
                if (!institute) {
                    return res.status(400).json({ success: false, message: `Invalid institute code: ${updates.instituteCode}` });
                }
                updates.instituteId = institute._id;
                updates.instituteCode = institute.instituteCode;
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ success: true, message: 'System Admin: User entirely updated', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

// GET /api/admin/institutes/:id/members
exports.getInstituteMembers = async (req, res) => {
    try {
        const members = await User.find({ instituteId: req.params.id })
            .select('name email role isBanned isVerified points streak xp departmentId')
            .sort({ role: 1, name: 1 });
        
        res.json({ success: true, data: members, total: members.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/institutes/full/:id
exports.editInstituteFull = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (updates.instituteCode) {
            updates.instituteCode = updates.instituteCode.toUpperCase();
        }

        const institute = await Institute.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
        
        // If institute code was changed, we optionally should update all users inside it.
        // For right now, Mongoose hooks or a mass update would be requested if needed, 
        // but typically Institute Codes don't change often. Let's do a mass update just in case.
        if (updates.instituteCode) {
            await User.updateMany(
                { instituteId: institute._id },
                { $set: { instituteCode: updates.instituteCode } }
            );
        }

        res.json({ success: true, message: 'System Admin: Institute entirely updated', data: institute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
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

        const existingUser = await User.findById(req.params.id);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.role !== undefined) {
            const requestedRole = normalizeRoleValue(updates.role);
            const currentRole = normalizeRoleValue(existingUser.role);
            if (!canAdminChangeRole(currentRole, requestedRole)) {
                return res.status(403).json({ success: false, message: ADMIN_ROLE_CHANGE_ERROR });
            }
            updates.role = requestedRole;
        }

        // Handle institute code change
        if (req.body.instituteCode !== undefined) {
            if (req.body.instituteCode === '' || req.body.instituteCode === null) {
                updates.instituteId = null;
                updates.instituteCode = '';
            } else {
                const institute = await Institute.findOne({ instituteCode: req.body.instituteCode.toUpperCase() });
                if (!institute) {
                    return res.status(400).json({ success: false, message: `Invalid institute code: ${req.body.instituteCode}` });
                }
                updates.instituteId = institute._id;
                updates.instituteCode = institute.instituteCode;
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

        res.json({ success: true, message: 'User updated', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/admin/questions — Admin creates question (Global)
exports.createQuestion = async (req, res) => {
    try {
        const { exam, subject, question, options, correctAnswer, difficulty, explanation, tags, format } = req.body;

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
            format: format || 'Digital',
            status: 'Published',
            isGlobal: true,
            createdBy: null,
            instituteId: null
        });

        res.status(201).json({ success: true, message: 'Question created globally', data: newQuestion });
    } catch (error) {
        
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

        const contest = await Contest.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        res.json({ success: true, message: 'Contest updated', data: contest });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ══════════════════════════════════════════════════════════════
// PHASE E: GLOBAL PARITY (INSTITUTES & ANALYTICS)
// ══════════════════════════════════════════════════════════════

// GET /api/admin/institutes
exports.getAllInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.find().sort({ createdAt: -1 });
        // Get member counts for each
        const memberCounts = await User.aggregate([
            { $match: { instituteId: { $ne: null } } },
            { $group: { _id: '$instituteId', count: { $sum: 1 } } }
        ]);
        const countsMap = {};
        memberCounts.forEach(c => countsMap[c._id.toString()] = c.count);

        const data = institutes.map(inst => ({
            ...inst.toObject(),
            memberCount: countsMap[inst._id.toString()] || 0
        }));

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/institutes/:id
exports.editInstitute = async (req, res) => {
    try {
        const allowedFields = ['name', 'instituteCode', 'subscriptionPlan', 'adminEmails'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        const institute = await Institute.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!institute) return res.status(404).json({ success: false, message: 'Institute not found' });
        res.json({ success: true, message: 'Institute updated', data: institute });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/admin/teachers
exports.getAllTeachersRatings = async (req, res) => {
    try {
        const teachers = await User.find({ role: { $in: ['teacher', 'hod'] } })
            .select('name email role instituteId')
            .populate('instituteId', 'name');

        const TeacherFeedback = require('../../models/TeacherFeedback');
        const ratings = await TeacherFeedback.aggregate([
            { $group: {
                _id: '$teacherId',
                avgRating: { $avg: '$rating' },
                feedbackCount: { $sum: 1 }
            }}
        ]);

        const ratingsMap = {};
        ratings.forEach(r => ratingsMap[r._id.toString()] = r);

        const data = teachers.map(t => {
            const r = ratingsMap[t._id.toString()] || { avgRating: 0, feedbackCount: 0 };
            return {
                _id: t._id,
                name: t.name,
                email: t.email,
                role: t.role,
                instituteName: t.instituteId ? t.instituteId.name : 'Independent',
                avgRating: r.avgRating > 0 ? Number(r.avgRating.toFixed(1)) : 0,
                feedbackCount: r.feedbackCount,
                isFlagged: r.feedbackCount > 3 && r.avgRating < 2.5
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/admin/analytics
exports.getGlobalAnalytics = async (req, res) => {
    try {
        const Attempt = require('../../models/Attempt');
        const Post = require('../../models/Post');
        
        const [totalAttempts, totalPosts, totalInstitutes, totalUsers] = await Promise.all([
            Attempt.countDocuments(),
            Post.countDocuments(),
            Institute.countDocuments(),
            User.countDocuments()
        ]);

        const recentSignups = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role');

        res.json({
            success: true,
            data: {
                overview: { totalAttempts, totalPosts, totalInstitutes, totalUsers },
                recentSignups
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// CLASS MATERIALS MANAGEMENT (Global Admin)
// ══════════════════════════════════════════════════════════════
const ClassMaterial = require('../../models/ClassMaterial');

// GET /api/admin/materials — list all materials system-wide
exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await ClassMaterial.find()
            .populate('teacherId', 'name email')
            .populate('batchId', 'name year section')
            .populate('instituteId', 'name instituteCode')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: materials });
    } catch (error) {
        console.error('Get All Materials Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PUT /api/admin/material/:id — update any material system-wide
exports.updateMaterial = async (req, res) => {
    try {
        const material = await ClassMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

        const { title, description, content, links, files } = req.body;
        if (title) material.title = title;
        if (description !== undefined) material.description = description;
        if (content !== undefined) material.content = content;
        if (Array.isArray(links)) material.links = links;
        if (Array.isArray(files)) material.files = files;
        material.updatedAt = new Date();
        await material.save();

        res.json({ success: true, data: material });
    } catch (error) {
        console.error('Update Admin Material Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// DELETE /api/admin/material/:id — delete any material system-wide
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await ClassMaterial.findByIdAndDelete(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

        res.json({ success: true, message: 'Material deleted' });
    } catch (error) {
        console.error('Delete Admin Material Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// BUG REPORT / TICKET MANAGEMENT
// ══════════════════════════════════════════════════════════════
const BugReport = require('../../models/BugReport');

// GET /api/admin/bugs
exports.getAllBugs = async (req, res) => {
    try {
        const bugs = await BugReport.find()
            .populate('user', 'name email role profileImage')
            .sort({ status: 1, createdAt: -1 }); // Open bugs first, then newest
        res.json({ success: true, data: bugs });
    } catch (error) {
        console.error('Error fetching bugs:', error);
        res.status(500).json({ success: false, message: 'Server error fetching bugs' });
    }
};

// PUT /api/admin/bugs/:id
exports.updateBug = async (req, res) => {
    try {
        const { status, adminFeedback } = req.body;
        const bug = await BugReport.findById(req.params.id);
        
        if (!bug) return res.status(404).json({ success: false, message: 'Bug not found' });

        if (status) bug.status = status;
        if (adminFeedback !== undefined) bug.adminFeedback = adminFeedback;

        await bug.save();

        res.json({ success: true, message: 'Bug updated successfully', data: bug });
    } catch (error) {
        console.error('Error updating bug:', error);
        res.status(500).json({ success: false, message: 'Server error updating bug' });
    }
};
