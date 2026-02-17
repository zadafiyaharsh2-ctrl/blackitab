const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const getOtp = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find().sort({ createdAt: -1 }).limit(5);
        console.log('\n--- RECENT USERS ---');
        users.forEach(u => {
            console.log(`Email: ${u.email} | OTP: ${u.otp} | Verified: ${u.isVerified}`);
        });
        console.log('--------------------\n');
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

getOtp();
