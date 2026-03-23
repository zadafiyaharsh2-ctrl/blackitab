// ──────────────────────────────────────────────────────────────────────────────
// Per-User Rate Limiter with Auto-Cooldown
//
// Uses Redis if REDIS_URL is set, falls back to in-memory Map.
// After 3 consecutive limit violations → 30-minute cooldown on User.restrictedUntil.
//
// Usage:
//   const { perUserLimit } = require('../../middleware/userRateLimit');
//   router.post('/send', protect, perUserLimit({ max: 30, windowMs: 60000, feature: 'messages' }), controller.send);
// ──────────────────────────────────────────────────────────────────────────────

const User = require('../models/User');

// In-memory store (fallback when Redis is unavailable)
const memoryStore = new Map();

// Auto-cleanup every 5 minutes to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of memoryStore) {
        if (now - data.windowStart > data.windowMs * 2) {
            memoryStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Redis client (lazy init)
let redisClient = null;
const getRedisClient = async () => {
    if (redisClient) return redisClient;
    if (!process.env.REDIS_URL) return null;

    try {
        const { createClient } = require('redis');
        redisClient = createClient({ url: process.env.REDIS_URL });
        redisClient.on('error', () => { redisClient = null; });
        await redisClient.connect();
        return redisClient;
    } catch {
        redisClient = null;
        return null;
    }
};

/**
 * Get current count from store (Redis or memory)
 */
const getCount = async (key, windowMs) => {
    const redis = await getRedisClient();
    if (redis) {
        try {
            const count = await redis.get(key);
            return count ? parseInt(count) : 0;
        } catch { /* fall through to memory */ }
    }

    const data = memoryStore.get(key);
    if (!data) return 0;
    if (Date.now() - data.windowStart > windowMs) {
        memoryStore.delete(key);
        return 0;
    }
    return data.count;
};

/**
 * Increment count in store
 */
const incrementCount = async (key, windowMs) => {
    const redis = await getRedisClient();
    if (redis) {
        try {
            const count = await redis.incr(key);
            if (count === 1) {
                await redis.pExpire(key, windowMs);
            }
            return count;
        } catch { /* fall through to memory */ }
    }

    const data = memoryStore.get(key);
    const now = Date.now();
    if (!data || now - data.windowStart > windowMs) {
        memoryStore.set(key, { count: 1, windowStart: now, windowMs });
        return 1;
    }
    data.count++;
    return data.count;
};

// Track consecutive violations per user (in memory — small data)
const violationTracker = new Map();

/**
 * perUserLimit({ max, windowMs, feature }) — per-user rate limiting middleware.
 * 
 * @param {number} max - Maximum requests per window
 * @param {number} windowMs - Window duration in milliseconds (default 60000 = 1 min)
 * @param {string} feature - Feature name for the rate limit key (e.g., 'messages', 'comments')
 */
const perUserLimit = ({ max = 30, windowMs = 60000, feature = 'default' } = {}) => {
    return async (req, res, next) => {
        if (!req.user) return next(); // Skip if no auth

        const userId = req.user._id.toString();

        // Check if user is in cooldown
        if (req.user.restrictedUntil && new Date(req.user.restrictedUntil) > new Date()) {
            const remaining = Math.ceil((new Date(req.user.restrictedUntil) - new Date()) / 60000);
            return res.status(429).json({
                success: false,
                message: `You are temporarily restricted due to excessive activity. Please wait ${remaining} more minute(s).`,
                restrictedUntil: req.user.restrictedUntil
            });
        }

        const key = `rl:${feature}:${userId}`;

        try {
            const currentCount = await incrementCount(key, windowMs);

            // Set rate limit headers
            res.set('X-RateLimit-Limit', max);
            res.set('X-RateLimit-Remaining', Math.max(0, max - currentCount));

            if (currentCount > max) {
                // Track consecutive violations
                const violationKey = `${feature}:${userId}`;
                const violations = (violationTracker.get(violationKey) || 0) + 1;
                violationTracker.set(violationKey, violations);

                // After 3 consecutive violations → 30 min cooldown
                if (violations >= 3) {
                    const cooldownUntil = new Date(Date.now() + 30 * 60 * 1000);
                    try {
                        await User.findByIdAndUpdate(userId, { restrictedUntil: cooldownUntil });
                    } catch (e) {
                        console.error('Failed to set user cooldown:', e.message);
                    }
                    violationTracker.delete(violationKey);

                    return res.status(429).json({
                        success: false,
                        message: 'You have been temporarily restricted for 30 minutes due to repeated excessive activity.',
                        restrictedUntil: cooldownUntil
                    });
                }

                return res.status(429).json({
                    success: false,
                    message: `Rate limit exceeded for ${feature}. Maximum ${max} requests per ${windowMs / 1000}s. Please slow down.`,
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Reset violation count on successful request
            violationTracker.delete(`${feature}:${userId}`);
            next();
        } catch (error) {
            // Best-effort: if rate limiting fails, allow the request through
            console.error('Rate limit check error:', error.message);
            next();
        }
    };
};

module.exports = { perUserLimit };
