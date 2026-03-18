/**
 * ============================================================================
 * REACT ENTRY POINT (main.jsx)
 * ============================================================================
 * 
 * This file is the bridge between React code and the HTML DOM (index.html).
 * It "mounts" the React application into the div with id="root".
 */

// Import React StrictMode for highlighting potential problems in development
import { StrictMode } from 'react'

// Import createRoot to initialize the React application (React 18+)
import { createRoot } from 'react-dom/client'

// Import axios to set up global interceptors for all bare "axios" usages
import axios from 'axios';

// Global error interceptor for 401 Unauthorized responses
// This will catch token expiration or invalid session errors globally across the entire app
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear out stored authentication tokens and user info
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Instantly redirect the user to the login page
      window.location.href = '/login';
      
      // Return a pending promise to prevent downstream catch blocks from triggering error toasts
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

// Import global CSS styles
import './index.css'

// Import the root App component
import App from './App.jsx'

// Find the HTML element with id 'root' and render the App inside it
createRoot(document.getElementById('root')).render(
  // StrictMode activates additional checks and warnings for descendants
  <StrictMode>
    <App />
  </StrictMode>,
)
