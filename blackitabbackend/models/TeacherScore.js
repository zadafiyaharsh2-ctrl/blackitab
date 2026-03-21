const mongoose = require('mongoose');

const teacherScoreSchema = new mongoose.Schema({
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
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    category: {
        type: String,
        enum: ['teaching', 'punctuality', 'knowledge', 'communication', 'overall'],
        default: 'overall'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'assignedByModel',
        required: true
    },
    assignedByModel: {
        type: String,
        enum: ['User', 'SystemAdmin'],
        default: 'User'
    },
    note: {
        type: String,
        maxLength: 500,
        trim: true,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// One score per teacher per category per institute
teacherScoreSchema.index({ teacherId: 1, instituteId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('TeacherScore', teacherScoreSchema);
