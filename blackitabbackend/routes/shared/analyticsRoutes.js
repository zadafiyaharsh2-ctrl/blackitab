const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/shared/analyticsController');
const protect = require('../../middleware/auth');
const { requireRole } = require('../../middleware/roleMiddleware');

// Student's own analytics
router.get('/overview', protect, analyticsController.getUserAnalytics);

// Institute-level analytics (teacher, hod, institute only)
router.get('/school', protect, requireRole('teacher', 'hod', 'institute'), analyticsController.getSchoolAnalytics);
router.get('/school/trends', protect, requireRole('teacher', 'hod', 'institute'), analyticsController.getInstituteTrends);
router.get('/school/student/:studentId', protect, requireRole('teacher', 'hod', 'institute'), analyticsController.getStudentDetail);

module.exports = router;
