/**
 * ============================================================================
 * MAIN APPLICATION COMPONENT (App.jsx)
 * ============================================================================
 * 
 * This is the root component of the React application.
 * It handles:
 * 1. Routing (Navigation between pages) using react-router-dom
 * 2. Global State Management (User authentication state, Sidebar state)
 * 3. Theme Provider Wrapper (Dark/Light mode)
 * 4. Layout Management (sidebar vs full screen pages)
 */

// Import React Router components for handling navigation
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Import React hooks for state and lifecycle
import { useState, useEffect } from 'react';

// Import centralized configuration (API URL)
import API_URL from './config';

// Import Context Providers
// ThemeProvider allows all child components to access/toggle dark mode
// ThemeProvider allows all child components to access/toggle dark mode
import { ThemeProvider } from './context/ThemeContext';
import { SocketContextProvider } from './context/SocketContext';

// ============================================================================
// IMPORT PAGES
// ============================================================================
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Social from './pages/Social';
// import AI from './pages/AI';
import AskAI from './pages/AskAI';
import Analytics from './pages/Analytics';
import SchoolAnalytics from './pages/SchoolAnalytics';
import Problems from './pages/Problems';
import Contest from './pages/Contest';
import ProblemChapters from './pages/ProblemChapters';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import Store from './pages/Store';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import Theory from './pages/Theory';
import Projects from './pages/Projects';
import SocialListPage from './pages/SocialListPage';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import CreatePost from './pages/CreatePost';
import StudyContent from './pages/StudyContent';
import ContentDetail from './pages/ContentDetail';
import PlaylistList from './pages/PlaylistList';
import PlaylistDetail from './pages/PlaylistDetail';
import Earnings from './pages/Earnings';
import AIQuestionGenerator from './pages/AIQuestionGenerator';

// ============================================================================
// IMPORT COMPONENTS
// ============================================================================
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute'; // Wrapper that checks if user is logged in
import PublicRoute from './components/PublicRoute';     // Wrapper for pages accessible only when logged out (like Login)


function App() {
  // Debug log to verify environment connection
  console.log('🚀 app initialized using api url:', API_URL);

  // ============================================================================
  // APP STATE
  // ============================================================================
  const [user, setUser] = useState(null);         // Stores current user data
  const [loading, setLoading] = useState(true);   // Loading state while checking localStorage
  const [sidebarOpen, setSidebarOpen] = useState(true); // Toggles sidebar open/close

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  // Check for saved token on app load (runs once)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      // Restore user session if token exists
      setUser(JSON.parse(userData));
    }
    // Finished loading check
    setLoading(false);
  }, []);

  // Handlers to update state after login/signup
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
  };

  // Handler for logout
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear state
    setUser(null);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  // ============================================================================
  // RENDER APP
  // ============================================================================
  return (
    // Wrap entire app in ThemeProvider to enable Dark Mode
    <ThemeProvider>
      {/* BrowserRouter enables URL-based routing */}
      {/* BrowserRouter enables URL-based routing */}
      <SocketContextProvider authUser={user}>
      <BrowserRouter>
        <Routes>

          {/* ===== PUBLIC ROUTES ===== */}
          {/* Accessible only when NOT logged in */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login onLoginSuccess={handleLoginSuccess} />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup onSignupSuccess={handleSignupSuccess} />
              </PublicRoute>
            }
          />

          {/* ===== LANDING PAGE ===== */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          {/* ===== PROTECTED ROUTES ===== */}
          {/* Accessible only when logged IN */}
          {/* MainLayout adds the Sidebar structure */}
          
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Social / Community */}
          <Route
            path="/social"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Social />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* AI Helper */}
          {/* <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <AI />
                </MainLayout>
              </ProtectedRoute>
            }
          /> */}

          {/* Ask AI - Interactive Chat */}
          <Route
            path="/ask-ai"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <AskAI />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* School Analytics */}
          <Route
            path="/school-analytics"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <SchoolAnalytics />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Problem Sets (Main List) */}
          <Route
            path="/problems"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Problems />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Contest Platform */}
          <Route
            path="/contest"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Contest />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* AI Question Generator */}
          <Route
            path="/ai-questions"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <AIQuestionGenerator />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Problem Chapters for a Subject */}
          <Route
            path="/problems/:subjectId"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <ProblemChapters />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Specific Problem List for a Chapter */}
          <Route
            path="/problems/:subjectId/chapters/:chapterId"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <ProblemList />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Individual Problem Detail View */}
          <Route
            path="/problems/view/:problemId"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <ProblemDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Theory Learning Page */}
          <Route
            path="/theory"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Theory />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Online Projects */}
          <Route
            path="/ide"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Projects />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Store / Marketplace */}
          <Route
            path="/store"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Store />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Job Board */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Jobs />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/network/:userId/:type"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <SocialListPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Messaging Routes */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Messages />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                  <Messages />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Notifications Route */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                   <Notifications />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Create Post Route */}
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                   <CreatePost />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Study Content Route */}
          <Route
            path="/study-content"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                   <StudyContent />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Playlist Routes */}
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                   <PlaylistList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlist/:id"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                   <PlaylistDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Individual Content Detail Route */}
          <Route
            path="/earnings"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                   <Earnings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/:contentId"
            element={
              <ProtectedRoute>
                <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                   <ContentDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback Route: Redirect unknown URLs to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          
        </Routes>
      </BrowserRouter>
      </SocketContextProvider>
    </ThemeProvider>
  );
}

/**
 * ============================================================================
 * MAIN LAYOUT WRAPPER
 * ============================================================================
 * Wraps pages that need the Sidebar and authenticated structure.
 * 
 * Props:
 * - children: The page component to render inside
 * - sidebarOpen, setSidebarOpen: Controls sidebar state
 * - onLogout: Function to handle logout action
 */
// Import Social Sidebar
import SocialSidebar from './components/SocialSidebar';

function MainLayout({ children, sidebarOpen, setSidebarOpen, onLogout, user }) {
  // Determine if we are in a Social context
  const location = useLocation(); 
  const isSocial = ['/social', '/profile', '/network', '/messages', '/earnings', '/create-post', '/playlists', '/playlist', '/notifications'].some(path => location.pathname.startsWith(path));

  // State for Social Sidebar (independent toggle)
  const [socialSidebarOpen, setSocialSidebarOpen] = useState(true);

  // If user is not passed as prop, try to get from localStorage (fallback)
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');

  // Calculate Layout Dimensions
  const mainSidebarWidth = sidebarOpen ? '16rem' : '4rem'; // w-64 vs w-16
  const socialSidebarWidth = socialSidebarOpen ? '16rem' : '4rem';

  return (
    <div className="min-h-screen flex">
      {/* 1. Main Sidebar - ALWAYS VISIBLE, FIXED LEFT */}
      {/* Ensure z-50 to be on top */}
      <div className="z-50">
          <Sidebar onLogout={onLogout} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* 2. Social Sidebar - RENDER ONLY IF SOCIAL, POSITIONED NEXT TO MAIN */}
      {/* Animate presence could be added here later, for now conditional rendering */}
      {isSocial && (
        <SocialSidebar 
            onLogout={onLogout} 
            isOpen={socialSidebarOpen} 
            setIsOpen={setSocialSidebarOpen} 
            user={currentUser} 
            leftOffset={mainSidebarWidth} // Position it right after Main Sidebar
        />
      )}
      
      {/* 3. Main Content Area */}
      {/* Margin Left = Main Sidebar Width + (Social Sidebar Width if visible) */}
      <div 
          className={`flex-1 transition-all duration-300 ${location.pathname.startsWith('/messages') ? '' : 'p-6'}`}
          style={{ 
              marginLeft: isSocial 
                  ? `calc(${mainSidebarWidth} + ${socialSidebarWidth})` 
                  : mainSidebarWidth 
          }}
      >
        {children}
      </div>
    </div>
  );
}

export default App;
