const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    requestId: { type: String, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userRole: { type: String },
    route: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: { type: Number, index: true },
    ip: { type: String },
    action: {
        type: String,
        index: true,
        enum: [
            'auth_failure',      // 401
            'access_denied',     // 403
            'rate_limited',      // 429
            'message_send',
            'post_create',
            'post_delete',
            'download_attempt',
            'admin_action',
            'member_change',
            'registration',
            'login',
            'feature_disabled',  // 503 from feature flags
            'batch_mutation',
            'exam_mutation',
            'unknown'
        ]
    },
    details: { type: String, maxlength: 500 }, // Brief context (NO PII)
    timestamp: { type: Date, default: Date.now, index: true }
});

// TTL: auto-delete after 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Compound index for common queries
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ statusCode: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
