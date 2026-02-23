const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['problem_solved', 'login', 'post_created', 'comment'],
        default: 'login'
    },
    count: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

userActivitySchema.index({ user: 1, date: 1, type: 1}, { unique: true});

module.exports = mongoose.model('UserActivity', userActivitySchema);