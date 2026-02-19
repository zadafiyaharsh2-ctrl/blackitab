const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/full_data_of_topics');
require('dotenv').config();

const verifyTopicIds = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Get a few topics with content
        const topicsWithContent = await Topic.find({ name: { $in: ['Introduction of DBMS', 'History of DBMS', 'DBMS Architecture (1, 2, 3 level)'] } });

        console.log('Checking if topicId matches _id:\n');
        console.log('='.repeat(100));

        for (const topic of topicsWithContent) {
            console.log(`\nTopic: "${topic.name}"`);
            console.log(`  Topic._id:           ${topic._id}`);

            // Find corresponding full data
            const fullData = await FullTopicData.findOne({ topicId: topic._id });

            if (fullData) {
                console.log(`  FullData.topicId:    ${fullData.topicId}`);
                console.log(`  Match:               ${topic._id.toString() === fullData.topicId.toString() ? '✓ YES' : '✗ NO'}`);
                console.log(`  Content blocks:      ${fullData.content?.length || 0}`);
            } else {
                console.log(`  FullData.topicId:    NOT FOUND`);
                console.log(`  Match:               ✗ NO FULL DATA EXISTS`);
            }
        }

        console.log('\n' + '='.repeat(100));

        // Also check if there are any orphaned full_data entries
        console.log('\nChecking for orphaned full_data entries...\n');
        const allFullData = await FullTopicData.find().limit(5);

        for (const data of allFullData) {
            const topic = await Topic.findById(data.topicId);
            console.log(`FullData: "${data.title}"`);
            console.log(`  topicId: ${data.topicId}`);
            console.log(`  Topic exists: ${topic ? '✓ YES (' + topic.name + ')' : '✗ NO (ORPHANED)'}`);
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected');
    }
};

verifyTopicIds();
