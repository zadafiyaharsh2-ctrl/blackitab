const Institute = require('../models/Institute');
const User = require('../models/User');

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
