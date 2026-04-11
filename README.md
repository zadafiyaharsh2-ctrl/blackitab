# Blackitab

Blackitab is a full-stack education platform built around role-based workflows for students, teachers, HODs, institute admins, and platform admins.

The repository is split into:

- `blackitabfrontend`: React + Vite frontend
- `blackitabbackend`: Node.js + Express + MongoDB backend

## What The Project Does

Blackitab combines learning, assessment, social features, and institute management in one application.

Core areas in the current codebase include:

- Student practice and progress tracking
- Theory/study content
- Exams and question generation
- Contests and leaderboards
- Ask AI and AI-assisted question flows
- Social posts, messaging, followers, notifications
- Teacher dashboards, batches, attendance, assignments
- Institute member and content management
- Admin analytics and platform oversight

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router
- Tailwind CSS
- Axios
- Socket.IO client
- Framer Motion
- React Hot Toast

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- Socket.IO
- Cloudinary uploads
- PDFKit
- Nodemailer / Resend

## Repository Structure

```text
blackitab/
|- blackitabfrontend/
|  |- src/
|  |- package.json
|- blackitabbackend/
|  |- controllers/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- services/
|  |- index.js
|  |- package.json
|- DEPLOYMENT.md
|- TOPIC_PROGRESS_DATABASE.md
```

## Roles In The System

The backend uses a shared `User` model for account roles such as:

- `student`
- `teacher`
- `hod`
- `institute`

Institute organization data itself is stored separately in the `Institute` model.

That means:

- account/auth identity lives in `blackitabbackend/models/User.js`
- institute profile/entity data lives in `blackitabbackend/models/Institute.js`

## Main Backend Entry Points

The API server is started from:

- `blackitabbackend/index.js`

Mounted API groups include:

- `/api/me`
- `/api/progress`
- `/api/problems`
- `/api/social`
- `/api/messages`
- `/api/posts`
- `/api/user`
- `/api/ai`
- `/api/ai-questions`
- `/api/institute`
- `/api/attempts`
- `/api/analytics`
- `/api/admin`
- `/api/exams`
- `/api/contests`
- `/api/questions`
- `/api/teacher`
- `/api/admin-chat`

## Local Development

### Prerequisites

- Node.js 20+
- npm
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Install Dependencies

Frontend:

```bash
cd blackitabfrontend
npm install
```

Backend:

```bash
cd blackitabbackend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in `blackitabbackend/`.

Minimum required variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/blackitab
JWT_SECRET=your_jwt_secret
```

Optional backend variables used in the current codebase:

```env
LANGCHAIN_API_URL=http://127.0.0.1:8000/query
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

Create a `.env` file in `blackitabfrontend/` only if you want to override the API base URL.

```env
VITE_API_URL=http://localhost:5000
```

### 3. Run The Backend

```bash
cd blackitabbackend
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### 4. Run The Frontend

```bash
cd blackitabfrontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Build Commands

Frontend production build:

```bash
cd blackitabfrontend
npm run build
```

Backend production start:

```bash
cd blackitabbackend
npm start
```

## Environment Notes

### Frontend API Resolution

The frontend API URL is centralized in:

- `blackitabfrontend/src/config.js`

Current behavior:

- use `VITE_API_URL` if provided
- otherwise fall back to `http://localhost:5000`

### AI Integration

Some backend controllers call an external/local AI service through:

- `LANGCHAIN_API_URL`

If that service is not running, AI-related routes may fail while the rest of the app continues to work.

### Real-Time Features

Socket.IO is used for:

- online presence
- messaging
- related live app events

## Deployment

This repository already includes deployment notes in:

- `DEPLOYMENT.md`

The current deployment approach documented in the repo is:

- Frontend on Netlify
- Backend on Render

Typical production setup:

- `blackitabfrontend` as the frontend root/build app
- `blackitabbackend` as the backend service root
- `VITE_API_URL` pointing the frontend to the deployed backend

## Documentation Files

Additional repo documents:

- `DEPLOYMENT.md`
- `TOPIC_PROGRESS_DATABASE.md`

## Security And Access Control

The backend includes:

- JWT-based authentication
- role-based authorization middleware
- institute-scoped access control
- Helmet security headers
- rate limiting on `/api`
- Mongo sanitize middleware

## Notes For Contributors

- Frontend and backend are intentionally separated into their own apps.
- Most user-facing role behavior is controlled by the `role` field in the shared `User` model.
- Institute-specific data usually depends on `user.instituteId`.
- If you change API routes or payloads, update both frontend consumers and backend controllers together.

## License

No open-source license is defined in this repository.

Unless you intend to make it public under a specific license, this should be treated as a private project.


Services has been shifted