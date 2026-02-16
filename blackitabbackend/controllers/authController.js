/**
 * ============================================================================
 * AUTHENTICATION CONTROLLER (authController.js)
 * ============================================================================
 * 
 * This controller handles all user authentication logic:
 * 1. User Registration (Sign up)
 * 2. Login (Sign in)
 * 
 * It interacts with:
 * - User Model: To create and query users
 * - JWT: To issue secure access tokens
 */

// Import required models and libraries
const User = require('../models/User');              // User database model
const jwt = require('jsonwebtoken');                 // Library to generate JWT tokens

// Load JWT Secret from .env or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * REGISTER USER
 * POST /api/register
 * 
 * Steps:
 * 1. Validate input (email, password, name)
 * 2. Check if user already exists
 * 3. Create new user in DB (verified)
 * 4. Generate JWT token and return it
 */
exports.register = async (req, res) => {
    try {
        // Extract data from request body
        const { email, password, name } = req.body;

        // Validation: Verify all fields are present
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check for existing user (case insensitive)
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create new User instance
        // Note: Password will be automatically hashed by User model pre-save hook
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            isVerified: true
        });

        // Save user to MongoDB
        await newUser.save();

        // Generate JWT Token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response with token
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                _id: newUser._id,
                email: newUser.email,
                name: newUser.name
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * LOGIN USER
 * POST /api/login
 * 
 * Steps:
 * 1. Validate inputs
 * 2. Find user
 * 3. Verify password (bcrypt compare)
 * 4. Generate JWT Token
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check Password with custom method on User model
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, email: user.email }, // Payload
            JWT_SECRET,                              // Secret Key
            { expiresIn: '24h' }                     // Token lifetime (24 hours)
        );

        return res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
