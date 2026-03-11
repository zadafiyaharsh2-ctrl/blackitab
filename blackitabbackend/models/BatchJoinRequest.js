const mongoose = require('mongoose');

const batchJoinRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// A student can only have one pending request per class
batchJoinRequestSchema.index({ studentId: 1, batchId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
batchJoinRequestSchema.index({ teacherId: 1, status: 1 }); // For teacher to fetch pending requests quickly

module.exports = mongoose.model('BatchJoinRequest', batchJoinRequestSchema);
