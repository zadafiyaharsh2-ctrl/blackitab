# BlackiTab Changelog & Fix Tracking

This document serves as the historical record for all structural adjustments, bug fixes, and enhancements made to BlackiTab. If a feature breaks in the future, refer to this log to see what files were modified during its implementation.

## Phase: March 2026 - Security & Structure Enhancements

### 1. AI Output Rate Limiting & Cost Controls (CRITICAL FIX)
**Risk:** Malicious scripts targeting the open AI endpoints (`/api/ai-questions/generate`, `/api/ai/chats`) could cause massive API billing spikes ("bankruptcy").
**Files Changed:**
- `blackitabbackend/routes/shared/aiRoutes.js`
- `blackitabbackend/routes/shared/aiQuestionRoutes.js`
**Fix:** Imported `express-rate-limit` to tightly restrict these endpoints. Question generation is capped at 20 requests per hour per IP. AI chat is capped at 50 messages per 15 minutes per IP.
**Documentation Added:** `AI_COST_CONTROL.md`

### 2. Redis Caching Crash Protection
**Risk:** Generic Redis containers default to storing indefinitely until they hit OOM (Out Of Memory) limits on host instances.
**Files Analyzed:**
- `blackitabbackend/utils/redisClient.js` (Verified TTL operations)
**Fix/Guideline:** Outlined the absolute requirement for setting `maxmemory` caps with an `allkeys-lru` eviction policy at the deployment layer.
**Documentation Added:** `REDIS_GUIDE.md`

### 3. Native Institute Dashboard Access Expansion
**Risk:** Previous code hard-blocked Institute Admins from natively interacting with Teacher or HOD dashboards.
**Files Changed:**
- `blackitabfrontend/src/components/shared/Sidebar.jsx`
**Fix:** Refactored the boolean link display conditions to utilize the backend's strict numerical role hierarchy (`userLevel >= teacher_level`). Now, admins fluidly inherit visual and endpoint access to all subordinate layers without requiring an entirely duplicated UI.
**Documentation Added:** `DEVELOPER.md`, `ARCHITECTURE.md`, `SECURITY.md`

### 4. Advanced "Class vs Lab" Attendance Module
**Risk:** Standard `{ classId, date }` primary key caused index collisions if a Teacher taught a Theory class in the morning and a Lab for the same batch in the afternoon.
**Files Changed:**
- `blackitabbackend/models/Attendance.js` -> Added `sessionType` [Class/Lab] to the Schema and compound index.
- `blackitabbackend/controllers/teacher/teacherController.js` -> Expanded lookup functions to accept and mutate `sessionType`.
- `blackitabfrontend/src/pages/teacher/TeacherAttendance.jsx` -> Integrated session dropdowns into the payload.
- `blackitabfrontend/src/components/shared/AttendanceGrid.jsx` -> Refactored month view table header logic so a single date spans multiple unique columns (`SessionClass`, `SessionLab`).
**Documentation Added:** `FEATURES.md`

### 5. PYQ Metadata Expansion (For JEE / NEET Support)
**Risk:** Existing model structure was too rigid to correctly capture deeply specific past paper metadata needed by rigorous coaching institutes.
**Files Changed:**
- `blackitabbackend/models/ExamQuestion.js` -> Added `sourceDate`, `sourcePart`, `sourceExamName`.
- `blackitabfrontend/src/components/teacher/tabs/CreateTab.jsx` -> Built robust form grouping tailored to Previous Year Questions.
- `MyBankTab.jsx`, `QuestionChecker.jsx`, `QuestionsTab.jsx` -> Added dynamic sub-badges next to `difficulty` tags showing `🌟 JEE Main • 2023 • Shift 1`.
