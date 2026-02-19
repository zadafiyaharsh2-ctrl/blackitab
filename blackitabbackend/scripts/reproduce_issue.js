const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User'); // Direct DB access for verification
const FollowerList = require('./models/FollowerList');
const FollowingList = require('./models/FollowingList');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testFlow() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Clean up test users
        await User.deleteMany({ email: { $in: ['userA@test.com', 'userB@test.com'] } });
        await FollowerList.deleteMany({});
        await FollowingList.deleteMany({});

        // 1. Create User A and User B
        console.log('Creating users...');
        const userA = await User.create({ name: 'User A', email: 'userA@test.com', password: 'password', isVerified: true });
        const userB = await User.create({ name: 'User B', email: 'userB@test.com', password: 'password', isVerified: true });

        // Generate Tokens (Mocking login or using a helping function if available, but simplest is to just mock the request headers if we could, 
        // but we need to go through the API middleware which verifies JWT.
        // Actually, let's just use the Controller logic DIRECTLY to test the logic unit-style, 
        // OR login nicely. Login is better integration test.

        console.log('Logging in A...');
        await axios.post(`${API_URL}/login`, { email: 'userA@test.com', password: 'password' });
        // Retrieve OTP from DB
        const userAFetch = await User.findOne({ email: 'userA@test.com' });
        const otpA = userAFetch.otp;
        console.log('Verifying A...', otpA);
        const verifyA = await axios.post(`${API_URL}/verify-otp`, { email: 'userA@test.com', otp: otpA });
        const tokenA = verifyA.data.token;

        console.log('Logging in B...');
        await axios.post(`${API_URL}/login`, { email: 'userB@test.com', password: 'password' });
        const userBFetch = await User.findOne({ email: 'userB@test.com' });
        const otpB = userBFetch.otp;
        const verifyB = await axios.post(`${API_URL}/verify-otp`, { email: 'userB@test.com', otp: otpB });
        const tokenB = verifyB.data.token;

        if (!tokenA || !tokenB) throw new Error('Failed to get tokens');

        // 2. User A follows User B
        console.log('A follows B...');
        await axios.post(`${API_URL}/social/follow/${userB._id}`, {}, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });

        // 3. Check B's Follower Count (Should be 0)
        let bCheck = await User.findById(userB._id);
        console.log(`B's Follower Count (Pre-Accept): ${bCheck.followerCount} (Expected: 0)`);

        let followRequest = await FollowerList.findOne({ userId: userB._id, followerId: userA._id });
        console.log(`Request Status: ${followRequest.status} (Expected: pending)`);

        // 4. B Accepts A
        console.log('B accepts A...');
        await axios.post(`${API_URL}/social/accept-follow/${userA._id}`, {}, {
            headers: { Authorization: `Bearer ${tokenB}` }
        });

        // 5. Check Counts again
        bCheck = await User.findById(userB._id);
        console.log(`B's Follower Count (Post-Accept): ${bCheck.followerCount} (Expected: 1)`);
        if (bCheck.followerCount !== 1) throw new Error(`Follower Count Mismatch: Got ${bCheck.followerCount}`);

        let aCheck = await User.findById(userA._id);
        console.log(`A's Following Count (Post-Accept): ${aCheck.followingCount} (Expected: 1)`);
        if (aCheck.followingCount !== 1) throw new Error(`Following Count Mismatch: Got ${aCheck.followingCount}`);

        console.log('Test PASSED.');
        process.exit(0);

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) console.error(error.response.data);
        process.exit(1);
    }
}

testFlow();
