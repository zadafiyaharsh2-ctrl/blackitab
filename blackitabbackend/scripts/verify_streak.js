const mongoose = require('mongoose');
const User = require('./models/User');
const UserProgress = require('./models/UserProgress');
const { markTopicComplete } = require('./controllers/progressController');
require('dotenv').config();

// Mock request and response objects
const mockReq = (userId, body) => ({
    user: { _id: userId },
    body
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function verifyStreak() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab');
        console.log('Connected to MongoDB');

        // 1. Create a test user
        const testEmail = `streak_test_${Date.now()}@example.com`;
        const user = await User.create({
            name: 'Streak Test User',
            email: testEmail,
            password: 'password123',
            streak: 0
        });
        console.log(`Created test user: ${user.email}`);

        // 2. Simulate Day 1 Activity
        console.log('\n--- Simulating Day 1 ---');
        // Manually set lastActiveDate to null to simulate fresh start
        user.lastActiveDate = null;
        await user.save();

        let req = mockReq(user._id, { subjectId: '507f1f77bcf86cd799439011', topicId: '507f1f77bcf86cd799439012' });
        let res = mockRes();

        // We need to mock the require in the controller or just call the logic directly?
        // Since we modified the controller to require the model inside, it should work if we run this script in the backend folder.
        // However, the controller uses `req.user._id`.

        await markTopicComplete(req, res);

        const userDay1 = await User.findById(user._id);
        console.log(`Streak after Day 1: ${userDay1.streak} (Expected: 1)`);
        console.log(`Last Active: ${userDay1.lastActiveDate}`);

        // 3. Simulate Day 2 (Consecutive)
        console.log('\n--- Simulating Day 2 (Consecutive) ---');
        // Manually set lastActiveDate to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        userDay1.lastActiveDate = yesterday;
        await userDay1.save();

        req = mockReq(user._id, { subjectId: '507f1f77bcf86cd799439011', topicId: '507f1f77bcf86cd799439013' });
        res = mockRes();
        await markTopicComplete(req, res);

        const userDay2 = await User.findById(user._id);
        console.log(`Streak after Day 2: ${userDay2.streak} (Expected: 2)`);

        // 4. Simulate Day 4 (Broken Streak)
        console.log('\n--- Simulating Day 4 (Broken Streak) ---');
        // Manually set lastActiveDate to 2 days ago
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        userDay2.lastActiveDate = twoDaysAgo;
        await userDay2.save();

        req = mockReq(user._id, { subjectId: '507f1f77bcf86cd799439011', topicId: '507f1f77bcf86cd799439014' });
        res = mockRes();
        await markTopicComplete(req, res);

        const userDay4 = await User.findById(user._id);
        console.log(`Streak after Day 4: ${userDay4.streak} (Expected: 1)`);

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await UserProgress.deleteMany({ userId: user._id });
        console.log('\nTest user and progress cleaned up');

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyStreak();
