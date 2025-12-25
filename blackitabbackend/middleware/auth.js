/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================================================
 * 
 * This middleware verifies JWT tokens and authenticates users.
 * It extracts the user ID from the token and attaches the user object to req.user
 * 
 * Used to protect routes that require authentication.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        // Header format: "Bearer <token>"
        // Extract token from Authorization header or Query param
        // Header format: "Bearer <token>"
        let token = req.headers.authorization?.split(' ')[1];

        // Fallback to query param (useful for direct file downloads/images)
        if (!token && req.query.token) {
            token = req.query.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please log in.'
            });
        }

        // Verify and decode the JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please log in again.'
            });
        }

        // Find user in database
        const user = await User.findById(decoded.userId).select('-password');

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.'
            });
        }

        // Attach user to request object
        // Now route handlers can access req.user
        req.user = user;

        // Call next middleware/route handler
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

module.exports = authMiddleware;
