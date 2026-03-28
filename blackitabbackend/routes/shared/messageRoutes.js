const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/shared/messageController');
const protect = require('../../middleware/auth');
const { requireFeature } = require('../../middleware/featureFlags');
const { perUserLimit } = require('../../middleware/userRateLimit');

router.post('/send', protect, requireFeature('messages'), perUserLimit({ max: 30, windowMs: 60000, feature: 'messages' }), messageController.sendMessage);
router.get('/conversations', protect, messageController.getConversations);
router.get('/download/:messageId', protect, messageController.downloadMessageMedia);
router.get('/:userId', protect, messageController.getMessages);

module.exports = router;
