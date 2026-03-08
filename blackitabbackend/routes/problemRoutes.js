/**
 * ============================================================================
 * PROBLEM ROUTES (problemRoutes.js)
 * ============================================================================
 * 
 * Defines API endpoints for the Problem Set feature.
 * Connects URL paths to specific controller functions.
 */

const express = require('express');
const router = express.Router();

// Import Controller Functions
const {
    getProblemSubjects,
    createProblemSubject,
    getChaptersBySubject,
    getProblemsByChapter,
    getProblemById,
    updateProblemStatus,
    getExamQuestions,
    checkExamAnswer,
    generateExamQuestions,
    startAiTutor,
    generateTheory,
    generateAdaptiveQuestion
} = require('../controllers/problemController');

// Import Auth Middleware
// 'protect' ensures the user is logged in (throws 401 if not)
const protect = require('../middleware/auth');

// Import JWT for optional auth logic
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ExamQuestion = require('../models/ExamQuestion');

/**
 * MIDDLEWARE: Optional Protection
 * Checks for a token, decodes it, and attaches the user to `req.user`.
 * Unlike 'protect', this does NOT throw an error if the token is missing.
 * Used for routes that can be viewed publicly but show extra data (like progress) if logged in.
 */
const optionalProtect = async (req, res, next) => {
    let token;
    // Check if Authorization header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token string
            token = req.headers.authorization.split(' ')[1];
            // Verify token signature
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Find user and attach to request object
            req.user = await User.findById(decoded.userId).select('-password');
        } catch (error) {

            // We ignore errors here because authentication is optional
        }
    }
    // Proceed to next middleware/controller
    next();
};

/**
 * ROUTES
 */

// Subjects: Get All (Public) / Create New (Admin/Private)
router.route('/subjects')
    .get(getProblemSubjects)
    .post(createProblemSubject); // Note: Should probably be admin protected in future

// Chapters: Get by Subject ID
router.route('/subjects/:subjectId/chapters')
    .get(getChaptersBySubject);

// Problems: Get by Chapter ID
// Uses optionalProtect to show user progress if they are logged in
router.route('/chapters/:chapterId/problems')
    .get(optionalProtect, getProblemsByChapter);

// Daily Problem: deterministic "problem of the day" — MUST come before /:id
router.get('/daily', async (req, res) => {
  try {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const totalQuestions = await ExamQuestion.countDocuments();
    if (totalQuestions === 0) {
      return res.json({ success: true, data: null, message: 'No questions available' });
    }
    const skipIndex = dayOfYear % totalQuestions;
    const question = await ExamQuestion.findOne().skip(skipIndex).select('question subject difficulty exam options');
    res.json({ success: true, data: question });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Single Problem: Get by ID
router.route('/:id')
    .get(getProblemById);

// Update Status: Mark as done/attempted
// Requires strict authentication (protect)
router.route('/:id/status')
    .post(protect, updateProblemStatus);



router.get('/exam/:examId/questions', getExamQuestions);
router.post('/exam/:examId/check-answer', protect, checkExamAnswer);
// router.post('/exam/:examId/generate', protect, generateExamQuestions);


router.post('/exam/:examId/ai-tutor', protect, startAiTutor);
router.post('/exam/:examId/theory', protect, generateTheory);
router.post('/exam/:examId/adaptive-question', protect, generateAdaptiveQuestion);

module.exports = router;
