const express = require('express');
const router = express.Router();
const aiQuestionController = require('../../controllers/shared/aiQuestionController');
const authMiddleware = require('../../middleware/auth');
const rateLimit = require('express-rate-limit');

// Limit question generation to prevent abuse and API cost overrun
const aiQuestionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 generation requests per hour
    message: { success: false, message: 'Too many questions generated. Please try again after an hour to prevent excessive API costs.' }
});

router.use(authMiddleware);

// Generate new questions and save to ExamQuestion collection
router.post('/generate', aiQuestionLimiter, aiQuestionController.generateQuestions);

module.exports = router;
