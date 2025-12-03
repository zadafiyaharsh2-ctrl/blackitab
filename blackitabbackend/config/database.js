/**
 * ============================================================================
 * DATABASE CONNECTION CONFIGURATION
 * ============================================================================
 * 
 * This module handles the MongoDB database connection using Mongoose.
 * It exports a function that connects to MongoDB and handles connection errors.
 * 
 * Connection Details:
 * - Uses MongoDB connection string from environment variable (MONGODB_URI)
 * - Falls back to local MongoDB if environment variable not set
 * - Exits process if connection fails (prevents server from running without database)
 * 
 * Why Mongoose?
 * - Provides schema validation for MongoDB documents
 * - Offers convenient query methods and middleware
 * - Handles connection pooling automatically
 * - Provides better error handling than native MongoDB driver
 */

// Import Mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * This is an async function that must be awaited or called with .then()
 * 
 * @returns {Promise<void>} Resolves when connection is successful
 * @throws {Error} If connection fails, logs error and exits process
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB
    // mongoose.connect() returns a promise that resolves to connection object
    const conn = await mongoose.connect(
      // Connection string priority:
      // 1. Use MONGODB_URI from .env file if available (production/deployment)
      // 2. Fall back to local MongoDB instance if not set (development)
      process.env.MONGODB_URI || 'mongodb://localhost:27017/blackitab',
      {
        // ========================================
        // CONNECTION OPTIONS (DEPRECATED)
        // ========================================
        // These options were required in older Mongoose versions (< 6.0)
        // They are now default behavior and can be removed
        // Kept here commented for reference in case of compatibility issues

        // useNewUrlParser: true,
        // - Tells Mongoose to use new MongoDB connection string parser
        // - Old parser is deprecated

        // useUnifiedTopology: true,
        // - Enables new Server Discovery and Monitoring engine
        // - Provides better connection handling and error recovery
      }
    );

    // Log successful connection
    // conn.connection.host shows the hostname of the MongoDB server
    // Example: "localhost" or "cluster0.mongodb.net"
    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    // ========================================
    // ERROR HANDLING
    // ========================================

    // Log connection error to console
    // error.message provides human-readable error description
    // Common errors:
    // - "ECONNREFUSED" - MongoDB server not running
    // - "Authentication failed" - Wrong credentials
    // - "Network timeout" - Can't reach MongoDB server
    console.error('MongoDB connection error:', error.message);

    // Exit the Node.js process with failure code
    // process.exit(1) means "exit with error"
    // process.exit(0) would mean "exit successfully"
    // 
    // Why exit on connection failure?
    // - Server cannot function without database
    // - Better to fail fast than run in broken state
    // - In production, process manager (PM2, Docker) will restart the server
    // - Gives clear signal that database connection is critical
    process.exit(1);
  }
};

// Export the connectDB function as the default export
// This allows other files to import and call this function
// Usage: const connectDB = require('./config/database');
//        connectDB();
module.exports = connectDB;
