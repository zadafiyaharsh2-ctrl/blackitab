const mongoose = require('mongoose');

// ──────────────────────────────────────────────────────────────────────────────
// validateObjectId(...paramNames)
// Validates that the specified route params are valid MongoDB ObjectIds.
// Returns 400 if any are invalid. Prevents CastError crashes.
//
// Usage:
//   router.get('/batch/:id', validateObjectId('id'), controller.getBatch)
//   router.delete('/batch/:batchId/students/:studentId', validateObjectId('batchId', 'studentId'), ...)
// ──────────────────────────────────────────────────────────────────────────────

const validateObjectId = (...paramNames) => {
    return (req, res, next) => {
        for (const param of paramNames) {
            const value = req.params[param];
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid ID format for parameter: ${param}`
                });
            }
        }
        next();
    };
};

// ──────────────────────────────────────────────────────────────────────────────
// requireBatchOwner
// Verifies that the authenticated user is the teacher who created the batch.
// Expects batch ID in req.params.id or req.params.batchId.
// Must be used AFTER authMiddleware.
//
// Usage:
//   router.put('/batch/:id', protect, requireBatchOwner, controller.updateBatch)
// ──────────────────────────────────────────────────────────────────────────────

const requireBatchOwner = async (req, res, next) => {
    try {
        const Batch = require('../models/Batch');
        const batchId = req.params.id || req.params.batchId;

        if (!batchId) {
            return res.status(400).json({ success: false, message: 'Batch ID is required' });
        }

        const batch = await Batch.findById(batchId).select('teacher');
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        // Allow the batch owner OR institute/hod roles (they manage across teachers)
        const isOwner = batch.teacher.toString() === req.user._id.toString();
        const isPrivileged = ['institute', 'hod'].includes(req.user.role);

        if (!isOwner && !isPrivileged) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not own this batch.'
            });
        }

        req.batch = batch; // Attach for downstream use
        next();
    } catch (error) {
        console.error('requireBatchOwner error:', error.message);
        return res.status(500).json({ success: false, message: 'Authorization check failed' });
    }
};

// ──────────────────────────────────────────────────────────────────────────────
// escapeRegex(str)
// Escapes special regex characters to prevent ReDoS / regex injection.
// Also truncates to maxLength to prevent abuse.
//
// Usage (in controllers):
//   const { escapeRegex } = require('../../middleware/accessControl');
//   const safe = escapeRegex(req.query.search);
//   Model.find({ name: { $regex: safe, $options: 'i' } });
// ──────────────────────────────────────────────────────────────────────────────

const escapeRegex = (str, maxLength = 100) => {
    if (typeof str !== 'string') return '';
    return str
        .slice(0, maxLength)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = { validateObjectId, requireBatchOwner, escapeRegex };
