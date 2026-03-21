const mongoose = require('mongoose');

const adminChatSchema = new mongoose.Schema({
    // Who sent it: either a User (institute_admin) or a SystemAdmin
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        enum: ['User', 'SystemAdmin'],
        required: true
    },
    // Who receives it
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'receiverModel'
    },
    receiverModel: {
        type: String,
        enum: ['User', 'SystemAdmin'],
        required: true
    },
    // The institute this conversation belongs to
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    message: {
        type: String,
        required: [true, 'Message cannot be empty'],
        trim: true,
        maxLength: 2000
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

// Fast lookup: all messages in a conversation, ordered by time
adminChatSchema.index({ instituteId: 1, createdAt: 1 });
adminChatSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

module.exports = mongoose.model('AdminChat', adminChatSchema);
