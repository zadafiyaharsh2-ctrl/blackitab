const mongoose = require('mongoose');

const subscriberListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate subscriptions
subscriberListSchema.index({ userId: 1, subscriberId: 1 }, { unique: true });

module.exports = mongoose.model('SubscriberList', subscriberListSchema);
