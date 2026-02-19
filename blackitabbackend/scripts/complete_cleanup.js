const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/full_data_of_topics');
require('dotenv').config();

const completeCleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Step 1: Count everything
        console.log('STEP 1: Current Database State');
        console.log('='.repeat(80));
        const subjectCount = await Subject.countDocuments();
        const topicCount = await Topic.countDocuments();
        const fullDataCount = await FullTopicData.countDocuments();

        console.log(`Subjects: ${subjectCount}`);
        console.log(`Topics: ${topicCount}`);
        console.log(`Full Data: ${fullDataCount}\n`);

        // Step 2: Delete ALL topics and full data
        console.log('STEP 2: Deleting ALL Topics and Full Data');
        console.log('='.repeat(80));
        const deletedTopics = await Topic.deleteMany({});
        const deletedFullData = await FullTopicData.deleteMany({});

        console.log(`Deleted ${deletedTopics.deletedCount} topics`);
        console.log(`Deleted ${deletedFullData.deletedCount} full data entries\n`);

        // Step 3: Verify deletion
        console.log('STEP 3: Verifying Deletion');
        console.log('='.repeat(80));
        const remainingTopics = await Topic.countDocuments();
        const remainingFullData = await FullTopicData.countDocuments();

        console.log(`Remaining topics: ${remainingTopics}`);
        console.log(`Remaining full data: ${remainingFullData}`);

        if (remainingTopics === 0 && remainingFullData === 0) {
            console.log('✓ All data successfully cleared!\n');
            console.log('Now run: node seed_dbms.js');
        } else {
            console.log('✗ Warning: Some data still remains!\n');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
        console.log('\nDisconnected');
    }
};

completeCleanup();
