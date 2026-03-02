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
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

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
import ExamQuestions from './pages/ExamQuestions';
import Leaderboard from './pages/Leaderboard';
import Onboarding from './pages/Onboarding';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateExamQuestion from './pages/CreateExamQuestion';
import MyQuestions from './pages/MyQuestions';
import InstituteDashboard from './pages/InstituteDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
// ============================================================================
// IMPORT COMPONENTS
// ============================================================================
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute'; // Wrapper that checks if user is logged in
import PublicRoute from './components/PublicRoute';     // Wrapper for pages accessible only when logged out (like Login)


function App() {
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
    <ThemeProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-gray-800/90 bg-white/90 backdrop-blur-md dark:text-white text-gray-900 shadow-xl border dark:border-gray-700/50 border-gray-200/50',
          duration: 4000,
          style: {
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
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

            {/* Leaderboard */}
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <Leaderboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Onboarding (full-screen, no sidebar) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
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

            {/* Theory Subject Page (Dynamic Route) */}
            <Route
              path="/theory/:subjectId"
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
            <Route
              path="/exam/:examId" element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <ExamQuestions />

                  </MainLayout>
                </ProtectedRoute>
              }

            />

            {/* ===== ROLE-BASED ROUTES ===== */}

            {/* Teacher / HOD Dashboard */}
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute_admin']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Create Exam Question */}
            <Route
              path="/create-question"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute_admin']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <CreateExamQuestion />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* My Questions */}
            <Route
              path="/my-questions"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute_admin']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <MyQuestions />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Institute Admin Dashboard */}
            <Route
              path="/institute-dashboard"
              element={
                <ProtectedRoute requiredRoles={['institute_admin']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <InstituteDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* System Admin — separate layout (no sidebar) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* 404 — catch all unknown routes */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 dark:bg-black bg-gray-50">
                <div className="text-8xl font-black text-gray-200 dark:text-gray-800 mb-4 select-none">404</div>
                <h1 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
                <a href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                  Go to Dashboard
                </a>
              </div>
            } />

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

  // Track last visited page for "Resume Last Session" on Dashboard
  useEffect(() => {
    const skip = ['/dashboard', '/login', '/signup', '/onboarding', '/admin'];
    if (!skip.some(p => location.pathname.startsWith(p))) {
      const pageNames = {
        '/problems': 'Practice Problems', '/theory': 'Theory', '/social': 'Social Feed',
        '/analytics': 'Analytics', '/contest': 'Contest', '/ask-ai': 'AI Assistant',
        '/store': 'Store', '/jobs': 'Jobs', '/ide': 'Projects', '/leaderboard': 'Leaderboard',
        '/profile': 'Profile', '/messages': 'Messages', '/playlists': 'Playlists',
        '/earnings': 'Earnings', '/teacher-dashboard': 'Teacher Panel',
        '/create-question': 'Create Question', '/my-questions': 'My Questions',
        '/institute-dashboard': 'Institute Panel', '/school-analytics': 'School Analytics',
        '/ai-questions': 'AI Questions', '/notifications': 'Notifications'
      };
      const label = Object.entries(pageNames).find(([k]) => location.pathname.startsWith(k));
      if (label) {
        localStorage.setItem('blackitab_last_page', JSON.stringify({ path: location.pathname, label: label[1], time: Date.now() }));
      }
    }
  }, [location.pathname]);

  // State for Social Sidebar (independent toggle)
  const [socialSidebarOpen, setSocialSidebarOpen] = useState(true);

  // If user is not passed as prop, try to get from localStorage (fallback)
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');

  // Calculate Layout Dimensions
  const mainSidebarWidth = sidebarOpen ? '16rem' : '4rem'; // w-64 vs w-16
  const socialSidebarWidth = socialSidebarOpen ? '16rem' : '4rem';

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
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
