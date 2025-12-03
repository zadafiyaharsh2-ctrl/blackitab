/**
 * ============================================================================
 * ADD SQL SUBJECT TO DATABASE
 * ============================================================================
 * 
 * This script adds the SQL subject to the subjects collection in MongoDB.
 * Run this script once to create the SQL subject entry.
 * 
 * Usage: node add_sql_subject.js
 */

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const mongoose = require('mongoose');
const Subject = require('./models/Subject');

/**
 * Main function to add SQL subject
 */
const addSQLSubject = async () => {
    try {
        console.log('============================================================');
        console.log('🚀 ADDING SQL SUBJECT TO DATABASE');
        console.log('============================================================\n');

        // ========================================
        // CONNECT TO DATABASE
        // ========================================
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // ========================================
        // CHECK AND CREATE SQL SUBJECT
        // ========================================
        console.log('📚 Checking for SQL subject...');
        let subject = await Subject.findOne({ name: 'SQL' });

        if (!subject) {
            // Subject doesn't exist, create new one
            subject = new Subject({
                name: 'SQL',
                description: 'Structured Query Language - Complete SQL tutorial and reference'
            });
            await subject.save();
            console.log('✅ Created Subject: SQL');
            console.log(`   Subject ID: ${subject._id}`);
        } else {
            // Subject already exists
            console.log('✅ Subject SQL already exists');
            console.log(`   Subject ID: ${subject._id}`);
        }

        console.log('\n============================================================');
        console.log('✅ SQL SUBJECT ADDED SUCCESSFULLY!');
        console.log('============================================================\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
    } finally {
        // ========================================
        // DISCONNECT FROM DATABASE
        // ========================================
        console.log('🔌 Disconnecting from database...');
        await mongoose.disconnect();
        console.log('✅ Disconnected\n');
    }
};

// Execute the function
addSQLSubject();
