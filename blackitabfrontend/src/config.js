/**
 * ============================================================================
 * API CONFIGURATION (config.js)
 * ============================================================================
 * 
 * Centralized configuration for the Backend API URL.
 * This ensures all API calls throughout the app go to the same place.
 * 
 * Logic:
 * 1. Check if VITE_API_URL environment variable is set (used in deployment)
 * 2. If not set, fallback to 'http://localhost:5000' for local development
 */

// const API_URL = import.meta.env.VITE_API_URL || 'https://blackitab.onrender.com';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
// Export as default so it can be imported as: import API_URL from './config';
export default API_URL;
