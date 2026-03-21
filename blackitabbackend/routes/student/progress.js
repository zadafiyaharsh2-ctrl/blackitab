/**
 * ============================================================================
 * PROGRESS ROUTES
 * ============================================================================
 * 
 * API routes for tracking user progress through topics
 */

const express = require('express');
const router = express.Router();
const progressController = require('../../controllers/student/progressController');
const authMiddleware = require('../../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/progress/mark-complete
 * @desc    Mark a topic as completed
 * @body    { subjectId, topicId }
 * @access  Private
 */
router.post('/mark-complete', progressController.markTopicComplete);

/**
 * @route   GET /api/progress
 * @desc    Get all completed topics for logged-in user
 * @access  Private
 */
router.get('/', progressController.getUserProgress);

/**
 * @route   GET /api/progress/stats
 * @desc    Get progress statistics for logged-in user
 * @access  Private
 */
router.get('/stats', progressController.getProgressStats);

/**
 * @route   GET /api/progress/heatmap
 * @desc    Get activity heatmap data
 * @access  Private
 */
router.get('/heatmap', progressController.getActivityHeatmap);

/**
 * @route   GET /api/progress/:subjectId
 * @desc    Get completed topics for a specific subject
 * @access  Private
 */
router.get('/:subjectId', progressController.getSubjectProgress);

module.exports = router;
