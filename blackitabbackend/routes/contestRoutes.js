const express = require('express');
const router = express.Router();
const contestController = require('../controllers/contestController');
const protect = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');

// Public: get active/upcoming contests
router.get('/', contestController.listContests);
router.get('/upcoming', contestController.getUpcomingContests);
router.get('/:id', contestController.getContestById);

// Protected routes
router.use(protect);

// GET /api/contests/:id/leaderboard
router.get('/:id/leaderboard', contestController.getLeaderboard);

// Teacher/HOD/Admin: create/manage contests
router.post('/', requireRole('teacher', 'hod', 'institute'), contestController.createContest);
router.put('/:id', requireRole('teacher', 'hod', 'institute'), contestController.updateContest);
router.delete('/:id', requireRole('teacher', 'hod', 'institute'), contestController.deleteContest);

module.exports = router;
