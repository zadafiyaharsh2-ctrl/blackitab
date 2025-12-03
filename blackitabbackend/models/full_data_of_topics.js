/**
 * ============================================================================
 * FULL TOPIC DATA MODEL
 * ============================================================================
 * 
 * This Mongoose model defines the schema for complete topic content.
 * This collection stores the actual content (paragraphs, lists, images, etc.)
 * for each topic, separate from the lightweight Topic model.
 * 
 * Collection Name: full_data_of_topics (explicitly set, not pluralized)
 * 
 * Purpose:
 * - Store complete, detailed content for topics
 * - Keep topic listing fast by separating heavy content
 * - Support rich content types (text, lists, images, etc.)
 * 
 * Why a Separate Collection?
 * 1. Performance: Topic lists load quickly without fetching all content
 * 2. Scalability: Content can be very large (many paragraphs, images)
 * 3. Flexibility: Content structure can evolve without affecting topic metadata
 * 4. Caching: Can cache topic lists separately from content
 * 
 * Relationships:
 * - One full_data_of_topics entry belongs to one topic (one-to-one)
 * - topicId field references the _id in topics collection
 * 
 * Content Structure:
 * The content array contains blocks of different types:
 * - { type: "paragraph", text: "..." }
 * - { type: "heading", text: "..." }
 * - { type: "list", title: "...", items: [...] }
 * - { type: "numbered_list", items: [...] }
 * - { type: "image", src: "...", alt: "...", caption: "..." }
 */

// Import Mongoose library for MongoDB object modeling
const mongoose = require("mongoose");

// Define the schema for full topic data documents
const TopicDataSchema = new mongoose.Schema({
  // ========================================
  // TOPIC ID FIELD (FOREIGN KEY)
  // ========================================
  // Reference to the topic this content belongs to
  // Links to the _id field in the topics collection
  topicId: mongoose.Schema.Types.ObjectId,
  // Example: If topic "Introduction of DBMS" has _id "xyz789",
  // this full_data entry will have topicId: "xyz789"

  // Why not use 'ref'?
  // - This schema is more flexible/loose
  // - We manually query using topicId in the controller
  // - Could add ref: 'Topic' for Mongoose populate() if needed

  // ========================================
  // TITLE FIELD
  // ========================================
  // The title of the topic (usually same as topic.name)
  // Stored here for convenience so we don't need to join with topics collection
  title: String,
  // Type: String (no validation rules)
  // This is denormalized data (duplicated from topics.name)
  // Trade-off: Slight data duplication for better query performance

  // ========================================
  // LAST UPDATED FIELD
  // ========================================
  // Timestamp of when the content was last modified
  // Stored as string for flexibility (can be formatted date or ISO string)
  lastUpdated: String,
  // Example values: "2025-11-22T16:54:38.150Z" or "2025-11-22"
  // Why String instead of Date?
  // - Allows flexible date formats
  // - Can store additional metadata in the string if needed

  // ========================================
  // CONTENT FIELD (MAIN DATA)
  // ========================================
  // Array of content blocks that make up the topic's content
  // Each block is an object with a 'type' field and type-specific properties
  content: Array,
  // Type: Array (can contain any objects)
  // No strict schema - allows flexibility for different content types

  // Example content array:
  // [
  //   { type: "paragraph", text: "DBMS is a software system..." },
  //   { type: "heading", text: "Why DBMS is Used" },
  //   { type: "list", title: "Benefits", items: ["...", "..."] },
  //   { type: "image", src: "/images/dbms.png", caption: "..." }
  // ]

  // Why Array instead of [Mixed]?
  // - Both work similarly for storing flexible objects
  // - Array is simpler and more readable
  // - No validation needed - content structure is handled by frontend

  // ========================================
  // CREATED AT FIELD
  // ========================================
  // Timestamp of when this content entry was created
  createdAt: Date
  // Type: Date object
  // No default value - must be set explicitly when creating document
  // Usually set in seed scripts or when content is first added
});

// Create and export the model
// First parameter: "full_data_of_topics" - exact collection name (NOT pluralized)
// Second parameter: TopicDataSchema - the schema definition
// 
// Note: Using exact collection name instead of letting Mongoose pluralize
// This gives us explicit control over the collection name
module.exports = mongoose.model("full_data_of_topics", TopicDataSchema);
