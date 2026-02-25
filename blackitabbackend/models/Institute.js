const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institute name is required'],
    trim: true
  },
  instituteCode: {
    type: String,
    required: [true, 'Institute code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  adminEmails: [{
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Institute', instituteSchema);
