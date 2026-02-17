const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testSocial() {
    try {
        console.log('1. Logging in...');
        // Use a test account or create one if needed using register
        // For now assuming a user exists, if not we register one
        let email = 'test_verify@example.com';
        let password = 'password123';
        let token;

        // Try login
        try {
            await axios.post(`${API_URL}/login`, { email, password });
            // Login returns partial success with OTP required usually
            // But for this test, we might struggle with OTP flow unless we cheat or register fresh.
            // Let's Register instead to get a fresh flow?
            // Actually, in dev environment, we can check logs for OTP?
            // Hard to automate OTP reading from logs.
        } catch (e) {
            // Ignoring login fail
        }

        // Register new user to trigger flow?
        const rand = Math.floor(Math.random() * 10000);
        email = `user${rand}@example.com`;
        console.log(`Registering ${email}...`);

        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'TestUser',
            email,
            password
        });

        console.log('Registration success:', regRes.data.success);

        // We need to verify OTP to get token.
        // In Dev mode, we can try to find OTP? 
        // We can't easily see the OTP log from here.

        // Alternative: Use a known token? No.

        console.log('Cannot fully automate without OTP access. Manual check required.');

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

testSocial();
