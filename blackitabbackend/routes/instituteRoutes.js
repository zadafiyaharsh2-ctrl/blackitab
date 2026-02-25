const express = require('express');
const router = express.Router();
const instituteController = require('../controllers/instituteController');

// Verify institute code for registration preview
router.get('/verify/:code', instituteController.verifyCode);

module.exports = router;
