/**
 * ============================================================================
 * THEORY CONTROLLER
 * ============================================================================
 * 
 * This controller handles all API endpoints related to the Theory section.
 * It provides three main endpoints:
 * 1. GET /api/subjects - Fetch all subjects
 * 2. GET /api/subjects/:subjectId/topics - Fetch topics for a specific subject
 * 3. GET /api/topics/:id/full - Fetch full content for a specific topic
 * 
 * Database Collections Used:
 * - subjects: Contains subject information (name, description)
 * - topics: Contains topic metadata (name, subjectId reference)
 * - full_data_of_topics: Contains complete topic content (topicId reference, content array)
 * 
 * Why separate collections?
 * - topics collection is lightweight (just names and IDs) for fast listing
 * - full_data_of_topics contains heavy content (paragraphs, lists, images)
 * - This separation improves performance when loading topic lists
 */

// Import Mongoose models for database operations
const Subject = require('../models/Subject');        // Subject model (DBMS, OS, etc.)
const Topic = require('../models/Topic');            // Topic model (lightweight, just names)
const FullTopicData = require('../models/full_data_of_topics'); // Full content model

/**
 * ============================================================================
 * GET ALL SUBJECTS
 * ============================================================================
 * Route: GET /api/subjects
 * 
 * Returns all subjects in the database sorted alphabetically by name.
 * Used on the subject selection page to show available subjects.
 * 
 * Response format:
 * {
 *   success: true,
 *   data: [
 *     { _id: "...", name: "DBMS", description: "Database Management System..." },
 *     { _id: "...", name: "OS", description: "Operating Systems..." }
 *   ]
 * }
 */
exports.getSubjects = async (req, res) => {
    try {
        // Query database to find all subjects
        // .find() with no parameters returns all documents
        // .sort({ name: 1 }) sorts alphabetically (1 = ascending, -1 = descending)
        const subjects = await Subject.find().sort({ name: 1 });

        // Calculate topic count for each subject
        // Use Promise.all to run count queries in parallel
        const subjectsWithCounts = await Promise.all(subjects.map(async (subject) => {
            const count = await Topic.countDocuments({ subjectId: subject._id });
            // Convert mongoose document to plain object and add topicCount
            return {
                ...subject.toObject(),
                topicCount: count
            };
        }));

        // Send successful response with subjects data including counts
        // success: true indicates operation completed successfully
        // data: subjects contains the array of subject objects with topicCount
        res.json({ success: true, data: subjectsWithCounts });
    } catch (error) {
        // Log error to console for debugging
        // This helps developers identify issues in server logs
        console.error('Error fetching subjects:', error);

        // Send error response to client
        // 500 status code indicates internal server error
        // success: false tells client the operation failed
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * ============================================================================
 * GET TOPICS BY SUBJECT
 * ============================================================================
 * Route: GET /api/subjects/:subjectId/topics
 * 
 * Returns all topics for a specific subject, sorted by creation date.
 * Used when user selects a subject to show the list of available topics.
 * 
 * URL Parameters:
 * - subjectId: MongoDB ObjectId of the subject
 * 
 * Response format:
 * {
 *   success: true,
 *   data: [
 *     { _id: "...", name: "Introduction of DBMS", subjectId: "...", createdAt: "..." },
 *     { _id: "...", name: "History of DBMS", subjectId: "...", createdAt: "..." }
 *   ]
 * }
 */
exports.getTopicsBySubject = async (req, res) => {
    try {
        // Extract subjectId from URL parameters
        // req.params contains all URL parameters defined in route
        // Example: /api/subjects/123/topics -> req.params.subjectId = "123"
        const { subjectId } = req.params;

        // Query database to find all topics for this subject
        // .find({ subjectId }) finds all topics where subjectId field matches
        // .sort({ createdAt: 1 }) sorts by creation date (oldest first)
        // This maintains the order topics were added (insertion order)
        const topics = await Topic.find({ subjectId }).sort({ createdAt: 1 });

        // Send successful response with topics data
        res.json({ success: true, data: topics });
    } catch (error) {
        // Log error to console for debugging
        console.error('Error fetching topics:', error);

        // Send error response to client
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * ============================================================================
 * GET FULL TOPIC CONTENT
 * ============================================================================
 * Route: GET /api/topics/:id/full
 * 
 * Returns complete content for a specific topic from full_data_of_topics collection.
 * This is called when user clicks on a topic to view its content.
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the topic
 * 
 * Why separate endpoint?
 * - Topic content can be very large (many paragraphs, lists, images)
 * - We don't want to load all content when just listing topics
 * - Only fetch full content when user actually selects a topic
 * 
 * Database Query:
 * - Searches full_data_of_topics collection
 * - Matches topicId field with the provided topic id
 * - topicId in full_data_of_topics references _id in topics collection
 * 
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     _id: "...",
 *     topicId: "...",
 *     title: "Introduction of DBMS",
 *     content: [
 *       { type: "paragraph", text: "..." },
 *       { type: "heading", text: "..." },
 *       { type: "list", items: [...] },
 *       { type: "image", src: "...", caption: "..." }
 *     ],
 *     createdAt: "...",
 *     lastUpdated: "..."
 *   }
 * }
 */
exports.getTopicFullContent = async (req, res) => {
    try {
        // Extract topic id from URL parameters
        // req.params.id contains the topic's MongoDB ObjectId
        const { id } = req.params;

        // Find the full content document linked to this topic ID
        // .findOne() returns single document (or null if not found)
        // { topicId: id } searches for document where topicId field equals the provided id
        // This is the key link between topics and full_data_of_topics collections
        const topicData = await FullTopicData.findOne({ topicId: id });

        // Check if content was found
        // If topicData is null, it means no content exists for this topic
        if (!topicData) {
            // Return 404 Not Found status
            // This happens if:
            // 1. Topic exists but has no content yet
            // 2. topicId reference is broken (data integrity issue)
            // 3. Topic was deleted but full_data wasn't cleaned up
            return res.status(404).json({
                success: false,
                message: 'Content not found for this topic'
            });
        }

        // Send successful response with full topic content
        // topicData contains all content blocks, title, etc.
        res.json({ success: true, data: topicData });
    } catch (error) {
        // Log error to console for debugging
        console.error('Error fetching topic content:', error);

        // Send error response to client
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
