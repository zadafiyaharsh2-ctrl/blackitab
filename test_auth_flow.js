const API_URL = 'http://localhost:5000/api';

async function testAuth() {
    const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
    };

    try {
        console.log('1. Attempting Registration...');
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        console.log('Registration Status:', regRes.status);
        console.log('Registration Response:', regData);

        if (regRes.status === 201) {
            console.log('\n2. Attempting Login...');
            const loginRes = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });
            const loginData = await loginRes.json();
            console.log('Login Status:', loginRes.status);
            console.log('Login Response:', loginData);

            if (loginData.token) {
                console.log('\nSUCCESS: Login returned token!');
            } else {
                console.log('\nFAILURE: Login did not return token.');
            }
        }

    } catch (error) {
        console.error('Auth Flow Failed:', error.message);
    }
}

testAuth();
