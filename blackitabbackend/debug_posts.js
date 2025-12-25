const mongoose = require('mongoose');
const Post = require('./models/Post');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const posts = await Post.find({}, 'title caption contentType mediaType mediaUrl');
        console.log("Total Posts:", posts.length);

        console.log("\n--- All Posts ---");
        posts.forEach(p => {
            console.log(`ID: ${p._id} | Type: ${p.contentType} | Media: ${p.mediaType} | Caption: ${p.caption?.substring(0, 20)}...`);
        });

        const videos = await Post.find({ contentType: 'post', mediaType: 'video' });
        console.log(`\n--- Videos Query (contentType='post', mediaType='video') found: ${videos.length} ---`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
