/**
 * ============================================================================
 * AI QUESTION MODEL
 * ============================================================================
 * 
 * This Mongoose model defines the schema for storing AI Q&A interactions.
 * Each document represents a single question-answer exchange between a user
 * and the AI system.
 * 
 * Collection Name: aiquestions
 */

const mongoose = require('mongoose');

const aiQuestionSchema = new mongoose.Schema({
    // Reference to the user who asked the question
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true  // Index for faster user history queries
    },

    // The user's question text
    question: {
        type: String,
        required: true,
        trim: true
    },

    // The AI's response
    answer: {
        type: String,
        required: true
    },

    // Number of top results used for RAG retrieval
    topK: {
        type: Number,
        default: 3
    },

    // Optional: Source documents used to generate the answer
    sources: [{
        type: String
    }],

    // Conversation session ID (for grouping related Q&A)
    sessionId: {
        type: String,
        index: true
    },

    // Timestamp
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound index for efficient user history queries sorted by date
aiQuestionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIQuestion', aiQuestionSchema);
