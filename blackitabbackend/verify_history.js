const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/full_data_of_topics');
require('dotenv').config();

const verifyHistory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const subject = await Subject.findOne({ name: 'DBMS' });
        const historyTopic = await Topic.findOne({
            subjectId: subject._id,
            name: 'History of DBMS'
        });

        if (historyTopic) {
            const fullContent = await FullTopicData.findOne({ topicId: historyTopic._id });
            console.log('\n✅ Topic Found: History of DBMS');
            console.log(`📝 Content Blocks: ${fullContent ? fullContent.content.length : 0}`);

            if (fullContent && fullContent.content.length > 0) {
                console.log('\n📋 Content Structure:');
                fullContent.content.forEach((block, index) => {
                    const preview = block.text ? block.text.substring(0, 60) + '...' : '';
                    console.log(`   ${index + 1}. ${block.type}: ${preview}`);
                });
            }
        } else {
            console.log('❌ Topic not found');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
    }
};

verifyHistory();
