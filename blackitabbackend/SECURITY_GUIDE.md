# 🔒 Security Guide — Blackitab Backend

> For developers working on the backend. Read this **before** writing any new route or controller.

---

## Table of Contents

1. [Environment Variables](#1-environment-variables)
2. [Middleware Stack](#2-middleware-stack)
3. [Access Control Patterns](#3-access-control-patterns)
4. [Feature Flags (Kill Switch)](#4-feature-flags-kill-switch)
5. [Per-User Rate Limiting](#5-per-user-rate-limiting)
6. [Audit Logging](#6-audit-logging)
7. [Bug & Report System](#7-bug--report-system)
8. [Campus Access Control](#8-campus-access-control)
9. [IDOR Prevention Checklist](#9-idor-prevention-checklist)
10. [Common Attack Vectors](#10-common-attack-vectors)

---

## 1. Environment Variables

Add these to your `.env`:

```env
# ── Security ──
JWT_SECRET=your-secret-key

# ── Feature Flags ──
BETA_MODE=true
DISABLED_FEATURES=                  # comma-separated: uploads,messages,ai,registrations,social,exams

# ── Campus Access Control ──
ALLOWED_EMAIL_DOMAINS=              # e.g., college.edu,partner.edu (empty = allow all)
MAX_SIGNUPS_PER_DAY=                # e.g., 100 (empty = unlimited)
REQUIRE_INSTITUTE_CODE=false        # true = require institute code on registration

# ── Rate Limiting ──
REDIS_URL=                          # optional, for per-user rate limiter (fallbacks to in-memory Map)
```

---

## 2. Middleware Stack

Applied in this order in `index.js`:

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | `helmet` | Security headers |
| 2 | `securityHeaders` | Request ID, cache control |
| 3 | Body limit (10kb) | Prevent large payload attacks |
| 4 | XSS strip | Remove `<script>` tags |
| 5 | `hpp` | Prevent parameter pollution |
| 6 | MongoDB sanitize | Prevent NoSQL injection |
| 7 | `auditLogger` | Log critical actions (best-effort) |
| 8 | `authMiddleware` (`protect`) | JWT authentication (per-route) |
| 9 | `requireRole` / `requireMinRole` | Role-based access (per-route) |
| 10 | `validateObjectId` | Param validation (per-route) |
| 11 | `requireBatchOwner` | Ownership check (per-route) |
| 12 | `requireFeature` | Feature flag gate (per-route) |
| 13 | `perUserLimit` | Per-user rate limiting (per-route) |

---

## 3. Access Control Patterns

### When to use what

| Scenario | Middleware / Pattern |
|----------|---------------------|
| "Must be logged in" | `protect` |
| "Must be teacher or above" | `requireMinRole('teacher')` |
| "Must be exactly institute admin" | `requireRole('institute')` |
| "Must own this batch" | `requireBatchOwner` |
| "Route param must be valid ObjectId" | `validateObjectId('id')` |
| "Must be in same institute" | `requireSameInstitute` OR `req.user.instituteId` check in controller |

### Adding a new route — checklist

```js
// 1. Always start with auth
router.get('/resource/:id',
    protect,                              // 1. Auth
    requireMinRole('teacher'),            // 2. Role check
    validateObjectId('id'),               // 3. Param validation
    requireBatchOwner,                    // 4. Ownership (if batch-related)
    requireFeature('featureName'),        // 5. Feature flag (if toggleable)
    perUserLimit({ max: 30, windowMs: 60000, feature: 'xxx' }),  // 6. Rate limit (if abuse-prone)
    controller.handler                    // 7. Controller
);
```

### In controllers — ownership check pattern

```js
// Always verify ownership before mutating resources
const resource = await Model.findById(req.params.id);
if (!resource) return res.status(404).json({ success: false, message: 'Not found' });

// Check ownership
if (resource.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your resource' });
}
```

### In controllers — institute boundary pattern

```js
const instId = req.user.instituteId;
if (!instId) return res.status(400).json({ success: false, message: 'Not linked to an institute' });

// Always scope queries to the user's institute
const results = await Model.find({ instituteId: instId });
```

---

## 4. Feature Flags (Kill Switch)

**File:** `middleware/featureFlags.js`

### Disable a feature at runtime

```env
DISABLED_FEATURES=messages,uploads
```

This will return `503 Service Unavailable` for:
- `messages` → `POST /api/messages/send`
- `uploads` → `POST /api/posts/create`
- `ai` → All AI routes
- `registrations` → Register routes

> **Important (Adjustment A):** Only apply `requireFeature('uploads')` to POST/upload endpoints. Never gate read-only endpoints (feed, like, comment).

### Use in code

```js
const { requireFeature, isFeatureEnabled, isBetaMode } = require('./middleware/featureFlags');

// As middleware
router.post('/send', protect, requireFeature('messages'), controller.send);

// In controller logic
if (!isFeatureEnabled('ai')) {
    return res.json({ aiAvailable: false });
}
```

---

## 5. Per-User Rate Limiting

**File:** `middleware/userRateLimit.js`

### Current limits

| Endpoint | Limit | Cooldown |
|----------|-------|----------|
| Message send | 30/min | 30 min after 3 violations |
| Add comment | 20/min | 30 min after 3 violations |
| Follow/Unfollow | 30/min | 30 min after 3 violations |
| Search | 30/min | 30 min after 3 violations |

### How it works

1. Tracks requests per `userId` per `feature` in Redis (or Map fallback)
2. If user exceeds `max` in `windowMs` → returns `429 Too Many Requests`
3. After **3 consecutive** 429 violations → sets `User.restrictedUntil` to 30 min from now
4. While restricted → ALL rate-limited routes return 429 immediately

### Adding a new rate limit

```js
const { perUserLimit } = require('../../middleware/userRateLimit');

router.post('/action', protect,
    perUserLimit({ max: 20, windowMs: 60000, feature: 'my-action' }),
    controller.action
);
```

---

## 6. Audit Logging

**Files:** `middleware/auditLogger.js`, `models/AuditLog.js`, `routes/admin/auditRoutes.js`

### What gets logged

| Trigger | Action Type |
|---------|-------------|
| 401 response | `auth_failure` |
| 403 response | `access_denied` |
| 429 response | `rate_limited` |
| 503 response | `feature_disabled` |
| Message send | `message_send` |
| Post create/delete | `post_create` / `post_delete` |
| File download | `download_attempt` |
| Registration | `registration` |
| Login | `login` |
| Member changes | `member_change` |
| Batch mutations | `batch_mutation` |
| Admin actions | `admin_action` |

### Rules (Adjustment C)

- **Best-effort only** — never blocks requests
- **No PII** — never logs request bodies, only action + ID params
- **Async** — uses `res.on('finish')` + `setImmediate()`
- **Auto-cleanup** — TTL index deletes logs after 90 days

### Admin endpoints

```
GET /api/admin/audit?type=access_denied&from=2024-01-01&userId=xxx&page=1&limit=50
GET /api/admin/security-summary
```

---

## 7. Bug & Report System

### Bug reports (expanded)

`POST /api/bugs` now accepts:

```json
{
    "description": "Required (min 10 chars)",
    "category": "bug | security | abuse",
    "severity": "low | medium | high | critical",
    "stepsToReproduce": "Optional",
    "expectedBehavior": "Optional",
    "actualBehavior": "Optional",
    "endpoint": "Optional — e.g., /api/messages/send",
    "pageContext": "Optional — current URL path"
}
```

### Content/User reports

`POST /api/bugs/report` — report a user, post, message, or comment:

```json
{
    "targetType": "user | post | message | comment",
    "targetId": "ObjectId of the target",
    "reason": "spam | harassment | inappropriate | impersonation | security | other",
    "details": "Optional description"
}
```

### Admin moderation

```
GET  /api/bugs/admin/reports?status=pending&targetType=user
PUT  /api/bugs/admin/reports/:id  { status, reviewNote, actionTaken }
```

---

## 8. Campus Access Control

**File:** `controllers/shared/authController.js` → `validateCampusAccess()`

### Email domain restriction

```env
ALLOWED_EMAIL_DOMAINS=mycollege.edu,partner.edu
```

Only emails ending with these domains can register. Leave empty to allow all.

### Daily signup cap

```env
MAX_SIGNUPS_PER_DAY=100
```

Returns 429 when the daily limit is reached. Leave empty for unlimited.

### Institute code requirement

```env
REQUIRE_INSTITUTE_CODE=true
```

When enabled, all new registrations must provide a valid institute code.

> Applied to both `POST /api/register` and Google OAuth signup.

---

## 9. IDOR Prevention Checklist

Before merging any PR, verify:

- [ ] Every route with `:id` param has `validateObjectId('id')`
- [ ] Every DELETE/PUT route checks ownership in controller OR uses `requireBatchOwner`
- [ ] Institute-scoped queries always filter by `req.user.instituteId`
- [ ] `getUserProfile` hides sensitive fields for private accounts
- [ ] Search queries use `escapeRegex()` before `$regex`
- [ ] File download routes verify the requester is an authorized party

---

## 10. Common Attack Vectors & Defenses

| Attack | Defense | Status |
|--------|---------|--------|
| **IDOR** (accessing other users' resources) | Ownership checks in controllers + `requireBatchOwner` | ✅ |
| **NoSQL Injection** (`$gt`, `$ne` in params) | `mongo-sanitize` middleware | ✅ |
| **ReDoS** (regex denial of service) | `escapeRegex()` in search | ✅ |
| **XSS** (script injection) | XSS strip middleware + Helmet | ✅ |
| **CSRF** | JWT auth (not cookie-based) | ✅ |
| **Brute force login** | `authLimiter` (10/15min) | ✅ |
| **Message spam** | Per-user rate limit (30/min) + auto-cooldown | ✅ |
| **Comment spam** | Per-user rate limit (20/min) + auto-cooldown | ✅ |
| **Outsider access** | Email domain + institute code restriction | ✅ |
| **Feature abuse** | Kill switch via `requireFeature()` | ✅ |
| **Parameter pollution** | `hpp` middleware | ✅ |
| **Large payload** | 10kb body limit | ✅ |

---

## Quick Reference — File Map

```
middleware/
├── accessControl.js     — validateObjectId, requireBatchOwner, escapeRegex
├── auth.js              — JWT authentication
├── auditLogger.js       — best-effort security logging
├── cacheMiddleware.js   — Redis cache
├── featureFlags.js      — feature kill switch
├── roleMiddleware.js    — role-based access control
├── security.js          — headers, error handler, 404
├── upload.js            — file upload handling
└── userRateLimit.js     — per-user rate limits + cooldown

models/
├── AuditLog.js          — security audit log (TTL 90d)
├── BugReport.js         — bug/security/abuse reports
├── Report.js            — user/post/message moderation queue
└── User.js              — has restrictedUntil field for cooldowns

routes/admin/
└── auditRoutes.js       — GET /audit, GET /security-summary
```
