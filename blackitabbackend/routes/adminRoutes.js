const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/roleMiddleware');

// POST /api/admin/login — SystemAdmin login (separate from user auth)
router.post('/login', adminController.login);

// All routes below require system admin authentication
router.use(requireAdmin);

// ── Platform Stats ──
router.get('/stats', adminController.getPlatformStats);

// ── User Management ──
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.editUser);
router.put('/users/:id/role', adminController.changeUserRole);
router.put('/users/:id/ban', adminController.toggleBanUser);
router.delete('/users/:id', adminController.deleteUser);

// ── Institute Management ──
router.get('/institutes', adminController.listInstitutes);
router.post('/institutes', adminController.createInstitute);
router.delete('/institutes/:id', adminController.deleteInstitute);

// ── Question Approval Management ──
router.get('/questions', adminController.listQuestions);
router.get('/questions/pending', adminController.listPendingQuestions);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id/approve', adminController.approveQuestion);
router.put('/questions/:id/reject', adminController.rejectQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// ── Post Moderation ──
router.get('/posts', adminController.listPosts);
router.delete('/posts/:id', adminController.deletePost);

// ── Contest Management ──
router.get('/contests', adminController.listContests);
router.post('/contests', adminController.createContest);
router.put('/contests/:id', adminController.editContest);
router.delete('/contests/:id', adminController.deleteContest);

// ── Institute Management ──
router.get('/institutes', adminController.getAllInstitutes);
router.put('/institutes/:id', adminController.editInstitute);

// ── Teacher Analytics ──
router.get('/teachers', adminController.getAllTeachersRatings);

// ── Global Analytics ──
router.get('/analytics', adminController.getGlobalAnalytics);

module.exports = router;
