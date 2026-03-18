const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Exam title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true,
        index: true
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    questionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamQuestion'
    }],
    scheduledAt: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'ongoing', 'completed'],
        default: 'draft'
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

examSchema.index({ teacherId: 1, status: 1 });
examSchema.index({ batchId: 1, scheduledAt: 1 });

module.exports = mongoose.model('Exam', examSchema);
