const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// BlackBookEDU.ai-style conversation routes
router.post('/query', aiController.queryAI);
router.get('/chat-history', aiController.getChatHistory);

// Original blackitab routes (kept for compatibility)
router.post('/ask', aiController.askQuestion);
router.get('/history', aiController.getHistory);
router.delete('/history/clear', aiController.clearHistory);
router.delete('/:id', aiController.deleteQuestion);

module.exports = router;
