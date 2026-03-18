const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ExamQuestion'
        },
        selectedOption: Number,
        isCorrect: Boolean,
        timeTakenMs: Number
    }],
    score: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// One result per student per exam
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
