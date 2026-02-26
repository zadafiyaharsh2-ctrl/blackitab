const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Contest title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date,
        required: true,
        index: true
    },
    endTime: {
        type: Date,
        required: true,
        index: true
    },
    difficultyLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Intermediate'
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamQuestion'
    }],
    isActive: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contest', contestSchema);
