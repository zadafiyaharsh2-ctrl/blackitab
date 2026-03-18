const AdminChat = require('../../models/AdminChat');
const User = require('../../models/User');
const Institute = require('../../models/Institute');

// ══════════════════════════════════════════════════════════════
// INSTITUTE ADMIN SIDE — Chat with System Admin
// ══════════════════════════════════════════════════════════════

// POST /api/admin-chat/send — Institute admin sends a message to system admin(s)
exports.sendMessage = async (req, res) => {
    try {
        const { message, receiverId } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }

        const chat = await AdminChat.create({
            senderId: req.user._id,
            senderModel: 'User',
            receiverId: receiverId || null,
            receiverModel: 'SystemAdmin',
            instituteId: req.user.instituteId,
            message: message.trim()
        });

        res.status(201).json({ success: true, data: chat });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/admin-chat/messages — Get conversation for my institute
exports.getMessages = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.status(400).json({ success: false, message: 'Not linked to an institute' });
        }

        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await AdminChat.find({ instituteId: req.user.instituteId })
            .populate('senderId', 'name email role username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Mark unread messages as read (ones sent TO this user)
        await AdminChat.updateMany(
            { instituteId: req.user.instituteId, receiverModel: 'User', read: false },
            { read: true }
        );

        res.json({ success: true, data: messages.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/admin-chat/unread-count
exports.getUnreadCount = async (req, res) => {
    try {
        if (!req.user.instituteId) {
            return res.json({ success: true, count: 0 });
        }
        const count = await AdminChat.countDocuments({
            instituteId: req.user.instituteId,
            receiverModel: 'User',
            read: false
        });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ══════════════════════════════════════════════════════════════
// SYSTEM ADMIN SIDE — Chat with institute admins
// ══════════════════════════════════════════════════════════════

// POST /api/admin-chat/admin/send — System admin sends a message to an institute
exports.adminSendMessage = async (req, res) => {
    try {
        const { message, instituteId, receiverId } = req.body;
        if (!message || !message.trim() || !instituteId) {
            return res.status(400).json({ success: false, message: 'message and instituteId are required' });
        }

        const chat = await AdminChat.create({
            senderId: req.admin._id,
            senderModel: 'SystemAdmin',
            receiverId: receiverId || null,
            receiverModel: 'User',
            instituteId,
            message: message.trim()
        });

        res.status(201).json({ success: true, data: chat });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/admin-chat/admin/institutes — List all institutes with unread counts
exports.adminGetInstitutes = async (req, res) => {
    try {
        const institutes = await Institute.find().select('name instituteCode').lean();

        // Get unread counts per institute
        const unreadCounts = await AdminChat.aggregate([
            { $match: { receiverModel: 'SystemAdmin', read: false } },
            { $group: { _id: '$instituteId', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        unreadCounts.forEach(u => { countMap[u._id.toString()] = u.count; });

        const result = institutes.map(inst => ({
            ...inst,
            unreadCount: countMap[inst._id.toString()] || 0
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/admin-chat/admin/messages/:instituteId — Get messages for a specific institute
exports.adminGetMessages = async (req, res) => {
    try {
        const { instituteId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await AdminChat.find({ instituteId })
            .populate('senderId', 'name email role username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Mark as read
        await AdminChat.updateMany(
            { instituteId, receiverModel: 'SystemAdmin', read: false },
            { read: true }
        );

        res.json({ success: true, data: messages.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
