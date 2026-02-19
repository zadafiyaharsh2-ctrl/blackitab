/**
 * Verification script to check if "Relational Model & Codd Rules" content was added
 */

const mongoose = require('mongoose');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/full_data_of_topics');
require('dotenv').config();

const verifyRelationalModelContent = async () => {
    try {
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find the topic
        const topic = await Topic.findOne({ name: 'Relational Model & Codd Rules' });

        if (!topic) {
            console.log('❌ Topic "Relational Model & Codd Rules" not found!');
            return;
        }

        console.log('✅ Topic found:');
        console.log(`   ID: ${topic._id}`);
        console.log(`   Name: ${topic.name}\n`);

        // Find the full content
        const fullContent = await FullTopicData.findOne({ topicId: topic._id });

        if (!fullContent) {
            console.log('❌ Full content not found for this topic!');
            return;
        }

        console.log('✅ Full content found:');
        console.log(`   Title: ${fullContent.title}`);
        console.log(`   Content blocks: ${fullContent.content.length}`);
        console.log(`   Last updated: ${fullContent.lastUpdated}\n`);

        // Show first few content blocks
        console.log('📄 First 5 content blocks:');
        console.log('='.repeat(60));
        fullContent.content.slice(0, 5).forEach((block, index) => {
            console.log(`\n${index + 1}. Type: ${block.type}`);
            if (block.text) {
                console.log(`   Text: ${block.text.substring(0, 100)}${block.text.length > 100 ? '...' : ''}`);
            }
            if (block.items) {
                console.log(`   Items: ${block.items.length} items`);
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ VERIFICATION SUCCESSFUL!');
        console.log(`   The "Relational Model & Codd Rules" topic has ${fullContent.content.length} content blocks.\n`);

    } catch (error) {
        console.error('\n❌ ERROR:', error);
    } finally {
        console.log('🔌 Disconnecting from database...');
        mongoose.disconnect();
        console.log('✅ Disconnected\n');
    }
};

verifyRelationalModelContent();
