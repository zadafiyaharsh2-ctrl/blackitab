/**
 * ============================================================================
 * AUTHENTICATION CONTROLLER (authController.js)
 * ============================================================================
 * 
 * This controller handles all user authentication logic:
 * 1. User Registration (Sign up)
 * 2. Login (Sign in)
 * 3. Email Verification (OTP)
 * 
 * It interacts with:
 * - User Model: To create and query users
 * - Email Service: To send OTPs
 * - JWT: To issue secure access tokens
 */

// Import required models and libraries
const User = require('../models/User');              // User database model
const jwt = require('jsonwebtoken');                 // Library to generate JWT tokens
const { sendOTP } = require('../utils/emailService'); // Our custom email service
const crypto = require('crypto');                    // Native Node.js crypto library (not used directly here but useful)

// Load JWT Secret from .env or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Helper Function: generateOTP
 * Generates a 6-digit random number as a string.
 * Example output: "123456"
 */
const generateOTP = () => {
    // Math.random() gives 0 to 1
    // * 900000 gives 0 to 900000
    // + 100000 gives 100000 to 999999 (always 6 digits)
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * REGISTER USER
 * POST /api/register
 * 
 * Steps:
 * 1. Validate input (email, password, name)
 * 2. Check if user already exists
 * 3. Generate verification OTP
 * 4. Create new user in DB (unverified)
 * 5. Send OTP via email
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

        // Generate OTP for email verification
        const otp = generateOTP();
        // Set expiry to 10 minutes from now (Date.now() + ms)
        const otpExpires = Date.now() + 10 * 60 * 1000;

        console.log('Generated OTP:', otp); // Log for debugging

        // Create new User instance
        // Note: Password will be automatically hashed by User model pre-save hook
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            otp,
            otpExpires,
            isVerified: false // User starts as unverified
        });

        // Save user to MongoDB
        await newUser.save();

        // Send OTP email asynchronously
        // We await this to ensure email service is working, though some systems might fire-and-forget
        const emailSent = await sendOTP(newUser.email, otp);
        if (!emailSent) {
            console.log(`Failed to send email. OTP for ${newUser.email}: ${otp}`);
            // Note: We still succeed registration even if email fails, 
            // so user can potentially resend OTP or developer can see it in logs
        }

        // Return success response linked to client
        res.status(201).json({
            success: true,
            message: 'User registered. Please check your email for OTP.',
            email: newUser.email
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * VERIFY OTP
 * POST /api/verify-otp
 * 
 * Steps:
 * 1. Validate input
 * 2. Find user
 * 3. Check if OTP matches and is not expired
 * 4. Mark user as verified
 * 5. Generate and return JWT token
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validate OTP
        // Check 1: Does OTP string match?
        // Check 2: Is Current Time < Expiry Time?
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // OTP is valid - Verify User
        user.isVerified = true;
        user.otp = undefined;       // Clear OTP
        user.otpExpires = undefined; // Clear Expiry
        await user.save();

        // Generate JWT Token
        // This token will be sent in headers for future authenticated requests
        const token = jwt.sign(
            { userId: user._id, email: user.email }, // Payload
            JWT_SECRET,                              // Secret Key
            { expiresIn: '24h' }                     // Token lifetime (24 hours)
        );

        // Send Clean Response
        res.json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('OTP Verification error:', error);
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
 * 4. Generate NEW OTP (Two-Factor Auth flow)
 * 5. Send OTP
 * NOTE: This system uses OTP for EVERY login (MFA-style) instead of instant token
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

        // CHECK VERIFICATION STATUS
        // If user is already verified, skipping OTP and logging in directly
        if (user.isVerified) {
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
        }

        // IF NOT VERIFIED -> Send OTP to verify account
        // Generate New OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Send OTP
        const emailSent = await sendOTP(user.email, otp);
        if (!emailSent) {
            console.log(`Failed to send email. OTP for ${user.email}: ${otp}`);
        }

        // Return success, requesting OTP
        res.json({
            success: true,
            message: 'Account not verified. OTP sent to your email',
            email: user.email,
            requireOtp: true // Flag to tell frontend to show OTP input
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
