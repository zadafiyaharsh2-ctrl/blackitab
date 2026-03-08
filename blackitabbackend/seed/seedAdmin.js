/**
 * Seed script to create/reset the System Admin account.
 * Run:  node seed/seedAdmin.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const SystemAdmin = require('../models/SystemAdmin');

const ADMIN_USERNAME = 'blackitab_admin';
const ADMIN_PASSWORD = 'Admin@2026!';
const ADMIN_PERMISSIONS = ['manage_users', 'manage_institutes', 'override_content', 'view_reports', 'super_admin'];

const seed = async () => {
    await connectDB();

    // Remove existing admin with this username (to allow password reset)
    await SystemAdmin.deleteOne({ username: ADMIN_USERNAME });

    const admin = await SystemAdmin.create({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        permissions: ADMIN_PERMISSIONS
    });

    console.log('✅ System Admin seeded successfully!');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Permissions: ${ADMIN_PERMISSIONS.join(', ')}`);
    console.log(`   ID: ${admin._id}`);
    process.exit(0);
};

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
