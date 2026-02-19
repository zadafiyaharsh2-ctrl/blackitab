const mongoose = require('mongoose');

const questionItemSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }, // index of correct option (0-3)
    explanation: { type: String, default: '' }
}, { _id: false });

const generatedQuestionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    questions: [questionItemSchema],
    questionCount: {
        type: Number,
        default: 5
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

generatedQuestionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('GeneratedQuestion', generatedQuestionSchema);
