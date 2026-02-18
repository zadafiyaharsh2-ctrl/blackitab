/**
 * ============================================================================
 * AI QUESTION GENERATOR ROUTES
 * ============================================================================
 * 
 * API routes for AI-powered question generation.
 * All routes require authentication.
 * 
 * Routes:
 * - POST   /api/ai-questions/generate   - Generate questions on a topic
 * - GET    /api/ai-questions/history     - Get user's generated question sets
 * - GET    /api/ai-questions/:id         - Get a specific question set
 * - DELETE /api/ai-questions/:id         - Delete a question set
 */

const express = require('express');
const router = express.Router();
const aiQuestionController = require('../controllers/aiQuestionController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Generate new questions
router.post('/generate', aiQuestionController.generateQuestions);

// Get question history
router.get('/history', aiQuestionController.getQuestionHistory);

// Get specific question set
router.get('/:id', aiQuestionController.getQuestionSet);

// Delete a question set
router.delete('/:id', aiQuestionController.deleteQuestionSet);

module.exports = router;
