const express = require('express');
const router = express.Router();
const attemptController = require('../../controllers/student/attemptController');
const protect = require('../../middleware/auth');

router.post('/submit', protect, attemptController.submitAttempt);
router.get('/analytics', protect, attemptController.getDashboardAnalytics);
router.get('/advanced-insights', protect, attemptController.getAdvancedInsights);

module.exports = router;
