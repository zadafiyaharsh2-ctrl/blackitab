const express = require('express');
const router = express.Router();
const copilotController = require('../../controllers/copilotController');
const authMiddleware = require('../../middleware/auth');

// POST /api/copilot/chat
router.post('/chat', authMiddleware, copilotController.generateCopilotResponse);

module.exports = router;
