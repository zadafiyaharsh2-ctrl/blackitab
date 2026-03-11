const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Batch name is required'],
        trim: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    teacherIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    studentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    year: {
        type: String,
        trim: true
    },
    section: {
        type: String,
        trim: true,
        uppercase: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        default: null
    },
    classCode: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Fast lookups: find all batches a teacher/student belongs to
batchSchema.index({ teacherIds: 1 });
batchSchema.index({ studentIds: 1 });
batchSchema.index({ instituteId: 1, year: 1 });
batchSchema.index({ classCode: 1 });

module.exports = mongoose.model('Batch', batchSchema);
