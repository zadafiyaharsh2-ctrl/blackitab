const express = require('express');
const router = express.Router();
const AuditLog = require('../../models/AuditLog');
const { requireAdmin } = require('../../middleware/roleMiddleware');

// GET /api/admin/audit — paginated, filterable audit log query
// Query params: type (action), status (statusCode), userId, from, to, page, limit
router.get('/audit', requireAdmin, async (req, res) => {
    try {
        const { type, status, userId, from, to, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (type) filter.action = type;
        if (status) filter.statusCode = parseInt(status);
        if (userId) filter.userId = userId;
        if (from || to) {
            filter.timestamp = {};
            if (from) filter.timestamp.$gte = new Date(from);
            if (to) filter.timestamp.$lte = new Date(to);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [logs, total] = await Promise.all([
            AuditLog.find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            AuditLog.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Audit log query error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/security-summary — counts of security events in last 24h
router.get('/security-summary', requireAdmin, async (req, res) => {
    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [summary, topIPs, topUsers, recentCritical] = await Promise.all([
            // Count by action type
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: since } } },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // Top IPs with failures
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: since }, statusCode: { $in: [401, 403, 429] } } },
                { $group: { _id: '$ip', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            // Top users with failures
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: since }, statusCode: { $in: [401, 403, 429] }, userId: { $ne: null } } },
                { $group: { _id: '$userId', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            // Recent critical events (last 20)
            AuditLog.find({
                timestamp: { $gte: since },
                action: { $in: ['auth_failure', 'access_denied', 'rate_limited'] }
            })
                .sort({ timestamp: -1 })
                .limit(20)
                .lean()
        ]);

        const summaryMap = {};
        summary.forEach(s => { summaryMap[s._id] = s.count; });

        res.json({
            success: true,
            data: {
                period: '24h',
                since,
                counts: summaryMap,
                totalEvents: Object.values(summaryMap).reduce((a, b) => a + b, 0),
                topSuspiciousIPs: topIPs,
                topFlaggedUsers: topUsers,
                recentCriticalEvents: recentCritical
            }
        });
    } catch (error) {
        console.error('Security summary error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
