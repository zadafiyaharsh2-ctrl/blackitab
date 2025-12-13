/**
 * ============================================================================
 * MAIN SERVER FILE (index.js)
 * ============================================================================
 * 
 * This is the entry point for the backend Express server.
 * It sets up the server, middleware, database connection, and all API routes.
 * 
 * Server runs on: http://localhost:5000 (or PORT from environment variable)
 * 
 * Main Components:
 * 1. Express server setup
 * 2. Middleware configuration (CORS, JSON parsing)
 * 3. Database connection
 * 4. API route definitions
 * 5. Server startup
 * 
 * API Endpoints:
 * - Authentication: /api/register, /api/login, /api/verify-otp
 * - Theory: /api/subjects, /api/subjects/:id/topics, /api/topics/:id/full
 * - User: /api/me (protected route)
 */

// ============================================================================
// IMPORTS AND DEPENDENCIES
// ============================================================================

// Import Express framework for building web server
const express = require('express');

// Import CORS middleware to allow cross-origin requests
// Needed because frontend (port 5173) and backend (port 5000) are on different ports
const cors = require('cors');

// Import JWT library for creating and verifying authentication tokens
const jwt = require('jsonwebtoken');

// Load environment variables from .env file
// This must be called early to make process.env variables available
require('dotenv').config();

// Import database connection function
const connectDB = require('./config/database');

// Import User model for authentication routes
const User = require('./models/User');

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

// Create Express application instance
const app = express();

// Set server port from environment variable or default to 5000
// Environment variable allows flexibility in deployment (Heroku, AWS, etc.)
const PORT = process.env.PORT || 5000;

// Set JWT secret key from environment variable or use default
// IMPORTANT: In production, ALWAYS use a strong secret from environment variable
// Default is only for development convenience
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

// Connect to MongoDB database
// This function is async and runs immediately when server starts
// Connection details are in config/database.js
connectDB();

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend running on http://localhost:5173 to make requests to this server
// Without this, browser would block requests due to same-origin policy
app.use(cors());

// Parse incoming JSON request bodies
// Converts JSON strings in request body to JavaScript objects
// Makes req.body available in route handlers
app.use(express.json());

// ============================================================================
// IMPORT CONTROLLERS
// ============================================================================

// Import authentication controller (register, login, OTP verification)
const authController = require('./controllers/authController');

// Import theory controller (subjects, topics, content)
const theoryController = require('./controllers/theoryController');

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

// GET / - Basic health check to confirm server is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST /api/register - Register a new user
// Body: { email, password, name }
// Response: { success, message, userId }
app.post('/api/register', authController.register);

// POST /api/login - Login existing user
// Body: { email, password }
// Response: { success, message } (OTP sent to email)
app.post('/api/login', authController.login);

// POST /api/verify-otp - Verify OTP and get JWT token
// Body: { email, otp }
// Response: { success, token, user }
app.post('/api/verify-otp', authController.verifyOTP);

// ============================================================================
// THEORY ROUTES (PUBLIC)
// ============================================================================

// GET /api/subjects - Get all subjects
// Response: { success, data: [subjects] }
app.get('/api/subjects', theoryController.getSubjects);

// GET /api/subjects/:subjectId/topics - Get topics for a subject
// URL param: subjectId (MongoDB ObjectId)
// Response: { success, data: [topics] }
app.get('/api/subjects/:subjectId/topics', theoryController.getTopicsBySubject);

// GET /api/topics/:id/full - Get full content for a topic
// URL param: id (topic's MongoDB ObjectId)
// Response: { success, data: {topicId, title, content, ...} }
app.get('/api/topics/:id/full', theoryController.getTopicFullContent);

// ============================================================================
// PROGRESS ROUTES (PROTECTED)
// ============================================================================
// Import progress routes
const progressRoutes = require('./routes/progress');

// Use progress routes with /api/progress prefix
// All routes require authentication (handled in routes/progress.js)
app.use('/api/progress', progressRoutes);

// ============================================================================
// PROBLEM ROUTES
// ============================================================================
const problemRoutes = require('./routes/problemRoutes');
app.use('/api/problems', problemRoutes);

// ============================================================================
// PROTECTED ROUTE - GET CURRENT USER
// ============================================================================
// GET /api/me - Get current user's information
// Requires: Authorization header with Bearer token
// Response: { success, user: {id, email, name} }
app.get('/api/me', async (req, res) => {
  try {
    // Extract token from Authorization header
    // Header format: "Bearer <token>"
    // split(' ')[1] gets the token part after "Bearer "
    // ?. is optional chaining - prevents error if authorization header doesn't exist
    const token = req.headers.authorization?.split(' ')[1];

    // Check if token was provided
    if (!token) {
      // Return 401 Unauthorized if no token
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify and decode the JWT token
    // jwt.verify() checks:
    // 1. Token signature is valid (not tampered with)
    // 2. Token hasn't expired
    // 3. Token was signed with our JWT_SECRET
    // Returns decoded payload (contains userId)
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user in database using userId from token
    // .select('-password') excludes password field from result for security
    // We never want to send password hash to client, even if encrypted
    const user = await User.findById(decoded.userId).select('-password');

    // Check if user exists in database
    // User might have been deleted after token was issued
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send user information to client
    res.json({
      success: true,
      user: {
        id: user._id,      // User's MongoDB ObjectId
        email: user.email,  // User's email address
        name: user.name     // User's display name
      }
    });
  } catch (error) {
    // Handle JWT-specific errors
    // JsonWebTokenError: Invalid token format or signature
    // TokenExpiredError: Token has expired
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Handle other unexpected errors
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

// Start Express server and listen on specified port
// Callback function runs once server successfully starts
app.listen(PORT, () => {
  // Log server URL to console
  console.log(`Server is running on http://localhost:${PORT}`);

  // Log MongoDB connection string (for debugging)
  // Shows which database we're connected to
  console.log(`MongoDB connection: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab'}`);
});
