/**
 * ============================================================================
 * USER PROGRESS MODEL
 * ============================================================================
 * 
 * This model tracks user progress through topics.
 * Each document represents a user's completion status for a specific topic.
 * 
 * Collection Name: userprogresses (automatically pluralized by Mongoose)
 */

const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    // Reference to the user who completed the topic
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index for faster queries
    },

    // Reference to the subject (DBMS, SQL, etc.)
    // Uses String to support both ObjectId and mock string IDs
    subjectId: {
        type: String,
        required: true,
        index: true
    },

    // Reference to the specific topic
    // Uses String to support both ObjectId and mock string IDs
    topicId: {
        type: String,
        required: true,
        index: true
    },

    // Completion status
    completed: {
        type: Boolean,
        default: true
    },

    // Timestamp when topic was completed
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Create compound index to ensure user can't have duplicate completion records
// for the same topic
userProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

// Create compound index for efficient queries by user and subject
userProgressSchema.index({ userId: 1, subjectId: 1 });

module.exports = mongoose.model('UserProgress', userProgressSchema);
