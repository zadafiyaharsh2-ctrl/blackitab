const mongoose = require('mongoose');

const teacherFeedbackSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamQuestion'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxLength: 500,
        trim: true
    },
    feedbackType: {
        type: String,
        enum: ['quiz_end', 'realtime', 'general'],
        default: 'quiz_end'
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// One feedback per student-teacher-question combo
teacherFeedbackSchema.index({ studentId: 1, teacherId: 1, questionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('TeacherFeedback', teacherFeedbackSchema);
