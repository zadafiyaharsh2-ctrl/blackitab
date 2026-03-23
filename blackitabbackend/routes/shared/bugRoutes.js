const express = require('express');
const router = express.Router();
const BugReport = require('../../models/BugReport');
const Report = require('../../models/Report');
const protect = require('../../middleware/auth');
const { validateObjectId } = require('../../middleware/accessControl');
const { requireAdmin } = require('../../middleware/roleMiddleware');

// ──────────────────────────────────────────────────────────────────────────────
// Bug Reports
// ──────────────────────────────────────────────────────────────────────────────

// POST /api/bugs — submit a bug/security/abuse report
router.post('/', protect, async (req, res) => {
    try {
        const { description, pageContext, category, severity, stepsToReproduce, expectedBehavior, actualBehavior, endpoint } = req.body;
        
        if (!description || description.trim().length < 10) {
            return res.status(400).json({ success: false, message: 'Description is required (minimum 10 characters)' });
        }

        const bugReport = new BugReport({
            user: req.user._id,
            role: req.user.role,
            description,
            pageContext: pageContext || '/',
            category: category || 'bug',
            severity: severity || 'medium',
            stepsToReproduce: stepsToReproduce || '',
            expectedBehavior: expectedBehavior || '',
            actualBehavior: actualBehavior || '',
            endpoint: endpoint || ''
        });

        await bugReport.save();

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. Thank you for helping us improve!',
            data: bugReport
        });
    } catch (error) {
        console.error('Error submitting bug report:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting report' });
    }
});

// GET /api/bugs/my-reports — current user's submitted reports
router.get('/my-reports', protect, async (req, res) => {
    try {
        const reports = await BugReport.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching user bugs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// Content / User Reports (moderation queue)
// ──────────────────────────────────────────────────────────────────────────────

// POST /api/bugs/report — report a user, post, message, or comment
router.post('/report', protect, async (req, res) => {
    try {
        const { targetType, targetId, reason, details } = req.body;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json({ success: false, message: 'targetType, targetId, and reason are required' });
        }

        if (!['user', 'post', 'message', 'comment'].includes(targetType)) {
            return res.status(400).json({ success: false, message: 'Invalid targetType' });
        }

        // Prevent self-reporting
        if (targetType === 'user' && targetId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot report yourself' });
        }

        const report = await Report.create({
            reporter: req.user._id,
            targetType,
            targetId,
            reason,
            details: details || ''
        });

        res.status(201).json({
            success: true,
            message: 'Report submitted. Our team will review it.',
            data: report
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'You have already reported this item' });
        }
        console.error('Error submitting report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ──────────────────────────────────────────────────────────────────────────────
// Admin Moderation Endpoints
// ──────────────────────────────────────────────────────────────────────────────

// GET /api/bugs/admin/reports — moderation queue
router.get('/admin/reports', requireAdmin, async (req, res) => {
    try {
        const { status = 'pending', targetType, page = 1, limit = 30 } = req.query;

        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (targetType) filter.targetType = targetType;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [reports, total] = await Promise.all([
            Report.find(filter)
                .populate('reporter', 'name email role')
                .populate('reviewedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Report.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: reports,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/bugs/admin/reports/:id — review a report
router.put('/admin/reports/:id', requireAdmin, validateObjectId('id'), async (req, res) => {
    try {
        const { status, reviewNote, actionTaken } = req.body;

        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        if (status) report.status = status;
        if (reviewNote) report.reviewNote = reviewNote;
        if (actionTaken) report.actionTaken = actionTaken;
        report.reviewedBy = req.admin._id;

        await report.save();

        res.json({ success: true, message: 'Report updated', data: report });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
