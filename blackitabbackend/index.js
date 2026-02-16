/**
 * ============================================================================
 * MAIN SERVER FILE (index.js)
 * ============================================================================
 * 
 * This is the entry point for the backend Express server.
 * It sets up the server, middleware, database connection, and all API routes.
 * 
 * Server runs on: http://localhost:5000 (or PORT from environment variable)
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

// Import HTTP module to create server explicitly (needed for Socket.io)
const http = require('http');
const { Server } = require('socket.io');

// Create Express application instance
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://blackitab.netlify.app"], // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Socket.io connection handler
const userSocketMap = {}; // {userId: socketId}

io.on('connection', (socket) => {
  // console.log('A user connected:', socket.id); // Replaced with more detailed log below

  const userId = socket.handshake.query.userId;
  console.log(`Socket Debug: Connection attempt. SocketID: ${socket.id}, UserID: ${userId}`);

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`Socket Debug: User mapped. Map:`, Object.keys(userSocketMap));
  } else {
    console.log(`Socket Debug: Connection rejected/ignored for tracking. Invalid UserID.`);
  }

  // Send keys as an array of online user IDs
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  console.log("Socket Debug: Emitted getOnlineUsers:", Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('Socket Debug: User disconnected:', socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export helper to get receiver's socket id (useful for message controller later)
const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};
app.set('getReceiverSocketId', getReceiverSocketId);

// Middleware to attach io instance to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

// Import authentication controller (register, login)
const authController = require('./controllers/authController');

// Import theory controller (subjects, topics, content)
const theoryController = require('./controllers/theoryController');

// ============================================================================
// HEALTH CHECK ROUTE
// ============================================================================

// GET / - Basic health check to confirm server is running
app.get('/', (req, res) => {
  // Send simple text response indicating status
  res.send('API is running...');
});

// Ignore favicon.ico requests to prevent 404s
// Browsers automatically request this icon; sending 204 (No Content) stops errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// POST /api/register - Register a new user
// Body: { email, password, name }
// Response: { success, message, userId }
app.post('/api/register', authController.register);

// POST /api/login - Login existing user
// Body: { email, password }
// Response: { success, token, user }
app.post('/api/login', authController.login);

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
// Import progress routes (modular routing)
const progressRoutes = require('./routes/progress');

// Use progress routes with /api/progress prefix
// All endpoints in progressRoutes will start with /api/progress
// e.g., /api/progress/mark-complete
app.use('/api/progress', progressRoutes);

// ============================================================================
// PROBLEM ROUTES
// ============================================================================
// Import and use problem routes
const problemRoutes = require('./routes/problemRoutes');
app.use('/api/problems', problemRoutes);

// ============================================================================
// SOCIAL ROUTES
// ============================================================================
const socialRoutes = require('./routes/socialRoutes');
app.use('/api/social', socialRoutes);

// ============================================================================
// STATIC FILES
// ============================================================================
// Serve uploaded files statically
// path.join(__dirname, 'uploads') resolves to absolute path of uploads folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================================
// MESSAGE ROUTES
// ============================================================================
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// ============================================================================
// POST ROUTES (CLOUDINARY)
// ============================================================================
const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

// ============================================================================
// USER ROUTES (PROFILE UPDATE)
// ============================================================================
const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

// ============================================================================
// PLAYLIST ROUTES
// ============================================================================
const playlistRoutes = require('./routes/playlistRoutes');
app.use('/api/playlists', playlistRoutes);

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
    // jwt.verify() checks signature, expiration, and secret
    // Returns decoded payload (contains userId)
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user in database using userId from token
    // .select('-password') excludes password field from result for security
    // We never want to send password hash to client, even if encrypted
    const user = await User.findById(decoded.userId).select('-password');

    // Check if user exists in database (might have been deleted)
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
        id: user._id, // User's MongoDB ObjectId
        email: user.email, // User's email address
        name: user.name, // User's display name
        bio: user.bio,
        profileImage: user.profileImage,
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        subscriberCount: user.subscriberCount || 0
      }
    });
  } catch (error) {
    // Handle JWT-specific errors (Invalid signature or Expired)
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
server.listen(PORT, () => {
  // Log server URL to console
  console.log(`Server is running on http://localhost:${PORT}`);

  // Log MongoDB connection string (for debugging)
  console.log(`MongoDB connection: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab'}`);
});
