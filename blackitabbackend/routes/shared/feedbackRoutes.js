const express = require('express');
const router = express.Router();
const feedbackController = require('../../controllers/shared/feedbackController');
const protect = require('../../middleware/auth');
const { requireRole, requireMinRole, requireAdmin } = require('../../middleware/roleMiddleware');

// Student submits feedback
router.post('/batch', protect, feedbackController.submitBatchFeedback);

// Teacher gets their own feedback
router.get('/teacher', protect, requireRole('teacher', 'hod', 'institute'), feedbackController.getTeacherFeedback);

// Institute gets a specific teacher's feedback (or HOD)
router.get('/institute/teacher/:teacherId', protect, requireMinRole('hod'), feedbackController.getInstituteTeacherFeedback);

// Admin gets all feedback for a teacher (unfiltered)
router.get('/admin/teacher/:teacherId', requireAdmin, feedbackController.getAdminTeacherFeedback);

module.exports = router;
