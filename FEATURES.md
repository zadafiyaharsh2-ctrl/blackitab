# Main Platform Features

BlackiTab includes advanced tooling tailored to competitive examination institutions.

## 1. Dual-Session Attendance (Class vs Lab)
In early days, institutions found `Date` primary keys for attendance too limiting when tracking both Theory Classes and Labs individually on identical days.
Our attendance module natively supports grouping by a compound key consisting of `{ classId, date, sessionType: "Class"|"Lab" }`. 
By passing `sessionType` in query filters, the system elegantly displays independent side-by-side matrices (e.g., `12th Oct (Class)` vs `12th Oct (Lab)`) in the Monthly Report format.

## 2. PYQ (Previous Year Question) Subsystems
The standard question format was recently expanded specifically targeting JEE and NEET preparation workflows.
Questions can be tagged `isPYQ`. Detailed metadata optionally captures:
- `sourceYear` (e.g., 2023)
- `sourceShift` (e.g., 1 or 2)
- `sourceDate` (Exact date of test formulation)
- `sourcePart` (e.g., Session 1 or specific domain chunk)
- `sourceExamName` (e.g., Custom internal mock designation or JEE Advanced vs JEE Main)

This data drives high-value badge components on all question displays seamlessly, empowering teachers and students with the context behind difficult problems.

## 3. High-Performance Caching
Endpoints facing excessive reads by mass-scale users (such as global student leaderboards or institute-wide announcements) are piped into a Redis container via a custom caching module (`cacheMiddleware.js`). 

## 4. AI Assurances & Exam Gen
The platform natively handles AI generation endpoints to formulate questions. These are forcibly tagged with `isAiGenerated = true`, which allows human moderators (HODs or Institute Admins) to easily filter and review them ensuring accuracy before final publication onto live exams.
