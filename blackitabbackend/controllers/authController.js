const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/emailService');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            if (!existingUser.isVerified) {
                // User exists but verification failed/timed out previously.
                // Resend OTP instead of blocking.
                const otp = generateOTP();
                existingUser.otp = otp;
                existingUser.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

                // Update basic details in case they corrected a typo
                existingUser.name = name;
                existingUser.password = password; // Will be hashed by pre-save hook

                await existingUser.save();

                console.log(`Resending OTP to unverified user: ${email}`);
                const emailSent = await sendOTP(existingUser.email, otp);

                return res.status(200).json({
                    success: true,
                    message: 'Account exists but was not verified. New OTP sent!',
                    email: existingUser.email
                });
            }
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        console.log('Generated OTP:', otp);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            otp,
            otpExpires,
            isVerified: false
        });

        await newUser.save();

        const emailSent = await sendOTP(newUser.email, otp);
        if (!emailSent) {
            console.log(`Failed to send email. OTP for ${newUser.email}: ${otp}`);
        }

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

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // OTP valid
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('OTP Verification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate OTP
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const emailSent = await sendOTP(user.email, otp);
        if (!emailSent) {
            console.log(`Failed to send email. OTP for ${user.email}: ${otp}`);
        }

        res.json({
            success: true,
            message: 'OTP sent to your email',
            email: user.email,
            requireOtp: true
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
