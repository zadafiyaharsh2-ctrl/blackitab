const redis = require('redis');

// Create Redis Client
const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

let isRedisConnected = false;

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
    isRedisConnected = false;
});

client.on('connect', () => {
    console.log('Redis connected successfully');
    isRedisConnected = true;
});

// Connect immediately (gracefully handles failure if not running)
client.connect().catch(console.error);

/**
 * Enhanced memory-conscious set function.
 * Clears old keys via standard TTL, utilizing Redis's built-in memory management.
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds - Time-To-Live in seconds (default 60 for low memory footprint)
 */
const setCache = async (key, value, ttlSeconds = 60) => {
    if (!isRedisConnected) return;
    try {
        await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
        console.error('Redis Set Error:', err);
    }
};

const getCache = async (key) => {
    if (!isRedisConnected) return null;
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Redis Get Error:', err);
        return null;
    }
};

const clearCachePrefix = async (prefix) => {
    if (!isRedisConnected) return;
    try {
        const keys = await client.keys(`${prefix}:*`);
        if (keys.length > 0) {
            await client.del(keys);
        }
    } catch (err) {
        console.error('Redis Clear Error:', err);
    }
};

module.exports = {
    client,
    isRedisConnected,
    setCache,
    getCache,
    clearCachePrefix
};
