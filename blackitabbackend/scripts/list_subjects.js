/**
 * ============================================================================
 * LIST ALL SUBJECTS IN DATABASE
 * ============================================================================
 * 
 * This script lists all subjects currently in the subjects collection.
 * 
 * Usage: node list_subjects.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');

const listSubjects = async () => {
    try {
        console.log('============================================================');
        console.log('📚 LISTING ALL SUBJECTS');
        console.log('============================================================\n');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const subjects = await Subject.find({}).sort({ createdAt: 1 });

        console.log(`Found ${subjects.length} subject(s):\n`);
        subjects.forEach((subject, index) => {
            console.log(`${index + 1}. ${subject.name}`);
            console.log(`   ID: ${subject._id}`);
            console.log(`   Description: ${subject.description || 'No description'}`);
            console.log(`   Created: ${subject.createdAt.toLocaleString()}\n`);
        });

        console.log('============================================================\n');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from database\n');
    }
};

listSubjects();
