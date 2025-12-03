const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/full_data_of_topics');
require('dotenv').config();

const finalVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Get topics with content
        const topicsWithContent = ['Introduction of DBMS', 'History of DBMS', 'DBMS Architecture (1, 2, 3 level)', 'Introduction of ER Model'];

        console.log('FINAL VERIFICATION - Checking Topic ID Matching');
        console.log('='.repeat(100));
        console.log('');

        let matchCount = 0;
        let mismatchCount = 0;

        for (const topicName of topicsWithContent) {
            const topic = await Topic.findOne({ name: topicName });

            if (!topic) {
                console.log(`Topic "${topicName}" not found in database`);
                continue;
            }

            const fullData = await FullTopicData.findOne({ topicId: topic._id });

            console.log(`Topic: "${topicName}"`);
            console.log(`  Topic._id:        ${topic._id}`);

            if (fullData) {
                console.log(`  FullData.topicId: ${fullData.topicId}`);
                const match = topic._id.toString() === fullData.topicId.toString();
                console.log(`  Status:           ${match ? '✓ MATCH' : '✗ MISMATCH'}`);
                console.log(`  Content blocks:   ${fullData.content?.length || 0}`);

                if (match) {
                    matchCount++;
                } else {
                    mismatchCount++;
                }
            } else {
                console.log(`  FullData.topicId: NOT FOUND`);
                console.log(`  Status:           ✗ NO FULL DATA`);
                mismatchCount++;
            }
            console.log('');
        }

        console.log('='.repeat(100));
        console.log(`SUMMARY: ${matchCount} matched, ${mismatchCount} mismatched/missing`);
        console.log('='.repeat(100));

        if (matchCount > 0 && mismatchCount === 0) {
            console.log('\n✓✓✓ SUCCESS! All topic IDs are properly synchronized! ✓✓✓\n');
        } else if (matchCount > 0) {
            console.log('\n⚠ PARTIAL SUCCESS: Some topics matched, but some are missing full data\n');
        } else {
            console.log('\n✗✗✗ FAILURE: No topics are properly linked ✗✗✗\n');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

finalVerification();
