const express = require('express');
const router = express.Router();
const aiQuestionController = require('../../controllers/shared/aiQuestionController');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

// Generate new questions and save to ExamQuestion collection
router.post('/generate', aiQuestionController.generateQuestions);

module.exports = router;
