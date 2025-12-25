// Import React library and necessary hooks: useState for state management, useEffect for side effects (like API calls)
import React, { useState, useEffect } from 'react';

// Import axios library to make HTTP requests (GET, POST, etc.) to the backend
import axios from 'axios';

// Import useNavigate hook from react-router-dom to handle navigation between pages programmatically
import { useNavigate } from 'react-router-dom';

// Import specific icons (Code, ChevronRight) from the lucide-react library for UI elements
import { Code, ChevronRight } from 'lucide-react';

// Import the centralized API URL configuration to ensures we connect to the correct backend (local or production)
import API_URL from '../config';

// Define the Problems component using an arrow function
const Problems = () => {
  // State to store the list of problem subjects fetched from the backend (initially an empty array)
  const [problemSubjects, setProblemSubjects] = useState([]);
  
  // State to manage the loading status (initially true to show a spinner)
  const [loading, setLoading] = useState(true);
  
  // Initialize the navigate function to allow us to change routes/pages
  const navigate = useNavigate();

  // useEffect hook to fetch data when the component first mounts (loads)
  // The empty dependency array [] ensures this runs only once
  useEffect(() => {
    // Define an asynchronous function to fetch the subjects
    const fetchProblemSubjects = async () => {
      try {
        // Make a GET request to the backend API endpoint to get problem subjects
        // We use the imported API_URL to effectively switch between localhost and Render
        const res = await axios.get(`${API_URL}/api/problems/subjects`);
        
        // Check if the response success flag is true
        if (res.data.success) {
          // If successful, update the state with the received data
          setProblemSubjects(res.data.data);
        }
      } catch (err) {
        // If an error occurs (e.g., network error, 500 server error), log it to the console
        console.error('Error fetching problem subjects:', err);
      } finally {
        // Regardless of success or failure, set loading to false to hide the spinner
        setLoading(false);
      }
    };

    // Call the function we just defined to initiate the fetch
    fetchProblemSubjects();
  }, []); // Empty array triggers this effect only on component mount

  // Render the component UI
  return (
    // Main container with max width, centering, and padding
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-white mb-8">Problem Sets</h1>

      {/* Conditional rendering: If loading is true, show spinner; otherwise, show content */}
      {loading ? (
        // Loading Spinner Container
        <div className="flex justify-center py-20">
          {/* Animated spinning circle using Tailwind classes */}
          <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full"></div>
        </div>
      ) : (
        // Grid Container for Subject Cards
        // Uses responsive grid: 1 col on mobile, 2 on small tablets, 3 on large screens
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Map through the problemSubjects array to create a card for each subject */}
          {problemSubjects.map((subject) => (
            // Individual Subject Card
            <div
              key={subject._id} // Unique key helps React optimize rendering
              onClick={() => navigate(`/problems/${subject._id}`)} // Navigate to specific subject page on click
              // Tailwind classes for styling: background blur, rounded corners, shadow, hover effects
              className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl cursor-pointer p-6 border border-gray-700 group transition hover:border-purple-500/30"
            >
              {/* Icon Container with hover effect */}
              <div className="h-14 w-14 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition">
                {/* Code Icon */}
                <Code className="text-purple-400 group-hover:text-white h-8 w-8" />
              </div>

              {/* Subject Name */}
              <h2 className="text-xl font-bold text-white">{subject.name}</h2>
              
              {/* Subject Description limited to 2 lines */}
              <p className="text-gray-400 mt-2 line-clamp-2">
                {subject.description}
              </p>

              {/* Call to Action (Start Solving) */}
              <div className="flex items-center text-purple-400 mt-5 font-semibold group-hover:text-purple-300">
                Start Solving <ChevronRight className="ml-2 h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Export the component so it can be used in other files (like App.jsx)
export default Problems;
