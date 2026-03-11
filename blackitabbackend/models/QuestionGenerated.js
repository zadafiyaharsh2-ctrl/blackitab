const mongoose = require('mongoose');

const questionGeneratedSchema = new mongoose.Schema({
    exam: {
        type: String,
        required: true,
        enum: ['jee', 'neet', 'upsc', 'gate', 'cat'],
        index: true
    },
    subject: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true
    },
    options: [
        {
            type: String,
            required: true
        }
    ],
    correctAnswer: {
        type: Number,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    explanation: {
        type: String,
        default: 'No explanation available'
    },
    isAiGenerated: {
        type: Boolean,
        default: false
    },
    designatedFor: [{
        type: String,
        enum: ['digital', 'paper'],
        default: ['digital']
    }],
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    },
    tags: [{
        type: String
    }],
    // Attribution & Scoping
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        default: null
    },
    visibility: {
        type: String,
        enum: ['private', 'institute', 'public'],
        default: 'public',
        index: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    // Approval Workflow
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    approvalNote: {
        type: String,
        default: ''
    },
    // Sent to Problems Tab — when true, a copy exists in ExamQuestion
    isProblem: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

questionGeneratedSchema.index({ exam: 1, subject: 1 });
questionGeneratedSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('QuestionGenerated', questionGeneratedSchema);
