# Security Best Practices

BlackiTab takes data integrity exceptionally seriously, protecting student marks, school infrastructure setup, and competitive question banks.

## 1. Role-Based Access Control (RBAC) Hierarchy

The system defines hierarchy levels in `roleMiddleware.js`:
- Student (0)
- Teacher (1)
- HOD (2)
- Institute Admin (3)
- System Admin (4+)

Every protected route is wrapped with `protect` (`authMiddleware`), which explicitly extracts and validates the user `id` via `JWT_SECRET`.
After authenticating, `requireMinRole` compares numerical levels directly. An Institute Admin (`level 3`) is naturally permitted to query endpoints meant for a Teacher (`level 1`), ensuring seamless downward privilege visibility. 

## 2. Institute Isolation (`requireSameInstitute`)
In multitenant SaaS instances, Teachers/HODs log in and *must* only see data belonging to their institute.
This middleware (`requireSameInstitute`) actively verifies that `req.params.instituteId` or `req.body.instituteId` perfectly matches `req.user.instituteId`. Attempting to access or mutate another school's data will immediately return a `403 Access Denied`.

## 3. Form Input & Request Security (`security.js`)
We use multiple industry-standard libraries:
- **Helmet**: Secures the HTTP headers against common vulnerabilities.
- **XSS-Clean**: Protects against cross-site scripting attacks, scrubbing potential Javascript inside user-provided comments or questions.
- **Express-Mongo-Sanitize**: Prevents NoSQL queries via the payload (e.g., users trying to inject `"$gt": ""` inside login logic to bypass passwords).
- **Express-Rate-Limit**: Implemented heavily on auth endpoints to mitigate brute force credential stuffing.

## 4. Frontend Security Considerations
- JWT Tokens are managed in `localStorage`. 
- Every network request (via `axios`/`api.js`) contains an interceptor attaching the Bearer Token to the Authorization Header.
- The `Sidebar` component computes roles dynamically (`userLevel`), hiding menu paths that the user physically does not have permission to view. Even if they type the URL to bypass the UI, the backend RBAC block is insurmountable.
