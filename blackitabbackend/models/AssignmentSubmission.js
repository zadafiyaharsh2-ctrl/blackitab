const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
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
        isCorrect: Boolean
    }],
    content: {
        type: String,
        default: ''
    },
    links: [{
        type: String,
        trim: true
    }],
    files: [{
        type: String,
        trim: true
    }],
    score: {
        type: Number,
        default: 0
    },
    teacherRemarks: {
        type: String,
        trim: true,
        default: ''
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    gradedAt: {
        type: Date,
        default: null
    }
});

// One submission per student per assignment
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
