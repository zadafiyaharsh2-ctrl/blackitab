const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    batchIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    }],
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Announcement title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Announcement content is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['announcement', 'reminder'],
        default: 'announcement'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Announcement', announcementSchema);
