const mongoose = require('mongoose');

const problemProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['completed', 'attempted'],
        default: 'attempted'
    },
    completedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure one progress record per user per problem
problemProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('ProblemProgress', problemProgressSchema);
