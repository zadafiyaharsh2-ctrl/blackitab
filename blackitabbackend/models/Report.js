const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    targetType: {
        type: String,
        required: true,
        enum: ['user', 'post', 'message', 'comment'],
        index: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['spam', 'harassment', 'inappropriate', 'impersonation', 'security', 'other']
    },
    details: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending',
        index: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewNote: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    actionTaken: {
        type: String,
        enum: ['none', 'warning', 'content_removed', 'user_restricted', 'user_banned'],
        default: 'none'
    }
}, { timestamps: true });

// Prevent duplicate reports from same user on same target
reportSchema.index({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
