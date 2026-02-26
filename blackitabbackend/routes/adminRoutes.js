const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/roleMiddleware');

// POST /api/admin/login — SystemAdmin login (separate from user auth)
router.post('/login', adminController.login);

// All routes below require system admin authentication
router.use(requireAdmin);

// GET /api/admin/stats — platform-wide statistics
router.get('/stats', adminController.getPlatformStats);

// GET /api/admin/users — list all users (paginated, filterable)
router.get('/users', adminController.listUsers);

// GET /api/admin/users/:id — get single user details
router.get('/users/:id', adminController.getUserById);

// PUT /api/admin/users/:id/role — change a user's role
router.put('/users/:id/role', adminController.changeUserRole);

// PUT /api/admin/users/:id/ban — ban/unban a user
router.put('/users/:id/ban', adminController.toggleBanUser);

// GET /api/admin/institutes — list all institutes
router.get('/institutes', adminController.listInstitutes);

// POST /api/admin/institutes — create a new institute
router.post('/institutes', adminController.createInstitute);

// DELETE /api/admin/institutes/:id — delete institute
router.delete('/institutes/:id', adminController.deleteInstitute);

module.exports = router;
