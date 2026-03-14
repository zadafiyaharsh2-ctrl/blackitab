const mongoose = require('mongoose');

const classMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
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
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true,
        index: true
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

classMaterialSchema.index({ batchId: 1, createdAt: -1 });

module.exports = mongoose.model('ClassMaterial', classMaterialSchema);
