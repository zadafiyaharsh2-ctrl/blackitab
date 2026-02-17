const mongoose = require('mongoose');
require('dotenv').config();

const checkDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const db = mongoose.connection.db;

        // Get sample from topics collection
        console.log('TOPICS COLLECTION (first 3):');
        console.log('='.repeat(80));
        const topics = await db.collection('topics').find().limit(3).toArray();
        topics.forEach(t => {
            console.log(`Name: ${t.name}`);
            console.log(`_id: ${t._id}`);
            console.log('');
        });

        // Get sample from full_data_of_topics collection
        console.log('\nFULL_DATA_OF_TOPICS COLLECTION (first 3):');
        console.log('='.repeat(80));
        const fullData = await db.collection('full_data_of_topics').find().limit(3).toArray();
        fullData.forEach(f => {
            console.log(`Title: ${f.title}`);
            console.log(`topicId: ${f.topicId}`);
            console.log(`Content blocks: ${f.content?.length || 0}`);
            console.log('');
        });

        // Now check if they match
        console.log('\nMATCHING CHECK:');
        console.log('='.repeat(80));
        for (const topic of topics) {
            const matchingFullData = fullData.find(f => f.topicId.toString() === topic._id.toString());
            console.log(`Topic: "${topic.name}"`);
            console.log(`  _id: ${topic._id}`);
            if (matchingFullData) {
                console.log(`  ✓ MATCH FOUND: topicId = ${matchingFullData.topicId}`);
            } else {
                console.log(`  ✗ NO MATCH in full_data_of_topics`);
            }
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

checkDatabase();
