const mongoose = require('mongoose');

const followerListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'accepted' // Default to accepted for backward compatibility, new logic will use 'pending'
    }
});

// Compound index to prevent duplicate follows
followerListSchema.index({ userId: 1, followerId: 1 }, { unique: true });

module.exports = mongoose.model('FollowerList', followerListSchema);
