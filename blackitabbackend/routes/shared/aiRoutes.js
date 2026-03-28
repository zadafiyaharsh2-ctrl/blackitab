const express = require('express');
const router = express.Router();
const aiController = require('../../controllers/shared/aiController');
const authMiddleware = require('../../middleware/auth');
const { rateLimit } = require('express-rate-limit');

const aiChatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 chat messages per 15 minutes
    message: { ok: false, message: 'AI chat limit reached to prevent excessive costs. Please wait a few minutes.' }
});

router.use(authMiddleware);

// BlackBookEDU.ai-style conversation routes
router.post('/chats', aiChatLimiter, aiController.queryAI);              // Create or append to a chat (optionally pass chatId)
router.get('/chats', aiController.getChatHistory);        // Get list of all chat sessions for user
router.get('/chats/:id', aiController.getSingleChat);     // Get full messages for a specific chat session
router.delete('/chats/:id', aiController.deleteChat);     // Delete a specific chat session

// Original RANKLEN routes (kept for compatibility)
router.post('/ask', aiChatLimiter, aiController.askQuestion);
router.get('/history', aiController.getHistory);
router.delete('/history/clear', aiController.clearHistory);
router.delete('/:id', aiController.deleteChat);

module.exports = router;
