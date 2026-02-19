const mongoose = require('mongoose');
const FullTopicData = require('./models/full_data_of_topics');
require('dotenv').config();

const clearFullData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        // Count before deletion
        const countBefore = await FullTopicData.countDocuments();
        console.log(`Full data entries BEFORE deletion: ${countBefore}`);

        // Delete all
        const result = await FullTopicData.deleteMany({});
        console.log(`Deleted ${result.deletedCount} entries`);

        // Count after deletion
        const countAfter = await FullTopicData.countDocuments();
        console.log(`Full data entries AFTER deletion: ${countAfter}`);

        console.log('\n✓ Successfully cleared full_data_of_topics collection');
        console.log('Now run: node seed_dbms.js');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

clearFullData();
