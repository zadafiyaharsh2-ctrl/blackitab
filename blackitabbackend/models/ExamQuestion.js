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
    createdAt: {
        type: Date,
        default: Date.now,

    }
});

examQuestionSchema.index({ exam: 1, subject: 1 });

module.exports = mongoose.model('ExamQuestion', examQuestionSchema);