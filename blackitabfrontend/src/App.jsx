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
import { FaBars } from 'react-icons/fa';

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
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import Theory from './pages/Theory';
import SocialListPage from './pages/SocialListPage';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import CreatePost from './pages/CreatePost';
import StudyContent from './pages/StudyContent';
import ContentDetail from './pages/ContentDetail';
import ExamQuestions from './pages/ExamQuestions';
import Leaderboard from './pages/Leaderboard';
import Onboarding from './pages/Onboarding';
import TeacherDashboard from './pages/TeacherDashboard';
import QuestionManagement from './pages/QuestionManagement';
import TeacherBatches from './pages/TeacherBatches';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherAssignmentDetail from './pages/TeacherAssignmentDetail';
import TeacherTests from './pages/TeacherTests';
import TeacherTestDetail from './pages/TeacherTestDetail';
import TeacherContent from './pages/TeacherContent';
import TeacherFeedback from './pages/TeacherFeedback';

// Imported Institute Pages and Layout
import InstituteLayout from './layouts/InstituteLayout';
import InstituteDashboard from './pages/institute/InstituteDashboard';
import InstituteProfile from './pages/institute/InstituteProfile';
import InstituteDepartments from './pages/institute/InstituteDepartments';
import TeacherPanel from './pages/institute/TeacherPanel';
import StudentPanel from './pages/institute/StudentPanel';
import TheoryChecking from './pages/institute/TheoryChecking';
import QuestionChecker from './pages/institute/QuestionChecker';
import JoinRequestsPanel from './pages/institute/JoinRequestsPanel';
import InstituteNotifications from './pages/institute/InstituteNotifications';

import TeacherAttendance from './pages/TeacherAttendance';
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

            {/* School Analytics — teacher/hod/institute only */}
            <Route
              path="/school-analytics"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
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
                  <Leaderboard />
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

            {/* Question Management (Consolidated Page) */}
            <Route
              path="/question-management"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <QuestionManagement />
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

            {/* Teacher Batches / Classrooms Route */}
            <Route
              path="/teacher/batches"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatches />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Attendance Route */}
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherAttendance />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Attendance Route */}
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherAttendance />
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

            {/* Individual Content Detail Route */}
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
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* (Old Routes Removed: CreateExamQuestion and MyQuestions) */}


            {/* Teacher Classes & Batches */}
            <Route
              path="/teacher/batches"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatches />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Assignments */}
            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherAssignments />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Assignment Detail / Grading */}
            <Route
              path="/teacher/assignment/:id"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherAssignmentDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Tests / Exams */}
            <Route
              path="/teacher/tests"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherTests />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Test Detail / Results */}
            <Route
              path="/teacher/test/:id"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherTestDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Content Creation */}
            <Route
              path="/teacher/content"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherContent />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Feedback & Complaints */}
            <Route
              path="/teacher/feedback"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherFeedback />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Institute Profile — accessible to all authenticated users (students see read-only) */}
            <Route
              path="/institute-view"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <InstituteProfile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Institute Nested Routes using InstituteLayout */}
            <Route path="/institute" element={<InstituteLayout />}>
              <Route index element={<Navigate to="/institute/dashboard" replace />} />
              <Route path="dashboard" element={<InstituteDashboard />} />
              <Route path="profile" element={<InstituteProfile />} />
              <Route path="departments" element={<InstituteDepartments />} />
              <Route path="teachers" element={<TeacherPanel />} />
              <Route path="students" element={<StudentPanel />} />
              <Route path="theory" element={<TheoryChecking />} />
              <Route path="questions" element={<QuestionChecker />} />
              <Route path="join-requests" element={<JoinRequestsPanel />} />
              <Route path="notifications" element={<InstituteNotifications />} />
            </Route>

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

import FloatingSocialButton from './components/FloatingSocialButton';
import NotificationBell from './components/NotificationBell';

function MainLayout({ children, sidebarOpen, setSidebarOpen, onLogout, user }) {
  const location = useLocation();

  // Track last visited page for "Resume Last Session" on Dashboard
  useEffect(() => {
    const skip = ['/dashboard', '/login', '/signup', '/onboarding', '/admin'];
    if (!skip.some(p => location.pathname.startsWith(p))) {
      const pageNames = {
        '/problems': 'Practice Problems', '/theory': 'Theory', '/social': 'Social Feed',
        '/analytics': 'Analytics', '/contest': 'Contest', '/ask-ai': 'AI Assistant',
        '/leaderboard': 'Leaderboard', '/profile': 'Profile', '/messages': 'Messages',
        '/teacher-dashboard': 'Teacher Panel', '/question-paper': 'Question Paper',
        '/institute': 'Institute Panel', '/school-analytics': 'School Analytics',
        '/question-management': 'Question Bank', '/notifications': 'Notifications'
      };
      const label = Object.entries(pageNames).find(([k]) => location.pathname.startsWith(k));
      if (label) {
        localStorage.setItem('blackitab_last_page', JSON.stringify({ path: location.pathname, label: label[1], time: Date.now() }));
      }
    }
  }, [location.pathname]);

  // Track last visited page for "Resume Last Session" on Dashboard
  // ... omitted for brevity ...
  useEffect(() => {
    // ...
  }, [location.pathname]);

  // Adjust content margin based on sidebar state (desktop only)
  // On mobile, the sidebar sits OVER the content, so margin is 0.
  const contentMarginClass = sidebarOpen ? 'md:ml-[280px]' : 'md:ml-[80px]';

  return (
    <div className="min-h-screen flex bg-[#05000a] text-white transition-colors duration-300">
      {/* Sidebar Overlay (Mobile Only) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <div className="z-50 relative">
        <Sidebar onLogout={onLogout} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 w-full min-h-screen ${location.pathname.startsWith('/messages') ? '' : 'p-4 md:p-8'} ${contentMarginClass}`}
      >
        {/* Mobile Hamburger Header */}
        <div className="md:hidden flex items-center justify-between mb-4 sticky top-0 z-30 bg-black/80 backdrop-blur-md p-4 -mx-4 -mt-4 border-b border-white/10">
            <div className="flex items-center gap-3">
               <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-white">
                 <FaBars />
               </button>
               <span className="font-bold text-lg text-white tracking-wide">Blackitab</span>
            </div>
        </div>

        {children}
      </div>

      {/* Floating Social Button — Bottom Right */}
      <FloatingSocialButton />

      {/* Notification Bell — Top Right */}
      <NotificationBell />
    </div>
  );
}

export default App;
