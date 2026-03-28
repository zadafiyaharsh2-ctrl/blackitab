# Architecture Overview

## Backend Structure (`/blackitabbackend/`)

- **/controllers/**: Contains endpoint handler logic separated by domain/feature.
  - `adminController.js`: Highly privileged routes (system analytics, global moderation, user impersonation limits).
  - `authController.js`: JWT-based signup/login and OAuth mechanisms.
  - `instituteController.js`: Institute level approvals and dashboard.
  - `teacherController.js` / `examController.js` / `studentController.js`: Business logic corresponding directly to role actions.
- **/middleware/**: Security, parsing, and caching.
  - `roleMiddleware.js`: Validates `req.user.role` strictly.
  - `cacheMiddleware.js`: Leverages Redis caching for read-heavy operations.
  - `security.js`: XSS, Request sanitization, and Brute-force protection.
- **/models/**: Mongoose DB schemas.
  - *Key feature*: Documents rely heavily on cross-referencing to remain flexible (e.g. `ExamQuestion` holds optional PyQ source data without breaking AI questions).
- **/routes/**: Express route definitions tying endpoints, middleware (auth/cache), and controllers.

## Frontend Structure (`/blackitabfrontend/src/`)

- **/components/**:
  - `shared/`: Highly reusable parts like `Sidebar.jsx`, `Pagination.jsx`, `PageShimmer.jsx`.
  - `admin/`, `teacher/`, `student/`: Role-specific tabs and fragmented UI blocks.
- **/pages/**: High-level routes combined via `react-router-dom`.
- **/context/**: Global state elements like `ThemeContext.js`.
- **/utils/**: Axios pre-configuration (`api.js`) to parse tokens on every outgoing network request, and `CustomToast` for unified notifications.
