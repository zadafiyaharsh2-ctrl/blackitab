const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/shared/messageController');
const protect = require('../../middleware/auth');

router.post('/send', protect, messageController.sendMessage);
router.get('/conversations', protect, messageController.getConversations);
router.get('/download/:messageId', protect, messageController.downloadMessageMedia);
router.get('/:userId', protect, messageController.getMessages);

module.exports = router;
