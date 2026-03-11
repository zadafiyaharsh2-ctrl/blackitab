# Blackitab - Next-Gen Tech Ed Platform

Blackitab is a premium, closed-source educational platform designed to elevate the technical learning experience. It connects students, teachers, and administrative oversight under a beautifully designed, highly performant ecosystem. 

Built with scalability and user experience in mind, Blackitab serves as a central hub for studying advanced technical concepts, competing in code-driven arenas, and engaging in vibrant community discussions.

---

## 🚀 Key Features

### 🎓 For Students
- **Interactive Learning Paths**: Engage with dynamically generated theory, interactive code snippets, and structured modules.
- **Adaptive AI Tutors**: Get real-time, context-aware assistance on difficult concepts directly within the study environment.
- **Competitive Arenas**: Compete in timed exams and coding contests, complete with real-time global and institute-level leaderboards.
- **Social Ecosystem**: Follow peers, subscribe to top educators, and share insights through rich-text community posts.
- **Progress Tracking**: Visualize your learning journey with detailed heatmaps, streak tracking, and pinpoint accuracy metrics.

### 👨‍🏫 For Teachers
- **Question Banks**: Curate question banks for specific subjects (JEE, NEET, GATE) with rich text options and detailed explanations.
- **Analytics Dashboard**: Monitor student performance on questions you've authored.
- **Student Feedback Loop**: Receive anonymous, constructive ratings and feedback straight from your institute's students to refine teaching methods.

### 🏛️ For Institutes (HODs & Admins)
- **Granular Member Management**: Invite, assign roles, ban, or remove students and teachers under your institute's umbrella.
- **Read-Only Oversight**: HODs possess powerful monitoring capabilities over students and teachers without risking accidental data loss.
- **Teacher Performance Tracking**: Automatically flag underperforming teachers based on aggregated student feedback.
- **Scoping & Privacy**: Institute data remains isolated, ensuring competitive strategies and internal announcements stay private.

### 👑 System Administration
- **Absolute Parity**: Full, unrestricted CRUD access across every layer of the application (Users, Institutes, Questions, Posts, Contests).
- **Global Oversight**: Real-time cross-institute analytics, platform health monitoring, and global teacher ratings.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** + **Framer Motion** for a premium, glassmorphism UI/UX
- **React Router Dom** for client-side routing
- **Axios** for robust API communication

### Backend
- **Node.js** & **Express**
- **MongoDB** with **Mongoose** for schema validation and relationships
- **JWT** (JSON Web Tokens) for secure, role-based authentication
- **Langchain** integration for the backend AI processing pipelines

---

## 🔒 Security & Architecture
- **Strict Role-Based Access Control (RBAC)**: Validated at both the middleware layer and the controller execution context.
- **Scoped Data Views**: Mongoose queries dynamically inject `instituteId` scopes depending on the requester's role.
- **XSS & Injection Protection**: Sanities against malicious payloads on social and forum posts.

> **Note on Distribution**: Blackitab is proprietary, closed-source software. Unauthorized distribution, modification, or commercial usage of this codebase is strictly prohibited.
