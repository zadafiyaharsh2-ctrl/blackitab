const axios = require('axios');

async function checkVideos() {
    try {
        const response = await axios.get('http://localhost:5000/api/posts/videos');
        console.log('Status:', response.status);
        console.log('Success:', response.data.success);
        console.log('Data Count:', response.data.data ? response.data.data.length : 'N/A');
        if (response.data.data && response.data.data.length > 0) {
            console.log('Sample Video:', JSON.stringify(response.data.data[0], null, 2));
        } else {
            console.log('No videos found.');
        }
    } catch (error) {
        console.error('Error fetching videos:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

checkVideos();
