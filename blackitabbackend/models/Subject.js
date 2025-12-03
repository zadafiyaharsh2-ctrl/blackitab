/**
 * ============================================================================
 * SUBJECT MODEL
 * ============================================================================
 * 
 * This Mongoose model defines the schema for subjects in the database.
 * A subject represents a major topic area like DBMS, Operating Systems, etc.
 * 
 * Collection Name: subjects (automatically pluralized by Mongoose)
 * 
 * Purpose:
 * - Store high-level subject information
 * - Provide subject selection options on the Theory page
 * - Link to topics through the Topic model's subjectId reference
 * 
 * Relationships:
 * - One subject has many topics (one-to-many)
 * - Referenced by Topic model through subjectId field
 */

// Import Mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for Subject documents
// Schema defines the structure and validation rules for documents in the collection
const subjectSchema = new mongoose.Schema({
    // ========================================
    // NAME FIELD
    // ========================================
    // The name of the subject (e.g., "DBMS", "Operating Systems")
    name: {
        type: String,           // Data type is string
        required: true,         // This field is mandatory - cannot create subject without name
        unique: true,           // No two subjects can have the same name (enforced at database level)
        trim: true              // Automatically remove whitespace from beginning and end
        // Example: "  DBMS  " becomes "DBMS"
    },

    // ========================================
    // DESCRIPTION FIELD
    // ========================================
    // A brief description of the subject
    // Displayed on subject cards to help users understand what the subject covers
    description: {
        type: String,           // Data type is string
        trim: true              // Remove leading/trailing whitespace
        // Note: NOT required - description is optional
    },

    // ========================================
    // CREATED AT FIELD
    // ========================================
    // Timestamp of when the subject was created
    // Useful for tracking when subjects were added to the system
    createdAt: {
        type: Date,             // Data type is Date object
        default: Date.now       // Automatically set to current date/time when document is created
        // Date.now is a function that returns current timestamp
        // Mongoose calls this function when creating new document
    }
});

// Create and export the Subject model
// First parameter: 'Subject' - the model name (Mongoose will create 'subjects' collection)
// Second parameter: subjectSchema - the schema definition we created above
// This model provides methods like Subject.find(), Subject.create(), etc.
module.exports = mongoose.model('Subject', subjectSchema);
