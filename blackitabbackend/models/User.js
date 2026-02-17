/**
 * ============================================================================
 * USER MODEL (User.js)
 * ============================================================================
 * 
 * This model defines the structure (Schema) for User documents in MongoDB.
 * It handles:
 * 1. Data validation (email, password format)
 * 2. Password encryption (hashing) before saving
 * 3. Password comparison for login
 * 4. Cleaning output (hiding password)
 */

// Import Mongoose for database interaction
const mongoose = require('mongoose');

// Import bcryptjs for secure password hashing
// This library allows us to store passwords securely (never store plain text passwords!)
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * Defines the fields and validation rules for a User document
 */
const userSchema = new mongoose.Schema({
  // ========================================
  // USERNAME
  // ========================================
  name: {
    type: String,               // Field type matches Javascript String
    required: [true, 'Name is required'], // Field is mandatory, customized error message
    trim: true                  // Auto-remove whitespace from start/end
  },

  // ========================================
  // EMAIL ADDRESS
  // ========================================
  // Used for login and identification
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,               // Ensures no two users share the same email
    lowercase: true,            // Converts "User@Example.Com" to "user@example.com"
    trim: true,
    // Regular expression (Regex) to ensure valid email format
    // Simple breakdown: something, then @, then something, then dot, then something
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },

  // ========================================
  // PASSWORD
  // ========================================
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'], // Enforce minimum security length
    // Note: We don't use 'select: false' here because we need it for password comparison logic 
    // inside the controller, but we manually remove it in toJSON method below
  },

  // ========================================
  // TIMESTAMP
  // ========================================
  createdAt: {
    type: Date,
    default: Date.now           // Automatically set to current timestamp when user is created
  },

  // ========================================
  // OTP (ONE-TIME PASSWORD) FIELDS - REMOVED
  // ========================================
  isVerified: {
    type: Boolean,
    default: true               // Auto-verified since OTP is removed
  },

  // ========================================
  // GAMIFICATION METRICS
  // ========================================
  // Tracks user engagement and progress
  streak: {
    type: Number,
    default: 0                  // Current learning streak
  },
  lastActiveDate: {
    type: Date                  // Used to calculate streak continuity
  },
  points: {
    type: Number,
    default: 0                  // Total points earned
  },

  // ========================================
  // SOCIAL METRICS
  // ========================================
  followerCount: {
    type: Number,
    default: 0
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },

  // ========================================
  // PRIVACY SETTINGS
  // ========================================
  isPrivate: {
    type: Boolean,
    default: false
  },

  // ========================================
  // PROFILE DETAILS
  // ========================================
  bio: {
    type: String,
    maxLength: [160, 'Bio cannot exceed 160 characters'],
    default: ''
  },
  profileImage: {
    type: String, // URL or path to image
    default: ''
  }
});

/**
 * PRE-SAVE MIDDLEWARE (Hash Password)
 * This function runs AUTOMATICALLY before saving a user document to the database.
 * Usage: user.save() triggers this.
 */
userSchema.pre('save', async function (next) {
  // Check if password field was modified (e.g. creating new user or changing password)
  // If not modified (e.g. updating name only), skip hashing to avoid re-hashing the hash
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    // Salt is random data added to password before hashing to protect against rainbow table attacks
    // 10 is the salt rounds (cost factor) - higher is more secure but slower
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    // Replace the plain text password with the hashed version
    this.password = await bcrypt.hash(this.password, salt);

    // Proceed to save operation
    next();
  } catch (error) {
    // Pass error to Mongoose error handler
    next(error);
  }
});

/**
 * METHOD: comparePassword
 * Checks if a plain text password matches the hashed password stored in database.
 * 
 * @param {string} candidatePassword - The plain text password entered by user during login
 * @returns {Promise<boolean>} - True if match, False if not
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare handles the hashing of candidatePassword and checking against hash
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * METHOD: toJSON
 * Customized JSON serialization for User documents.
 * This runs whenever the user object is converted to JSON (e.g. in res.json(user))
 * 
 * Purpose: Ensure we NEVER return the password hash to the frontend.
 */
userSchema.methods.toJSON = function () {
  // Convert Mongoose document to a plain JavaScript object
  const userObject = this.toObject();

  // Delete the password field from the object
  delete userObject.password;

  // Return the cleaned object
  return userObject;
};

// Create and export the User model
// 'User' is the name of the model, Mongoose maps it to 'users' collection in DB
module.exports = mongoose.model('User', userSchema);
