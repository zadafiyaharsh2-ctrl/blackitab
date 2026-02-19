const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkUsers = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab';
        console.log('Connecting to MongoDB:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const emailsToCheck = ['zadafiyahash2@gmail.com', 'zadafiyaharsh2@gmail.com'];

        for (const email of emailsToCheck) {
            const user = await User.findOne({ email: email });
            if (user) {
                console.log(`FOUND User: ${email}`);
                console.log(`- ID: ${user._id}`);
                console.log(`- Name: ${user.name}`);
                console.log(`- Verified: ${user.isVerified}`);
            } else {
                console.log(`NOT FOUND: ${email}`);
            }
        }

        // List all users to see if there are any
        const allUsers = await User.find().select('email name');
        console.log('\nAll Users in DB:');
        allUsers.forEach(u => console.log(`- ${u.email} (${u.name})`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

checkUsers();
