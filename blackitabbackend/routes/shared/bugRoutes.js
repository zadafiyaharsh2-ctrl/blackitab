const express = require('express');
const router = express.Router();
const BugReport = require('../../models/BugReport');
const protect = require('../../middleware/auth');

// POST: Create a new bug report (accessible by any logged-in user)
router.post('/', protect, async (req, res) => {
    try {
        const { description, pageContext } = req.body;
        
        if (!description) {
            return res.status(400).json({ success: false, message: 'Description is required' });
        }

        const bugReport = new BugReport({
            user: req.user._id,
            role: req.user.role,
            description,
            pageContext: pageContext || '/',
        });

        await bugReport.save();

        res.status(201).json({
            success: true,
            message: 'Bug report submitted successfully. Thank you for helping us improve!',
            data: bugReport
        });
    } catch (error) {
        console.error('Error submitting bug report:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting bug report' });
    }
});

// GET: Fetch the current user's submitted bug reports (useful for them to see admin replies)
router.get('/my-reports', protect, async (req, res) => {
    try {
        const reports = await BugReport.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching user bugs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
