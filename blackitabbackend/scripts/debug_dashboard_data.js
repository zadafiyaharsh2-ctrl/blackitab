const mongoose = require('mongoose');
require('dotenv').config();

const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const UserProgress = require('./models/UserProgress');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Error:', err);
        process.exit(1);
    }
};

const debugData = async () => {
    await connectDB();

    try {
        console.log('\n--- SUBJECTS ---');
        const subjects = await Subject.find();

        for (const subject of subjects) {
            console.log(`Subject: ${subject.name} (ID: ${subject._id})`);

            // Count topics
            const topicCount = await Topic.countDocuments({ subjectId: subject._id });
            console.log(`  Topic Count (DB): ${topicCount}`);

            // Check UserProgress
            const progressCount = await UserProgress.countDocuments({ subjectId: subject._id });
            console.log(`  UserProgress Count: ${progressCount}`);
        }

        console.log('\n--- TOPICS SAMPLE ---');
        const topics = await Topic.find().limit(5);
        topics.forEach(t => {
            console.log(`Topic: ${t.name}, SubjectId: ${t.subjectId}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

debugData();
