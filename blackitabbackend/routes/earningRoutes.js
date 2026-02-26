const express = require('express');
const router = express.Router();
const earningController = require('../controllers/earningController');
const protect = require('../middleware/auth');

// All earnings routes require authentication
router.use(protect);

// GET /api/earnings — Summary + stats
router.get('/', earningController.getEarnings);

// GET /api/earnings/transactions — Paginated transaction history
router.get('/transactions', earningController.getTransactions);

// POST /api/earnings/withdraw — Request withdrawal
router.post('/withdraw', earningController.requestWithdrawal);

// GET /api/earnings/export — Export CSV
router.get('/export', earningController.exportCSV);

module.exports = router;
