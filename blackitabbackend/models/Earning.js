const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['content_view', 'referral', 'contest_prize', 'teaching_bonus', 'withdrawal', 'bonus'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'withdrawn'],
        default: 'completed'
    },
    description: {
        type: String,
        default: ''
    },
    metadata: {
        contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
        contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' },
        referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index for fast user-specific queries
earningSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Earning', earningSchema);
