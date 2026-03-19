const express = require('express');
const router = express.Router();
const instituteController = require('../../controllers/institute/instituteController');
const protect = require('../../middleware/auth');
const { requireRole, requireSameInstitute } = require('../../middleware/roleMiddleware');

// Public: Verify institute code for registration preview
router.get('/verify/:code', instituteController.verifyCode);

// Protected routes below
router.use(protect);

// GET /api/institute/my — get current user's institute details
router.get('/my', instituteController.getMyInstitute);

// ── Stats ──
router.get('/stats', requireRole('institute', 'hod'), instituteController.getInstituteStats);
router.get('/departments/stats', requireRole('institute', 'hod', 'teacher'), instituteController.getDepartmentStats);
router.get('/departments/:deptName/details', requireRole('institute', 'hod'), instituteController.getDepartmentDetails);

// ── Profile ──
const { handleBannerUpload } = require('../../middleware/upload');
router.put('/profile', requireRole('institute'), handleBannerUpload, instituteController.updateInstituteProfile);

// ── Member Management ──
router.get('/members', requireRole('hod', 'institute', 'teacher'), instituteController.getMembers);
router.post('/members', requireRole('institute'), instituteController.addMember);
router.put('/members/:id/role', requireRole('hod', 'institute'), instituteController.changeMemberRole);
router.put('/members/:id/ban', requireRole('institute'), instituteController.toggleBanMember);
router.delete('/members/:id', requireRole('institute'), instituteController.removeMember);

// ── Theory Management ──
router.get('/theory', requireRole('institute', 'hod', 'teacher', 'student'), instituteController.listInstituteTheory);
router.post('/theory', requireRole('institute', 'hod', 'teacher'), instituteController.addTheory);
router.put('/theory/:id', requireRole('institute', 'hod', 'teacher'), instituteController.updateTheory);
router.delete('/theory/:id', requireRole('institute', 'hod', 'teacher'), instituteController.deleteTheory);

// ── Question Management (institute-scoped) ──
router.get('/questions', requireRole('institute', 'hod', 'teacher'), instituteController.listInstituteQuestions);
router.put('/questions/:id', requireRole('institute', 'hod'), instituteController.updateInstituteQuestion);
router.delete('/questions/:id', requireRole('institute', 'hod'), instituteController.deleteInstituteQuestion);

// ── Post Moderation (institute-scoped) ──
router.get('/posts', requireRole('institute', 'hod'), instituteController.listInstitutePosts);
router.delete('/posts/:id', requireRole('institute'), instituteController.deleteInstitutePost);

// ── Analytics ──
router.get('/analytics', requireRole('institute', 'hod', 'teacher'), instituteController.getInstituteAnalytics);

// ── Teacher Feedback & Monitoring ──
router.get('/teachers', requireRole('institute', 'hod'), instituteController.listTeachersWithRatings);
router.get('/teachers/:id/feedback', requireRole('institute', 'hod'), instituteController.getTeacherFeedback);
router.get('/teacher/:id/details', requireRole('institute', 'hod'), instituteController.getTeacherFullDetails);
router.post('/feedback', requireRole('student'), instituteController.submitFeedback);

// ── Join Institute (any authenticated user without an institute) ──
router.post('/join', instituteController.joinInstitute);

// ── Join Requests (Institute Admin / HOD) ──
router.get('/join-requests', requireRole('institute', 'hod'), instituteController.getJoinRequests);
router.post('/join-requests/:id/approve', requireRole('institute', 'hod'), instituteController.approveJoinRequest);
router.post('/join-requests/:id/reject', requireRole('institute', 'hod'), instituteController.rejectJoinRequest);

// ── Class Materials (Institute-level) ──
router.get('/materials', requireRole('institute', 'hod'), instituteController.getInstituteMaterials);
router.post('/batch/:batchId/materials', requireRole('institute', 'hod'), instituteController.createInstituteMaterial);
router.put('/material/:id', requireRole('institute', 'hod'), instituteController.updateInstituteMaterial);
router.delete('/material/:id', requireRole('institute', 'hod'), instituteController.deleteInstituteMaterial);

// ── Student Detail View ──
router.get('/student/:id/detail', requireRole('institute', 'hod'), instituteController.getStudentDetail);

module.exports = router;
