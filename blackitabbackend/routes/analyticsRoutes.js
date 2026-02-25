const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const protect = require('../middleware/auth');

router.get('/overview', protect, analyticsController.getUserAnalytics);
router.get('/school', protect, analyticsController.getSchoolAnalytics);

module.exports = router;
