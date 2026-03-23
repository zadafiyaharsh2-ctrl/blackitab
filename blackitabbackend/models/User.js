const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: false,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  googleId: {
    type: String,
    sparse: true,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: true
  },

  // Gamification
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  points: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },

  // Social metrics
  followerCount: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },

  // Privacy
  isPrivate: { type: Boolean, default: false },

  // Anti-spam cooldown (set by userRateLimit middleware)
  restrictedUntil: { type: Date, default: null },

  // Profile
  bio: {
    type: String,
    maxLength: [160, 'Bio cannot exceed 160 characters'],
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },

  // --- HIERARCHY & ROLES ---
  role: {
    type: String,
    enum: ['student', 'teacher', 'hod', 'institute'],
    default: 'student',
    index: true
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    default: null,
    index: true
  },
  instituteCode: {
    type: String,
    default: '',
    uppercase: true,
    trim: true
  },
  batchYear: { type: String },
  division: { type: String },
  reportsToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  departments: [{
    type: String,
    trim: true
  }],
  domainRatings: {
    type: Map,
    of: Number,
    default: {}
  },
  domainLastAttemptedAt: {
    type: Map,
    of: Date,
    default: {}
  },

  // --- TEACHER-SPECIFIC FIELDS ---
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  specialization: {
    type: String,
    trim: true,
    default: ''
  },
  teacherSince: {
    type: Date,
    default: null
  },
  teacherRating: {
    score: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },

  // --- MASSIVE SCALE METRICS ---
  globalRank: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  rating: { type: Number, default: 0 }, // Percentile rating (0-100)

  // --- MODERATION ---
  isBanned: { type: Boolean, default: false }
}, { strict: true });

// Hash password before saving (skip for OAuth users with no password)
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Strip password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
