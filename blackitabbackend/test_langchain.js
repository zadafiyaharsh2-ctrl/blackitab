
const axios = require('axios');

const LANGCHAIN_API_URL = 'http://localhost:8000/query';

async function testConnection() {
    console.log(`Testing connection to ${LANGCHAIN_API_URL}...`);
    try {
        const response = await axios.post(LANGCHAIN_API_URL, {
            query: "Hello, are you there?",
            top_k: 1
        }, { timeout: 5000 });
        
        console.log('Success! Response:', response.data);
    } catch (error) {
        console.log('Error connecting to LangChain service:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else if (error.request) {
            console.log('No response received (Service might be down or blocked).');
        } else {
            console.log('Error message:', error.message);
        }
    }
}

testConnection();
