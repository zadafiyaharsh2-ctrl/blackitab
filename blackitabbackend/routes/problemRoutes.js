const express = require('express');
const router = express.Router();
const {
    getProblemSubjects,
    createProblemSubject,
    getChaptersBySubject,
    getProblemsByChapter,
    getProblemById,
    updateProblemStatus
} = require('../controllers/problemController');

// We need auth middleware to get user ID for progress
const protect = require('../middleware/auth');

router.route('/subjects')
    .get(getProblemSubjects)
    .post(createProblemSubject);

router.route('/subjects/:subjectId/chapters')
    .get(getChaptersBySubject);

// Use protect middleware optionally? Or we can make a separate route for authenticated users
// For simplicity, let's make the problems route use 'protect' but we need to handle if we want public access too.
// Actually, the user wants to see THEIR progress, so they should be logged in.
// But if we want it public, we'd need a custom middleware "optionalProtect".
// Let's assume for now the frontend sends the token if available.
// We'll use a custom middleware inline here or just use 'protect' if we decide problems are private.
// Let's try to make it work with the existing 'protect' middleware but only if the header is present?
// No, standard 'protect' throws 401 if no token.
// Let's create a simple "optionalProtect" here or just import it if it existed.
// Since I can't easily see middleware/auth.js right now, I'll just use `protect` for the status update
// and for fetching problems, I'll rely on the controller checking `req.user`.
// BUT `req.user` won't be set without middleware.
// I'll add a simple middleware here to decode token if present, without enforcing it.
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalProtect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
        } catch (error) {
            console.error('Optional auth error:', error);
        }
    }
    next();
};

router.route('/chapters/:chapterId/problems')
    .get(optionalProtect, getProblemsByChapter);

router.route('/:id')
    .get(getProblemById);

router.route('/:id/status')
    .post(protect, updateProblemStatus);

module.exports = router;
