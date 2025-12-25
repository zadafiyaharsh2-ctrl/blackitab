const mongoose = require('mongoose');

const followingListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate follows
followingListSchema.index({ userId: 1, followingId: 1 }, { unique: true });

module.exports = mongoose.model('FollowingList', followingListSchema);
