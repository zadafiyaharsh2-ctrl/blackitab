/**
 * ============================================================================
 * AI ROUTES
 * ============================================================================
 * 
 * API routes for AI functionality.
 * All routes require authentication.
 * 
 * Routes:
 * - POST /api/ai/ask - Ask a question to the AI
 * - GET /api/ai/history - Get user's question history
 * - DELETE /api/ai/:id - Delete a specific question
 * - DELETE /api/ai/history/clear - Clear all history
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

// All AI routes require authentication
router.use(authMiddleware);

// Ask a question
// Ask a question
router.post('/ask', aiController.askQuestion);

// Get question history
router.get('/history', aiController.getHistory);

// Clear all history
router.delete('/history/clear', aiController.clearHistory);

// Delete a specific question
router.delete('/:id', aiController.deleteQuestion);

module.exports = router;
