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
