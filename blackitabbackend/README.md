# Blackitab Backend

Node.js/Express backend with MongoDB database for user authentication.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. MongoDB Setup

You have two options:

#### Option A: Local MongoDB
1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. The app will connect to `mongodb://localhost:27017/blackitab` by default

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Add it to your `.env` file as `MONGODB_URI`

### 3. Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/blackitab
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blackitab?retryWrites=true&w=majority
```

### 4. Run the Server

```bash
npm start
```

or for development:

```bash
npm run dev
```

## API Endpoints

### POST /api/register
Register a new user
- Body: `{ name, email, password }`
- Returns: `{ success, token, user }`

### POST /api/login
Login user
- Body: `{ email, password }`
- Returns: `{ success, token, user }`

### GET /api/me
Get current user (protected)
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, user }`

## Database Schema

### User Model
- `name` (String, required)
- `email` (String, required, unique, lowercase)
- `password` (String, required, min 6 characters, hashed)
- `createdAt` (Date, auto-generated)

