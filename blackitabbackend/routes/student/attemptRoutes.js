const express = require('express');
const router = express.Router();
const attemptController = require('../../controllers/student/attemptController');
const protect = require('../../middleware/auth');

router.post('/submit', protect, attemptController.submitAttempt);
router.get('/analytics', protect, attemptController.getDashboardAnalytics);

module.exports = router;
