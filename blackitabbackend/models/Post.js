const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caption: {
        type: String,
        maxLength: 2200
    },
    mediaUrl: {
        type: String,
        required: true // At least one media required? (For now, yes)
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    contentType: {
        type: String,
        enum: ['post', 'study-content', 'paid-content'],
        default: 'post'
    },
    title: {
        type: String,
        maxLength: 200
        // Required only if contentType is 'study-content' or 'paid-content'
    },
    description: {
        type: String,
        maxLength: 5000
        // Required only if contentType is 'study-content' or 'paid-content'
    },
    price: {
        type: Number,
        default: 0
        // Required > 0 if contentType is 'paid-content'
    },
    currency: {
        type: String,
        default: 'INR'
    },
    purchasedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    publicId: {
        type: String, // Cloudinary Public ID for deletion
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    views: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String,
            required: true
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
