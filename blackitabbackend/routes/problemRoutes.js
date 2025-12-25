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
    updateProblemStatus
} = require('../controllers/problemController');

// Import Auth Middleware
// 'protect' ensures the user is logged in (throws 401 if not)
const protect = require('../middleware/auth');

// Import JWT for optional auth logic
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
            console.error('Optional auth error:', error);
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

// Single Problem: Get by ID
router.route('/:id')
    .get(getProblemById);

// Update Status: Mark as done/attempted
// Requires strict authentication (protect)
router.route('/:id/status')
    .post(protect, updateProblemStatus);

module.exports = router;
