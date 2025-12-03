const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/full_data_of_topics');
require('dotenv').config();

const verifyContent = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const subject = await Subject.findOne({ name: 'DBMS' });
        const introTopic = await Topic.findOne({
            subjectId: subject._id,
            name: 'Introduction of DBMS'
        });

        if (introTopic) {
            const fullContent = await FullTopicData.findOne({ topicId: introTopic._id });
            console.log('\n✅ Topic Found: Introduction of DBMS');
            console.log(`📝 Content Blocks: ${fullContent ? fullContent.content.length : 0}`);

            if (fullContent && fullContent.content.length > 0) {
                console.log('\n📋 Content Structure:');
                fullContent.content.forEach((block, index) => {
                    console.log(`   ${index + 1}. ${block.type}: ${block.text || block.items?.length + ' items' || ''}`);
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

verifyContent();
