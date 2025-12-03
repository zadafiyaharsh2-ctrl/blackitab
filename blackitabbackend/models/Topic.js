/**
 * ============================================================================
 * TOPIC MODEL
 * ============================================================================
 * 
 * This Mongoose model defines the schema for topics in the database.
 * A topic represents a specific lesson or chapter within a subject.
 * 
 * Collection Name: topics (automatically pluralized by Mongoose)
 * 
 * Purpose:
 * - Store lightweight topic metadata (name, subject reference)
 * - Provide fast topic listing without loading heavy content
 * - Link topics to subjects through subjectId reference
 * - Link to full content through full_data_of_topics collection
 * 
 * Design Decision:
 * - This model is kept lightweight (just name and references)
 * - Full content is stored separately in full_data_of_topics collection
 * - This separation improves performance when loading topic lists
 * - Users can see all topic names quickly without loading all content
 * 
 * Relationships:
 * - Many topics belong to one subject (many-to-one)
 * - One topic has one full_data_of_topics entry (one-to-one)
 */

// Import Mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for Topic documents
const topicSchema = new mongoose.Schema({
    // ========================================
    // NAME FIELD
    // ========================================
    // The name/title of the topic (e.g., "Introduction of DBMS", "Normalization")
    name: {
        type: String,           // Data type is string
        required: true,         // This field is mandatory - every topic must have a name
        trim: true              // Automatically remove whitespace from beginning and end
    },

    // ========================================
    // SUBJECT ID FIELD (FOREIGN KEY)
    // ========================================
    // Reference to the parent subject this topic belongs to
    // This creates a relationship between topics and subjects
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,  // Data type is MongoDB ObjectId
        // ObjectId is a 12-byte identifier used by MongoDB
        ref: 'Subject',                        // References the Subject model
        // This enables Mongoose populate() to fetch subject details
        required: true                          // Every topic must belong to a subject
    },
    // Example: If DBMS subject has _id "abc123", all DBMS topics will have subjectId: "abc123"

    // ========================================
    // CONTENT FIELD (LEGACY/UNUSED)
    // ========================================
    // Array to store content blocks
    // NOTE: This field is currently NOT USED in the application
    // Content is actually stored in the full_data_of_topics collection
    // This field exists for potential future use or backward compatibility
    content: {
        type: [mongoose.Schema.Types.Mixed],   // Array of Mixed type (can contain any data type)
        // Mixed type allows flexibility - objects, strings, numbers, etc.
        default: []                             // Default to empty array if not provided
    },
    // Why Mixed type?
    // - Content blocks have different structures (paragraphs, lists, images)
    // - Mixed type allows storing different object shapes in the same array

    // ========================================
    // CREATED AT FIELD
    // ========================================
    // Timestamp of when the topic was created
    // Used for sorting topics in insertion order
    createdAt: {
        type: Date,             // Data type is Date object
        default: Date.now       // Automatically set to current date/time when document is created
    }
});

// Create and export the Topic model
// First parameter: 'Topic' - the model name (Mongoose will create 'topics' collection)
// Second parameter: topicSchema - the schema definition we created above
module.exports = mongoose.model('Topic', topicSchema);
