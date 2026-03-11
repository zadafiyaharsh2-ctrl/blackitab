const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set!');

const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from header or query param (query param for file downloads)
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found. Please log in again.' });
        }

        req.user = user;
        next();
    } catch (error) {

        res.status(500).json({ success: false, message: 'Authentication error' });
    }
};

module.exports = authMiddleware;
