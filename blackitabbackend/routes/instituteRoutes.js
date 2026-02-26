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

// GET /api/institute/members — list all members in user's institute
router.get('/members', requireRole('hod', 'institute_admin', 'teacher'), instituteController.getMembers);

// PUT /api/institute/members/:id/role — change a member's role within institute
router.put('/members/:id/role', requireRole('hod', 'institute_admin'), instituteController.changeMemberRole);

module.exports = router;
