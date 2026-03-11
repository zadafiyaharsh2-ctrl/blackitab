const express = require('express');
const router = express.Router();
const adminChatController = require('../../controllers/admin/adminChatController');
const protect = require('../../middleware/auth');
const { requireMinRole, requireAdmin } = require('../../middleware/roleMiddleware');

// ── Institute Admin side (requires auth + institute_admin role) ──
router.post('/send', protect, requireMinRole('institute_admin'), adminChatController.sendMessage);
router.get('/messages', protect, requireMinRole('institute_admin'), adminChatController.getMessages);
router.get('/unread-count', protect, requireMinRole('institute_admin'), adminChatController.getUnreadCount);

// ── System Admin side (requires admin auth) ──
router.post('/admin/send', requireAdmin, adminChatController.adminSendMessage);
router.get('/admin/institutes', requireAdmin, adminChatController.adminGetInstitutes);
router.get('/admin/messages/:instituteId', requireAdmin, adminChatController.adminGetMessages);

module.exports = router;
