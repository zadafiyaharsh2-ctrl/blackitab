const mongoose = require('mongoose');

const examQuestionSchema = new mongoose.Schema({
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
        enum: [
            'Easy', 'Medium', 'Hard'

        ],
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
    isPYQ: {
        type: Boolean,
        default: false
    },
    sourceYear: {
        type: Number
    },
    sourceShift: {
        type: String
    },
    tags: [{
        type: String
    }],
    customMeta: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Global Stats for Analytics
    totalAttempts: {
        type: Number,
        default: 0
    },
    successfulAttempts: {
        type: Number,
        default: 0
    },
    averageSolveTimeMs: {
        type: Number,
        default: 0
    },
    // Attribution & Scoping
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        default: null
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    visibility: {
        type: String,
        enum: ['private', 'institute', 'public'],
        default: 'public',
        index: true
    },
    // ── Approval Workflow ──
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
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SystemAdmin',
        default: null
    },
    // Sent to Problems Tab
    isProblem: {
        type: Boolean,
        default: false
    },
    // Link back to the source QuestionGenerated document
    sourceQuestionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionGenerated',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

examQuestionSchema.index({ exam: 1, subject: 1 });

module.exports = mongoose.model('ExamQuestion', examQuestionSchema);