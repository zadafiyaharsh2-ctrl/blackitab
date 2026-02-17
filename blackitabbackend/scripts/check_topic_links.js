const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/full_data_of_topics');
require('dotenv').config();

const checkTopicLinks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Get all topics
        const topics = await Topic.find();
        console.log(`Found ${topics.length} topics in 'topics' collection\n`);

        // Get all full topic data
        const fullData = await FullTopicData.find();
        console.log(`Found ${fullData.length} entries in 'full_data_of_topics' collection\n`);

        console.log('='.repeat(80));
        console.log('CHECKING TOPIC LINKS:');
        console.log('='.repeat(80));

        let matchedCount = 0;
        let unmatchedCount = 0;

        for (const topic of topics) {
            const linkedData = await FullTopicData.findOne({ topicId: topic._id });

            if (linkedData) {
                console.log(`✓ MATCHED: "${topic.name}"`);
                console.log(`  Topic ID: ${topic._id}`);
                console.log(`  Has full content: YES\n`);
                matchedCount++;
            } else {
                console.log(`✗ UNMATCHED: "${topic.name}"`);
                console.log(`  Topic ID: ${topic._id}`);
                console.log(`  Has full content: NO\n`);
                unmatchedCount++;
            }
        }

        console.log('='.repeat(80));
        console.log(`SUMMARY:`);
        console.log(`  Matched: ${matchedCount}`);
        console.log(`  Unmatched: ${unmatchedCount}`);
        console.log('='.repeat(80));

        // Check for orphaned full_data entries
        console.log('\nCHECKING FOR ORPHANED FULL DATA:');
        console.log('='.repeat(80));

        let orphanedCount = 0;
        for (const data of fullData) {
            const topic = await Topic.findById(data.topicId);
            if (!topic) {
                console.log(`✗ ORPHANED: "${data.title}"`);
                console.log(`  Full Data ID: ${data._id}`);
                console.log(`  Points to Topic ID: ${data.topicId} (NOT FOUND)\n`);
                orphanedCount++;
            }
        }

        if (orphanedCount === 0) {
            console.log('✓ No orphaned full data entries found\n');
        } else {
            console.log(`Found ${orphanedCount} orphaned entries\n`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected');
    }
};

checkTopicLinks();
