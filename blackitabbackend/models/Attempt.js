const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamQuestion',
    required: true,
    index: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  selectedOption: {
    type: Number
  },
  timeTakenSeconds: {
    type: Number
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
    index: true // Useful for activity heatmaps
  }
});

// Indexing for fast specific-question lookups
attemptSchema.index({ userId: 1, questionId: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
