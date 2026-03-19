# Blackitab Backend — Production Deployment Guide

> Enterprise-grade Node.js + Express + MongoDB backend powering the Blackitab learning platform.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Security Architecture](#security-architecture)
- [API Rate Limits](#api-rate-limits)
- [Deployment Checklist](#deployment-checklist)
- [Architecture Overview](#architecture-overview)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see Environment Variables below)
cp .env.example .env

# 3. Development mode (with hot-reload)
npm run dev

# 4. Production mode
NODE_ENV=production npm start
```

**Requirements:** Node.js ≥ 20.0.0, MongoDB, Redis (optional, for caching)

---

## Environment Variables

Create a `.env` file in the backend root. **All variables below are required for production.**

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | JWT signing secret (**must be strong, 256-bit+**) | `a1b2c3d4...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `EMAIL_USER` | SMTP email address | `noreply@example.com` |
| `EMAIL_PASS` | SMTP app password | `xxxx xxxx xxxx xxxx` |
| `RESEND_API_KEY` | Resend.com API key | `re_xxxxx` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dxxxxxxx` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `39943...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `3IiM0...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `58524...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-...` |
| `LANGCHAIN_API_URL` | AI microservice endpoint | `http://localhost:7860/query` |

> [!CAUTION]
> **Never commit `.env` to version control.** Ensure `.env` is in `.gitignore`.

> [!IMPORTANT]
> For production, `JWT_SECRET` must be a cryptographically random string (minimum 64 characters). Use `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` to generate one.

---

## Security Architecture

This backend implements **10 layers of defense** to protect against common web vulnerabilities.

### 1. Helmet — HTTP Security Headers
- **Content Security Policy (CSP):** Restricts which sources can load scripts, styles, images, and fonts. Prevents XSS via inline script injection.
- **HSTS:** Forces HTTPS connections for 1 year with subdomain coverage and preload eligibility.
- **Referrer Policy:** `strict-origin-when-cross-origin` — prevents leaking full URLs to third parties.
- **X-Content-Type-Options:** `nosniff` — prevents MIME-type sniffing attacks.
- **X-Frame-Options:** `DENY` — prevents clickjacking attacks.
- **X-Powered-By:** Removed — hides Express server fingerprint.

### 2. CORS — Cross-Origin Resource Sharing
- **Strict Whitelist:** Only explicitly allowed origins can access the API.
- **Credentials:** Enabled for secure cookie/token transmission.
- **Configured Origins:** `localhost:5173`, `127.0.0.1:5173`, `blackitab.vercel.app`

### 3. Rate Limiting
- **Global:** 500 requests per IP per 15-minute window across all `/api` routes.
- **Auth-Specific:** 10 requests per IP per 15-minute window on login/register endpoints (brute-force prevention).
- Returns `RateLimit-*` standard headers for client-side awareness.

### 4. XSS Protection (`xss-clean`)
- Automatically sanitizes all user input in `req.body`, `req.query`, and `req.params`.
- Strips HTML tags and JavaScript event handlers from form submissions.

### 5. NoSQL Injection Protection (`express-mongo-sanitize`)
- Sanitizes MongoDB query operators (`$gt`, `$ne`, etc.) from user input.
- Replaces malicious characters with `_` to prevent query manipulation.

### 6. HTTP Parameter Pollution (`hpp`)
- Prevents duplicate query parameter attacks that can bypass validation logic.
- Example: `?role=student&role=admin` would be collapsed to the last value.

### 7. Payload Size Limits
- **JSON Bodies:** Limited to `10kb` — prevents large-payload Denial of Service.
- **URL-encoded:** Limited to `10kb`.
- **File Uploads:** Limited to `5MB` with strict MIME-type validation (images only).

### 8. Response Compression (`compression`)
- Gzip compression on all responses — reduces bandwidth by ~70%.
- Improves load times for API-heavy frontend applications.

### 9. Request Tracing
- Every request receives a unique `X-Request-ID` header (UUID v4).
- Enables end-to-end request tracing across frontend → backend → logs.

### 10. Global Error Handler
- **Development:** Returns full error messages and stack traces for debugging.
- **Production:** Returns generic `"Internal server error"` — **never leaks stack traces, file paths, or internal details**.
- Handles specific error types: `ValidationError`, `CastError`, `DuplicateKey`, `JWT` errors.

---

## API Rate Limits

| Endpoint | Limit | Window | Purpose |
|---|---|---|---|
| `POST /api/login` | 10 | 15 min | Brute-force prevention |
| `POST /api/register` | 10 | 15 min | Spam prevention |
| `POST /api/register-institute` | 10 | 15 min | Spam prevention |
| `POST /api/auth/google` | 10 | 15 min | OAuth abuse prevention |
| `ALL /api/*` | 500 | 15 min | General DDoS prevention |

---

## Deployment Checklist

Use this checklist when deploying to production:

### Pre-Deployment
- [ ] Set `NODE_ENV=production` in environment
- [ ] Generate a strong `JWT_SECRET` (64+ random hex characters)
- [ ] Ensure MongoDB uses authentication (not open)
- [ ] Ensure `.env` is NOT committed to git
- [ ] Update CORS `allowedOrigins` to include your production domain
- [ ] Update Socket.io `cors.origin` to match production domain

### Server Configuration
- [ ] Use a reverse proxy (Nginx/Caddy) in front of Node.js
- [ ] Enable HTTPS/TLS via your reverse proxy
- [ ] Set up process manager (PM2) for auto-restart and clustering
- [ ] Configure firewall to only expose ports 80/443

### Database
- [ ] Enable MongoDB authentication
- [ ] Use a dedicated MongoDB Atlas cluster (or self-hosted with auth)
- [ ] Set up automated backups
- [ ] Create database indexes for frequently queried fields

### Monitoring
- [ ] Set up application logging (e.g., Winston, Pino)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Monitor rate limit headers for abuse patterns

---

## Architecture Overview

```
blackitabbackend/
├── config/              # Database configuration
├── controllers/         # Business logic
│   ├── admin/           # System admin controllers
│   ├── institute/       # Institute management
│   ├── shared/          # Shared (auth, theory, AI)
│   ├── student/         # Student-facing controllers
│   └── teacher/         # Teacher-facing controllers
├── middleware/           # Security & utility middleware
│   ├── auth.js          # JWT authentication
│   ├── cacheMiddleware.js  # Redis caching layer
│   ├── roleMiddleware.js   # RBAC + institute scoping
│   ├── security.js      # Custom headers + global error handler
│   └── upload.js        # File upload with validation
├── models/              # Mongoose schemas
├── routes/              # Express routers
├── services/            # Background jobs, socket.io
├── utils/               # Redis client, helpers
├── index.js             # Entry point (security middleware chain)
├── package.json
└── .env                 # Environment variables (NOT in git)
```

### Security Middleware Chain (Order Matters)

```
Request → Helmet → Security Headers → CORS → Compression
       → Rate Limiter → Body Parser (10kb limit)
       → XSS Clean → HPP → Mongo Sanitize
       → Auth (JWT) → Role Check → Controller
       → 404 Handler → Global Error Handler → Response
```

---

## License

Private & Proprietary. All rights reserved.
