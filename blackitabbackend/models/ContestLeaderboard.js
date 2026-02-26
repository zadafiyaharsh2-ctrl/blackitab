const mongoose = require('mongoose');

const contestLeaderboardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest',
        required: true,
        index: true
    },
    score: {
        type: Number,
        default: 0
    },
    completionTimeSeconds: {
        type: Number, // Tie-breaker
        default: 0
    },
    rankDelta: {
        type: Number, // ELO rating change
        default: 0
    },
    attemptedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user only has one active leaderboard entry per contest
contestLeaderboardSchema.index({ userId: 1, contestId: 1 }, { unique: true });

// Sorting index for fast leaderboard lookups
contestLeaderboardSchema.index({ contestId: 1, score: -1, completionTimeSeconds: 1 });

module.exports = mongoose.model('ContestLeaderboard', contestLeaderboardSchema);
