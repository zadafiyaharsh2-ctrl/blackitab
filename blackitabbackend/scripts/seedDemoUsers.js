/**
 * Seed Demo Users — creates one user per role + one system admin
 * Run: node scripts/seedDemoUsers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Institute = require('../models/Institute');
const SystemAdmin = require('../models/SystemAdmin');

const DEMO_INSTITUTE = {
  name: 'PICT, Pune',
  instituteCode: 'PICT2024',
  subscriptionPlan: 'premium',
  adminEmails: ['institute@blackitab.demo']
};

const DEMO_USERS = [
  { name: 'Demo Student',      email: 'student@blackitab.demo',   password: 'demo1234', role: 'student' },
  { name: 'Demo Teacher',      email: 'teacher@blackitab.demo',   password: 'demo1234', role: 'teacher' },
  { name: 'Demo HOD',          email: 'hod@blackitab.demo',       password: 'demo1234', role: 'hod' },
  { name: 'Demo Institute Admin', email: 'institute@blackitab.demo', password: 'demo1234', role: 'institute_admin' },
];

const DEMO_ADMIN = {
  username: 'admin',
  password: 'admin1234',
  permissions: ['manage_users', 'manage_institutes', 'override_content', 'view_reports', 'super_admin']
};

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    // 1. Create Institute
    let institute = await Institute.findOne({ instituteCode: DEMO_INSTITUTE.instituteCode });
    if (!institute) {
      institute = await Institute.create(DEMO_INSTITUTE);
      console.log('✅ Created institute:', institute.name, `(${institute.instituteCode})`);
    } else {
      console.log('⏭️  Institute already exists:', institute.name);
    }

    // 2. Create Users
    for (const userData of DEMO_USERS) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⏭️  User already exists: ${userData.email} (${existing.role})`);
        continue;
      }
      const user = await User.create({
        ...userData,
        instituteId: institute._id,
        isVerified: true,
        streak: Math.floor(Math.random() * 30),
        points: Math.floor(Math.random() * 5000),
      });
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    // 3. Create System Admin
    const existingAdmin = await SystemAdmin.findOne({ username: DEMO_ADMIN.username });
    if (!existingAdmin) {
      await SystemAdmin.create(DEMO_ADMIN);
      console.log(`✅ Created system admin: ${DEMO_ADMIN.username}`);
    } else {
      console.log(`⏭️  System admin already exists: ${DEMO_ADMIN.username}`);
    }

    console.log('\n=== Demo Credentials ===');
    console.log('Student:        student@blackitab.demo / demo1234');
    console.log('Teacher:        teacher@blackitab.demo / demo1234');
    console.log('HOD:            hod@blackitab.demo / demo1234');
    console.log('Institute Admin: institute@blackitab.demo / demo1234');
    console.log('System Admin:   admin / admin1234  (use /admin/login)');
    console.log('========================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
