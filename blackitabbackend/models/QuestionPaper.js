/**
 * ============================================================================
 * QUESTION PAPER MODEL
 * ============================================================================
 *
 * This Mongoose model defines the schema for storing Question Papers.
 * Each document represents a curated set of questions assembled into a
 * downloadable/printable paper by a teacher, HOD, or institute admin.
 *
 * Collection Name: questionpapers
 */

const mongoose = require('mongoose');

const questionPaperSchema = new mongoose.Schema({
    // Paper title (e.g. "GATE 2026 - DBMS Mock Test")
    title: {
        type: String,
        required: [true, 'Paper title is required'],
        trim: true
    },

    // Target exam type
    exam: {
        type: String,
        enum: ['jee', 'neet', 'upsc', 'gate', 'cat'],
        default: null,
        index: true
    },

    // Subject filter used when generating the paper
    subject: {
        type: String,
        default: ''
    },

    // Difficulty filter used when generating the paper
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', ''],
        default: ''
    },

    // References to the questions included in this paper
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamQuestion'
    }],

    // Total number of questions in the paper
    totalQuestions: {
        type: Number,
        default: 0
    },

    // Total marks for the paper
    totalMarks: {
        type: Number,
        default: 0
    },

    // Duration in minutes
    duration: {
        type: Number,
        default: 60
    },

    // Whether the answer key is included
    includeAnswers: {
        type: Boolean,
        default: true
    },

    // Instructions for the paper
    instructions: {
        type: String,
        default: ''
    },

    // Creator of the paper
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Institute association (if any)
    instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        default: null,
        index: true
    },

    // Batch association (if assigned to a specific batch)
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        default: null
    },

    // Paper status
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true
    },

    // Visibility
    visibility: {
        type: String,
        enum: ['private', 'institute', 'public'],
        default: 'private'
    },

    // Tags for categorization
    tags: [{
        type: String
    }],

    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update `updatedAt` on save
questionPaperSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Compound indexes for common queries
questionPaperSchema.index({ createdBy: 1, createdAt: -1 });
questionPaperSchema.index({ instituteId: 1, status: 1 });

module.exports = mongoose.model('QuestionPaper', questionPaperSchema);
