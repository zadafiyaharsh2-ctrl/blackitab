const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set!');

// POST /api/register — create account and return token immediately
exports.register = async (req, res) => {
    try {
        const { email, password, name, role, instituteCode, batchYear, division } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        let instituteId = null;
        if (instituteCode) {
            const Institute = require('../models/Institute');
            const institute = await Institute.findOne({ instituteCode: instituteCode.toUpperCase() });
            if (!institute) {
                return res.status(400).json({ success: false, message: 'Invalid Institute Code' });
            }
            instituteId = institute._id;
        }

        // Validate role if provided, otherwise default to 'student'
        const validRoles = ['student', 'teacher', 'hod', 'institute'];
        const assignedRole = validRoles.includes(role) ? role : 'student';

        // Institute admin validation: email must be in institute's adminEmails
        if (assignedRole === 'institute') {
            if (!instituteId) {
                return res.status(400).json({ success: false, message: 'Institute admin must provide a valid institute code' });
            }
            const Institute = require('../models/Institute');
            const institute = await Institute.findById(instituteId);
            if (!institute || !institute.adminEmails.includes(email.toLowerCase())) {
                return res.status(403).json({ success: false, message: 'Your email is not authorized as an institute admin. Contact your institute.' });
            }
        }

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: assignedRole,
            instituteId,
            batchYear,
            division
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: { 
                _id: newUser._id, 
                email: newUser.email, 
                name: newUser.name,
                role: newUser.role,
                instituteId: newUser.instituteId
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/register-institute — create institute and admin account
exports.registerInstitute = async (req, res) => {
    try {
        const { instituteName, instituteCode, adminEmail, adminName, adminPassword } = req.body;

        if (!instituteName || !instituteCode || !adminEmail || !adminName || !adminPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Admin email already exists' });
        }

        const Institute = require('../models/Institute');
        const existingInstitute = await Institute.findOne({ instituteCode: instituteCode.toUpperCase() });
        if (existingInstitute) {
            return res.status(400).json({ success: false, message: 'Institute code already exists. Please choose a unique code.' });
        }

        const newInstitute = new Institute({
            name: instituteName,
            instituteCode: instituteCode.toUpperCase(),
            adminEmails: [adminEmail.toLowerCase()]
        });
        await newInstitute.save();

        const newUser = new User({
            name: adminName,
            email: adminEmail.toLowerCase(),
            password: adminPassword,
            role: 'institute',
            instituteId: newInstitute._id
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Institute and admin account created successfully',
            token,
            user: { 
                _id: newUser._id, 
                email: newUser.email, 
                name: newUser.name,
                role: newUser.role,
                instituteId: newUser.instituteId
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/login — authenticate and return token
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

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { 
                _id: user._id, 
                email: user.email, 
                name: user.name,
                role: user.role,
                instituteId: user.instituteId 
            }
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
