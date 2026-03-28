# Redis Cost & Stability Guide

In BlackiTab, Redis is aggressively utilized by `cacheMiddleware.js` to cache expensive database lookups across heavily hit endpoints (leaderboards, public analytics).

## The Risk
Without a bound on memory, Redis will consume all available instance RAM until the host server crashes (OOM Killed). If your hosting provider auto-scales RAM based on usage, a malicious user could flood uniquely parameterized GET requests to infinitely expand Redis storage, resulting in astronomical hosting bills ("bankruptcy by cache").

## The Solution

1. **Application-Level TTLs**
Currently natively implemented in `redisClient.js`. We use `client.setEx(key, ttlSeconds, value)`, meaning by default everything naturally expires and is flushed after 60 seconds.

2. **Server-Level Maxmemory Policy (CRITICAL)**
When deploying Redis (whether via Docker, Render, AWS ElastiCache, or generic VPS), you *must* configure an LRU (Least Recently Used) eviction policy.

**Configure your `redis.conf` like this:**
```conf
# 1. Hard cap memory (e.g., to 200MB to fit within a $5/mo basic caching tier)
maxmemory 200mb

# 2. Instruct Redis to evict the oldest cache items when it hits 200mb
maxmemory-policy allkeys-lru
```

If you are using Docker, start your container with:
```bash
docker run -d --name cache -p 6379:6379 redis:alpine redis-server --maxmemory 200mb --maxmemory-policy allkeys-lru
```

With `allkeys-lru` and a strict `maxmemory` cap, your Redis pod will NEVER consume unlimited resources. It will gracefully delete old cache keys to make room for new ones.
