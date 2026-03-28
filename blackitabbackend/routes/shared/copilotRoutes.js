const express = require('express');
const router = express.Router();
const copilotController = require('../../controllers/copilotController');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.post('/chat', copilotController.generateCopilotResponse);

module.exports = router;
