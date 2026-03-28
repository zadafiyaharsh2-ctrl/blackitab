# BlackiTab Developer Guide

Welcome to the development documentation for the BlackiTab application environment. This application uses an incredibly robust, hierarchy-based system to ensure high-end features scale across roles safely.

## Table of Contents
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Explains all folders and key files.
2. [SECURITY.md](./SECURITY.md) - Details authentication, API validation, and anti-tamper measures.
3. [FEATURES.md](./FEATURES.md) - Detailed breakdown of complex system behaviors (AI, Attendance, Leaderboards).

## Environment Setup
The project runs as an Express backend (`/blackitabbackend/`) and Vite + React frontend (`/blackitabfrontend/`).
Ensure `.env` in the backend has:
- `MONGO_URI`
- `JWT_SECRET`
- `REDIS_URL`

Run Redis on port 6379, MongoDB locally or on Atlas to start dev mode.

## Admin & Institute Workflows
As of recent updates:
**The Institute Administrator now has full visual access to the Teacher Dashboard and HOD features!** 
Due to strict hierarchical control, instead of writing an entirely separate UI for the Institute Admin, they naturally inherit the menu options and routes (`userLevel >= teacher_level`) without facing "Permission Denied" errors. The main System Admin operates on an even higher tier, managing all institutes combined.
