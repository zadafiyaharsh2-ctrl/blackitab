const crypto = require('crypto');

// ──────────────────────────────────────────────────────────────────────────────
// Security Headers Middleware
// Adds extra security headers beyond what Helmet provides.
// ──────────────────────────────────────────────────────────────────────────────

const securityHeaders = (req, res, next) => {
    // Unique request ID for tracing/debugging
    req.requestId = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.requestId);

    // Prevent browsers from MIME-sniffing (backup for Helmet)
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking (backup for Helmet)
    res.setHeader('X-Frame-Options', 'DENY');

    // Disable client-side caching for API responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Remove X-Powered-By (backup for Helmet)
    res.removeHeader('X-Powered-By');

    next();
};

// ──────────────────────────────────────────────────────────────────────────────
// Global Error Handler
// Catches all unhandled errors, logs them, and returns a safe response.
// In production, stack traces are NEVER leaked to the client.
// ──────────────────────────────────────────────────────────────────────────────

const globalErrorHandler = (err, req, res, _next) => {
    // Log full error internally
    console.error(`[ERROR] ${req.requestId || 'no-id'} ${req.method} ${req.originalUrl}:`, err);

    // Determine appropriate status code
    const statusCode = err.statusCode || err.status || 500;

    // Determine environment
    const isProduction = process.env.NODE_ENV === 'production';

    // Build safe response
    const response = {
        success: false,
        message: isProduction ? 'Internal server error' : (err.message || 'Something went wrong'),
        ...(isProduction ? {} : { stack: err.stack }),
        requestId: req.requestId
    };

    // Handle specific error types
    if (err.name === 'ValidationError') {
        response.message = 'Validation error';
        response.errors = Object.values(err.errors || {}).map(e => e.message);
        return res.status(400).json(response);
    }

    if (err.name === 'CastError') {
        response.message = 'Invalid resource ID format';
        return res.status(400).json(response);
    }

    if (err.code === 11000) {
        response.message = 'Duplicate field value entered';
        return res.status(409).json(response);
    }

    if (err.name === 'JsonWebTokenError') {
        response.message = 'Invalid token';
        return res.status(401).json(response);
    }

    if (err.name === 'TokenExpiredError') {
        response.message = 'Token expired';
        return res.status(401).json(response);
    }

    res.status(statusCode).json(response);
};

// ──────────────────────────────────────────────────────────────────────────────
// 404 Handler
// Must be registered AFTER all routes.
// ──────────────────────────────────────────────────────────────────────────────

const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

module.exports = { securityHeaders, globalErrorHandler, notFoundHandler };
