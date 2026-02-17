const axios = require('axios');

const testAPI = async () => {
    try {
        // 1. Get subjects
        console.log('1. Fetching subjects...');
        const subjectsRes = await axios.get('http://localhost:5000/api/subjects');
        const dbms = subjectsRes.data.data.find(s => s.name === 'DBMS');
        console.log(`   Found DBMS subject: ${dbms._id}\n`);

        // 2. Get topics for DBMS
        console.log('2. Fetching topics for DBMS...');
        const topicsRes = await axios.get(`http://localhost:5000/api/subjects/${dbms._id}/topics`);
        const topics = topicsRes.data.data;
        console.log(`   Found ${topics.length} topics\n`);

        // 3. Test fetching full content for first 3 topics
        console.log('3. Testing full content fetch for first 3 topics:');
        console.log('='.repeat(80));

        for (let i = 0; i < Math.min(3, topics.length); i++) {
            const topic = topics[i];
            try {
                const fullContentRes = await axios.get(`http://localhost:5000/api/topics/${topic._id}/full`);

                if (fullContentRes.data.success) {
                    console.log(`✓ SUCCESS: "${topic.name}"`);
                    console.log(`  Topic ID: ${topic._id}`);
                    console.log(`  Content blocks: ${fullContentRes.data.data.content?.length || 0}`);
                } else {
                    console.log(`✗ FAILED: "${topic.name}"`);
                    console.log(`  Response: ${JSON.stringify(fullContentRes.data)}`);
                }
            } catch (error) {
                console.log(`✗ ERROR: "${topic.name}"`);
                console.log(`  Status: ${error.response?.status}`);
                console.log(`  Message: ${error.response?.data?.message || error.message}`);
            }
            console.log('');
        }

        console.log('='.repeat(80));
        console.log('Test complete!');

    } catch (error) {
        console.error('Error:', error.message);
    }
};

testAPI();
