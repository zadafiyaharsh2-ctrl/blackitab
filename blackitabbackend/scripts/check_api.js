const axios = require('axios');

async function checkApi() {
    try {
        const res = await axios.get('http://localhost:5000/api/subjects');
        console.log(JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error(error.message);
    }
}

checkApi();
