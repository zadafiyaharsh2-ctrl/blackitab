const { getCache, setCache } = require('../utils/redisClient');

/**
 * Generic caching middleware for Express
 * @param {number} ttlSeconds - Time caching should live in seconds. Default 60 to save memory.
 */
const cacheMiddleware = (ttlSeconds = 60) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Cache key incorporates URL and query params
        // Prefix with 'cache:' to easily clear them all later if needed
        const key = `cache:${req.originalUrl}`;

        try {
            const cachedData = await getCache(key);

            if (cachedData) {
                // If data is in cache, intercept and return immediately
                return res.json(cachedData);
            }

            // If not in cache, we patch the res.json method to capture the payload
            const originalJson = res.json.bind(res);

            res.json = (body) => {
                // Only cache successful responses (to avoid caching 400s/500s)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    setCache(key, body, ttlSeconds);
                }
                
                // Continue with original response
                return originalJson(body);
            };

            next();
        } catch (error) {
            console.error('Cache Middleware Error:', error);
            // Fallback to normal execution if cache errors
            next();
        }
    };
};

module.exports = cacheMiddleware;
