const mongoose = require('mongoose');

const teacherContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed, // rich text / markdown / HTML
        required: [true, 'Content is required']
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        default: null
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        default: null
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    visibility: {
        type: String,
        enum: ['private', 'institute', 'global_requested', 'global_approved'],
        default: 'private'
    },
    approvalStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

teacherContentSchema.index({ teacherId: 1, visibility: 1 });
teacherContentSchema.index({ instituteId: 1, visibility: 1 });

module.exports = mongoose.model('TeacherContent', teacherContentSchema);
