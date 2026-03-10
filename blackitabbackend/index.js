const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const User = require('./models/User');
const { startCronJobs } = require('./services/cronService');

// Controllers used directly in this file
const authController = require('./controllers/authController');
const theoryController = require('./controllers/theoryController');

// Route modules
const progressRoutes = require('./routes/progress');
const problemRoutes = require('./routes/problemRoutes');
const socialRoutes = require('./routes/socialRoutes');
const messageRoutes = require('./routes/messageRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const aiQuestionRoutes = require('./routes/aiQuestionRoutes');
const instituteRoutes = require('./routes/instituteRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const examRoutes = require('./routes/examRoutes');
const contestRoutes = require('./routes/contestRoutes');

// --- Server Setup ---

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set!');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// --- Socket.io ---

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://blackitab.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const socketService = require('./services/socketService');
socketService.initSocketService(io);
app.set('socketService', socketService);

// --- Middleware ---

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://blackitab.netlify.app'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database ---

connectDB();

// --- Auth Routes (inline) ---

app.get('/', (req, res) => res.send('API is running...'));
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.post('/api/register', authController.register);
app.post('/api/register-institute', authController.registerInstitute);
app.post('/api/login', authController.login);

// --- Theory Routes (inline) ---

app.get('/api/subjects', theoryController.getSubjects);
app.get('/api/subjects/:subjectId/topics', theoryController.getTopicsBySubject);
app.get('/api/topics/:id/full', theoryController.getTopicFullContent);

// --- Mounted Route Modules ---

app.use('/api/progress', progressRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-questions', aiQuestionRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/contests', contestRoutes);

// --- GET /api/me — Current User (protected) ---

app.get('/api/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Populate institute info if user belongs to one
    let instituteInfo = null;
    const isPrivileged = ['institute', 'hod'].includes(user.role);

    if (user.instituteId) {
      const Institute = require('./models/Institute');
      const inst = await Institute.findById(user.instituteId).select('name instituteCode description bannerImage');
      if (inst) {
        instituteInfo = { 
          _id: inst._id, 
          name: inst.name, 
          instituteCode: isPrivileged ? inst.instituteCode : undefined, 
          description: inst.description, 
          bannerImage: inst.bannerImage 
        };
      }
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        instituteId: user.instituteId,
        institute: instituteInfo,
        bio: user.bio,
        profileImage: user.profileImage,
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        subscriberCount: user.subscriberCount || 0
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// --- Start Server ---

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`MongoDB connection: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab'}`);
  
  // Start background algorithmic jobs
  startCronJobs();
});
