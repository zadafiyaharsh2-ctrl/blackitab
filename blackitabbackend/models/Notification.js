const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['follow_request', 'follow_accepted', 'new_follower', 'new_message', 'post_like', 'post_comment', 'system_alert', 'basic'],
        required: true
    },
    message: {
        type: String, // Optional string for basic alerts or message excerpts
        trim: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // A generic reference (could be a postId or messageId)
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
