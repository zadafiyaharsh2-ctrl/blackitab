const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
