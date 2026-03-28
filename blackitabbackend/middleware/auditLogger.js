// ──────────────────────────────────────────────────────────────────────────────
// Audit Logger Middleware
//
// Best-effort, async logging — NEVER blocks the request.
// Logs only critical actions and error status codes.
// Does NOT log request bodies (PII risk) — only action + IDs.
//
// Usage: app.use(auditLogger); // Apply globally in index.js
// ──────────────────────────────────────────────────────────────────────────────

const AuditLog = require('../models/AuditLog');

// Routes that should be explicitly logged (even on success)
const AUDITED_ROUTES = [
    { method: 'POST', pattern: /\/api\/messages\/send/, action: 'message_send' },
    { method: 'POST', pattern: /\/api\/posts\/create/, action: 'post_create' },
    { method: 'DELETE', pattern: /\/api\/posts\//, action: 'post_delete' },
    { method: 'GET', pattern: /\/api\/messages\/download\//, action: 'download_attempt' },
    { method: 'POST', pattern: /\/api\/register/, action: 'registration' },
    { method: 'POST', pattern: /\/api\/login/, action: 'login' },
    { method: 'POST', pattern: /\/api\/auth\/google/, action: 'login' },
    { method: 'PUT', pattern: /\/api\/institute\/members\//, action: 'member_change' },
    { method: 'DELETE', pattern: /\/api\/institute\/members\//, action: 'member_change' },
    { method: 'POST', pattern: /\/api\/teacher\/batch/, action: 'batch_mutation' },
    { method: 'PUT', pattern: /\/api\/teacher\/batch\//, action: 'batch_mutation' },
    { method: 'DELETE', pattern: /\/api\/teacher\/batch\//, action: 'batch_mutation' },
    { method: 'POST', pattern: /\/api\/teacher\/exam/, action: 'exam_mutation' },
    { method: 'PUT', pattern: /\/api\/teacher\/exam\//, action: 'exam_mutation' },
    { method: 'DELETE', pattern: /\/api\/teacher\/exam\//, action: 'exam_mutation' },
    { method: '*', pattern: /\/api\/admin\//, action: 'admin_action' },
];

/**
 * Determine action type for a request
 */
const getAction = (method, path, statusCode) => {
    // Always log error statuses
    if (statusCode === 401) return 'auth_failure';
    if (statusCode === 403) return 'access_denied';
    if (statusCode === 429) return 'rate_limited';
    if (statusCode === 503) return 'feature_disabled';

    // Check explicit route matches
    for (const route of AUDITED_ROUTES) {
        if ((route.method === '*' || route.method === method) && route.pattern.test(path)) {
            return route.action;
        }
    }

    return null; // Not audited
};

/**
 * auditLogger — Express middleware that logs critical actions.
 * Attaches to res.on('finish') to capture the status code.
 */
const auditLogger = (req, res, next) => {
    // Capture when response finishes
    res.on('finish', () => {
        // Async, best-effort — never blocks
        setImmediate(async () => {
            try {
                const action = getAction(req.method, req.originalUrl, res.statusCode);
                if (!action) return; // Not an audited route/status

                await AuditLog.create({
                    requestId: req.requestId || 'unknown',
                    userId: req.user?._id || null,
                    userRole: req.user?.role || null,
                    route: req.originalUrl.split('?')[0], // Strip query params
                    method: req.method,
                    statusCode: res.statusCode,
                    ip: req.ip || req.connection?.remoteAddress || 'unknown',
                    action,
                    details: buildDetails(req, action)
                });
            } catch (err) {
                // Best-effort: log error but NEVER throw
                console.error('[AuditLogger] Failed to log:', err.message);
            }
        });
    });

    next();
};

/**
 * Build safe details string (NO PII, NO request bodies)
 */
const buildDetails = (req, action) => {
    const parts = [];

    // Include relevant param IDs only
    if (req.params?.id) parts.push(`targetId:${req.params.id}`);
    if (req.params?.messageId) parts.push(`messageId:${req.params.messageId}`);
    if (req.params?.batchId) parts.push(`batchId:${req.params.batchId}`);
    if (req.params?.userId) parts.push(`userId:${req.params.userId}`);

    return parts.join(', ') || null;
};

module.exports = auditLogger;
