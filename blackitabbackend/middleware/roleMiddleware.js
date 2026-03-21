const SystemAdmin = require('../models/SystemAdmin');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// ── Role Hierarchy ──────────────────────────────────────────────────────────
// Higher number = more privilege. Each role inherits all permissions below it.
const ROLE_HIERARCHY = {
    student: 0,
    teacher: 1,
    hod: 2,
    institute_admin: 3,
    institute: 3
};

/**
 * requireRole(...roles) — Checks if the authenticated user has one of the allowed roles.
 * Must be used AFTER authMiddleware so req.user is populated.
 * Usage: router.post('/create', protect, requireRole('teacher', 'hod'), controller.create)
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
            });
        }
        next();
    };
};

/**
 * requireMinRole(minRole) — Hierarchical check: allows the given role and ALL above it.
 * Example: requireMinRole('teacher') allows teacher, hod, institute_admin.
 * Must be used AFTER authMiddleware so req.user is populated.
 */
const requireMinRole = (minRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const userLevel = ROLE_HIERARCHY[req.user.role];
        const requiredLevel = ROLE_HIERARCHY[minRole];
        if (userLevel === undefined || requiredLevel === undefined) {
            return res.status(403).json({ success: false, message: 'Invalid role configuration' });
        }
        if (userLevel < requiredLevel) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Minimum role required: ${minRole}. Your role: ${req.user.role}`
            });
        }
        next();
    };
};

/**
 * requireSameInstitute — Ensures the user can only access resources within their own institute.
 * Checks req.params.instituteId or req.body.instituteId against req.user.instituteId.
 */
const requireSameInstitute = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const targetInstituteId = req.params.instituteId || req.body.instituteId;
    if (targetInstituteId && req.user.instituteId) {
        if (req.user.instituteId.toString() !== targetInstituteId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access resources within your own institute.'
            });
        }
    }
    next();
};

/**
 * requireAdmin — Authenticates SystemAdmin from a separate token.
 * SystemAdmin tokens have { adminId, isSystemAdmin: true } in their payload.
 */
const requireAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Admin token required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.isSystemAdmin) {
            return res.status(403).json({ success: false, message: 'System admin access required' });
        }

        const admin = await SystemAdmin.findById(decoded.adminId);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Admin not found' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
        }
        res.status(500).json({ success: false, message: 'Admin auth error' });
    }
};

module.exports = { requireRole, requireMinRole, requireSameInstitute, requireAdmin, ROLE_HIERARCHY };
