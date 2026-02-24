const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  sourceUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  connectionType: {
    type: String,
    enum: ['follow', 'subscribe'],
    default: 'follow',
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'accepted'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate connections (e.g., A cannot follow B twice)
connectionSchema.index({ sourceUserId: 1, targetUserId: 1, connectionType: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
