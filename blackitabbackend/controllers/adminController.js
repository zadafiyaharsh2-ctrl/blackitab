const SystemAdmin = require('../models/SystemAdmin');
const User = require('../models/User');
const Institute = require('../models/Institute');
const Attempt = require('../models/Attempt');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

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

// GET /api/admin/stats
exports.getPlatformStats = async (req, res) => {
    try {
        const [totalUsers, totalInstitutes, totalAttempts, totalPosts] = await Promise.all([
            User.countDocuments(),
            Institute.countDocuments(),
            Attempt.countDocuments(),
            Post.countDocuments()
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
                dailyActiveUsers: dailyActiveUsers.length,
                roleCounts: roleCounts.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {})
            }
        });
    } catch (error) {
        console.error('Get platform stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

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
