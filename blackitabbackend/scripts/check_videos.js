const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab');

const Post = require('./models/Post');

async function checkVideos() {
    try {
        const allPosts = await Post.find({});
        console.log('Total posts:', allPosts.length);

        const videoPosts = await Post.find({ mediaType: 'video' });
        console.log('Video posts:', videoPosts.length);

        if (videoPosts.length > 0) {
            console.log('\nSample video post:');
            console.log(JSON.stringify(videoPosts[0], null, 2));
        } else {
            console.log('\nNo video posts found!');
            console.log('\nBreakdown by mediaType:');
            const byType = await Post.aggregate([
                { $group: { _id: '$mediaType', count: { $sum: 1 } } }
            ]);
            console.log(byType);

            console.log('\nBreakdown by contentType:');
            const byContent = await Post.aggregate([
                { $group: { _id: '$contentType', count: { $sum: 1 } } }
            ]);
            console.log(byContent);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
    }
}

checkVideos();
