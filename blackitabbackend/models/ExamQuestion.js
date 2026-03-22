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
    eloRating: {
        type: Number,
        default: 1000 // Elo baseline defaults to 1000, updated historically or individually over time.
    },
    explanation: {
        type: String,
        default: 'No explanation available'
    },
    isAiGenerated: {
        type: Boolean,
        default: false
    },
    format: {
        type: String,
        enum: ['Paper', 'Digital'],
        required: true,
        default: 'Digital'
    },
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
    sourceDate: {
        type: Date
    },
    sourcePart: {
        type: String
    },
    sourceExamName: {
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
        default: null,
        index: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        index: true,
        default: null
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        index: true,
        required: function() { return !this.isGlobal; }
    },
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft',
        index: true
    },
    isGlobal: {
        type: Boolean,
        default: false,
        index: true
    },
    isModerated: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isProblem: {
        type: Boolean,
        default: false,
        index: true
    },


    createdAt: {
        type: Date,
        default: Date.now
    }
});

examQuestionSchema.index({ exam: 1, subject: 1 });
examQuestionSchema.index({ instituteId: 1, departmentId: 1, status: 1 });

module.exports = mongoose.model('ExamQuestion', examQuestionSchema);