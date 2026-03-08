const express = require('express');
const router = express.Router();
const instituteController = require('../controllers/instituteController');
const protect = require('../middleware/auth');
const { requireRole, requireSameInstitute } = require('../middleware/roleMiddleware');

// Public: Verify institute code for registration preview
router.get('/verify/:code', instituteController.verifyCode);

// Protected routes below
router.use(protect);

// GET /api/institute/my — get current user's institute details
router.get('/my', instituteController.getMyInstitute);

// ── Stats ──
router.get('/stats', requireRole('institute_admin', 'hod'), instituteController.getInstituteStats);

// ── Member Management ──
router.get('/members', requireRole('hod', 'institute_admin', 'teacher'), instituteController.getMembers);
router.post('/members', requireRole('institute_admin'), instituteController.addMember);
router.put('/members/:id/role', requireRole('hod', 'institute_admin'), instituteController.changeMemberRole);
router.put('/members/:id/ban', requireRole('institute_admin'), instituteController.toggleBanMember);
router.delete('/members/:id', requireRole('institute_admin'), instituteController.removeMember);

// ── Question Management (institute-scoped) ──
router.get('/questions', requireRole('institute_admin', 'hod', 'teacher'), instituteController.listInstituteQuestions);
router.delete('/questions/:id', requireRole('institute_admin'), instituteController.deleteInstituteQuestion);

// ── Post Moderation (institute-scoped) ──
router.get('/posts', requireRole('institute_admin', 'hod'), instituteController.listInstitutePosts);
router.delete('/posts/:id', requireRole('institute_admin'), instituteController.deleteInstitutePost);

// ── Analytics ──
router.get('/analytics', requireRole('institute_admin', 'hod', 'teacher'), instituteController.getInstituteAnalytics);

// ── Teacher Feedback & Monitoring ──
router.get('/teachers', requireRole('institute_admin', 'hod'), instituteController.listTeachersWithRatings);
router.get('/teachers/:id/feedback', requireRole('institute_admin', 'hod'), instituteController.getTeacherFeedback);
router.post('/feedback', requireRole('student'), instituteController.submitFeedback);

module.exports = router;
