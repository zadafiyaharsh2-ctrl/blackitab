const mongoose = require('mongoose');

const theorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Theory title is required'],
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Theory', theorySchema);
