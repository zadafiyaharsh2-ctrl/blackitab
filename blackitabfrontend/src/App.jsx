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
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import Dashboard from './pages/student/Dashboard';
import Social from './pages/student/Social';
// import AI from './pages/student/AI';
import AskAI from './pages/student/AskAI';
import SchoolAnalytics from './pages/admin/SchoolAnalytics';
import Problems from './pages/student/Problems';
import Contest from './pages/student/Contest';
import ProblemChapters from './pages/student/ProblemChapters';
import ProblemList from './pages/student/ProblemList';
import ProblemDetail from './pages/student/ProblemDetail';
import Profile from './pages/shared/Profile';
import { useParams as useRouteParams } from 'react-router-dom';

// Wrapper that gives Profile a unique key per userId so React fully remounts
// it when navigating from one user's profile to another — preventing stale state.
const ProfileWithKey = () => {
  const { userId } = useRouteParams();
  return <Profile key={userId || 'me'} />;
};

import LandingPage from './pages/public/LandingPage';
import Theory from './pages/student/Theory';
import SocialListPage from './pages/student/SocialListPage';
import Messages from './pages/shared/Messages';
import Notifications from './pages/shared/Notifications';
import Contact from './pages/public/Contact';
import CreatePost from './pages/student/CreatePost';
import StudyContent from './pages/student/StudyContent';
import ContentDetail from './pages/student/ContentDetail';
import ExamQuestions from './pages/teacher/ExamQuestions';
import Leaderboard from './pages/student/Leaderboard';
import Onboarding from './pages/public/Onboarding';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageQuestions from './pages/teacher/ManageQuestions';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherBatchDetail from './pages/teacher/TeacherBatchDetail';
import StudentClasses from './pages/student/StudentClasses';
import StudentClassDetail from './pages/student/StudentClassDetail';
import StudentMaterialDetail from './pages/student/StudentMaterialDetail';
import StudentAssignmentDetail from './pages/student/StudentAssignmentDetail';
import StudentExamDetail from './pages/student/StudentExamDetail';
import TeacherAssignmentDetail from './pages/TeacherAssignmentDetail';
import TeacherTests from './pages/TeacherTests';
import TeacherTestDetail from './pages/TeacherTestDetail';
import TeacherContent from './pages/TeacherContent';
import TeacherFeedback from './pages/TeacherFeedback';
import TeacherBatches from './pages/teacher/TeacherBatchDetail';

// HOD Department Pages
import HodDepartmentTeachers from './pages/hod/HodDepartmentTeachers';
import TeacherPerformance from './pages/hod/TeacherPerformance';
import HodContentReview from './pages/hod/HodContentReview';
import HodAttendanceView from './pages/hod/HodAttendanceView';
import HodFeedbackOverview from './pages/hod/HodFeedbackOverview';
import TeacherBatchMaterialForm from './pages/teacher/TeacherBatchMaterialForm';
import TeacherBatchAssignmentForm from './pages/teacher/TeacherBatchAssignmentForm';

// Imported Institute Pages
import InstituteDashboard from './pages/institute/InstituteDashboard';
import InstituteProfile from './pages/institute/InstituteProfile';
import InstituteDepartments from './pages/institute/InstituteDepartments';
import DepartmentDetail from './pages/institute/DepartmentDetail';
import TeacherPanel from './pages/institute/TeacherPanel';
import TeacherProfileView from './pages/institute/TeacherProfileView';
import StudentPanel from './pages/institute/StudentPanel';
import TheoryChecking from './pages/institute/TheoryChecking';
import QuestionChecker from './pages/institute/QuestionChecker';
import JoinRequestsPanel from './pages/institute/JoinRequestsPanel';
import InstituteNotifications from './pages/institute/InstituteNotifications';

import TeacherAttendance from './pages/teacher/TeacherAttendance';
import AdminLogin from './pages/public/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
// ============================================================================
// IMPORT COMPONENTS
// ============================================================================
import Sidebar from './components/shared/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Wrapper that checks if user is logged in
import PublicRoute from './components/auth/PublicRoute';     // Wrapper for pages accessible only when logged out (like Login)
import BugReporter from './components/shared/BugReporter'; // Global bug reporter

const SIDEBAR_BREAKPOINT = 768;

function App() {
  // ============================================================================
  // APP STATE
  // ============================================================================
  const [user, setUser] = useState(null);         // Stores current user data
  const [loading, setLoading] = useState(true);   // Loading state while checking localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => (
    typeof window === 'undefined' ? true : window.innerWidth >= SIDEBAR_BREAKPOINT
  )); // Expanded on desktop, hidden on mobile

  const parseStoredUser = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const normalizeUserShape = (serverUser, fallbackUser = {}) => {
    const merged = { ...fallbackUser, ...(serverUser || {}) };
    const resolvedId = serverUser?._id || serverUser?.id || fallbackUser?._id || fallbackUser?.id;
    if (resolvedId) {
      merged._id = resolvedId;
      merged.id = resolvedId;
    }
    return merged;
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  // Sync authenticated user from server so admin-side edits are reflected.
  useEffect(() => {
    let isActive = true;

    const applyUser = (nextUser) => {
      if (!isActive) return;
      if (nextUser) {
        localStorage.setItem('user', JSON.stringify(nextUser));
        setUser(nextUser);
      } else {
        localStorage.removeItem('user');
        setUser(null);
      }
    };

    const syncCurrentUser = async ({ initial = false } = {}) => {
      const token = localStorage.getItem('token');
      const storedUser = parseStoredUser();

      if (!token) {
        applyUser(null);
        if (initial && isActive) setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          applyUser(null);
          if (initial && isActive) setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to sync user: ${response.status}`);
        }

        const payload = await response.json();
        const normalizedUser = normalizeUserShape(payload?.user, storedUser || {});
        applyUser(normalizedUser);
      } catch {
        // Fallback to locally cached user if network issues occur.
        if (storedUser) {
          setUser(storedUser);
        } else {
          applyUser(null);
        }
      } finally {
        if (initial && isActive) setLoading(false);
      }
    };

    syncCurrentUser({ initial: true });

    const onFocus = () => syncCurrentUser();
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        syncCurrentUser();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      isActive = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
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
      <SocketContextProvider authUser={user}>
        <BrowserRouter>
          <BugReporter />
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

            {/* ===== CONTACT PAGE ===== */}
            <Route
              path="/contact"
              element={<Contact />}
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
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />

            {/* School Analytics — teacher/hod/institute only */}
            <Route
              path="/school-analytics"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod']}>
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

            {/* Question Management (Consolidated Page) */}
            <Route
              path="/question-management"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <ManageQuestions />
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
                    <ProfileWithKey />
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

            {/* Student Classes Page */}
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <StudentClasses />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Student Class Detail View */}
            <Route
              path="/classes/:classId"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <StudentClassDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Student Material Detail View */}
            <Route
              path="/classes/:classId/material/:materialId"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <StudentMaterialDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Student Assignment Detail View */}
            <Route
              path="/classes/:classId/assignment/:assignmentId"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <StudentAssignmentDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Student Exam Detail View */}
            <Route
              path="/classes/:classId/exam/:examId"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <StudentExamDetail />
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
                    <TeacherClasses />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Batch Detail / Classroom Management Route */}
            <Route
              path="/teacher/batch/:batchId"
              element={
                <ProtectedRoute>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatchDetail />
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
                  <ExamQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:examId/institute" element={
                <ProtectedRoute>
                  <ExamQuestions />
                </ProtectedRoute>
              }
            />

            {/* ===== ROLE-BASED ROUTES ===== */}

            {/* Teacher / HOD Dashboard */}
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod']}>
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
                <ProtectedRoute requiredRoles={['teacher', 'hod']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatches />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Batch Detail / Classroom Management */}
            <Route
              path="/teacher/batch/:batchId"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatchDetail />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Class Material Form (New & Edit) */}
            <Route
              path="/teacher/batch/:batchId/materials/new"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatchMaterialForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/batch/:batchId/materials/edit/:materialId"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatchMaterialForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Class Assignment Form (New & Edit) */}
            <Route
              path="/teacher/batch/:batchId/assignments/new"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatchAssignmentForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/batch/:batchId/assignments/edit/:assignmentId"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherBatchAssignmentForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher Attendance */}
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'hod', 'institute']}>
                  <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                    <TeacherAttendance />
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

            {/* ===== INSTITUTE ROUTES ===== */}
            {/* All /institute/* routes now use the shared MainLayout + Sidebar */}
            <Route path="/institute/dashboard"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><InstituteDashboard /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/profile"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><InstituteProfile /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/departments"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><InstituteDepartments /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/department/:deptName"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><DepartmentDetail /></MainLayout></ProtectedRoute>}
            />
            <Route path="/hod/department/:deptName"
              element={<ProtectedRoute requiredRoles={['hod']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><DepartmentDetail /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/teachers"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><TeacherPanel /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/teacher/:id"
              element={<ProtectedRoute requiredRoles={['institute', 'hod']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><TeacherProfileView /></MainLayout></ProtectedRoute>}
            />
            <Route path="/hod/teacher/:id"
              element={<ProtectedRoute requiredRoles={['hod']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><TeacherProfileView /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/students"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><StudentPanel /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/theory"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><TheoryChecking /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/questions"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><QuestionChecker /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/join-requests"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><JoinRequestsPanel /></MainLayout></ProtectedRoute>}
            />
            <Route path="/institute/notifications"
              element={<ProtectedRoute requiredRoles={['institute', 'hod', 'teacher']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><InstituteNotifications /></MainLayout></ProtectedRoute>}
            />

            {/* ===== HOD DEPARTMENT ROUTES ===== */}
            <Route path="/hod/teachers"
              element={<ProtectedRoute requiredRoles={['hod', 'institute']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><HodDepartmentTeachers /></MainLayout></ProtectedRoute>}
            />
            <Route path="/hod/teacher/:teacherId"
              element={<ProtectedRoute requiredRoles={['hod', 'institute']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><TeacherPerformance /></MainLayout></ProtectedRoute>}
            />
            <Route path="/hod/content-review"
              element={<ProtectedRoute requiredRoles={['hod', 'institute']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><HodContentReview /></MainLayout></ProtectedRoute>}
            />
            <Route path="/hod/attendance"
              element={<ProtectedRoute requiredRoles={['hod', 'institute']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><HodAttendanceView /></MainLayout></ProtectedRoute>}
            />
            <Route path="/hod/feedback"
              element={<ProtectedRoute requiredRoles={['hod', 'institute']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><HodFeedbackOverview /></MainLayout></ProtectedRoute>}
            />

            {/* Institute — Teacher Performance (reuses same component) */}
            <Route path="/institute/teacher/:teacherId"
              element={<ProtectedRoute requiredRoles={['institute', 'hod']}><MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}><TeacherPerformance /></MainLayout></ProtectedRoute>}
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

import FloatingSocialButton from './components/student/FloatingSocialButton';
import NotificationBell from './components/shared/NotificationBell';

function MainLayout({ children, sidebarOpen, setSidebarOpen, onLogout }) {
  const location = useLocation();

  // Track last visited page for "Resume Last Session" on Dashboard
  useEffect(() => {
    const skip = ['/dashboard', '/login', '/signup', '/onboarding', '/admin'];
    if (!skip.some(p => location.pathname.startsWith(p))) {
      const pageNames = {
        '/problems': 'Practice Problems', '/theory': 'Theory', '/social': 'Social Feed',
        '/analytics': 'Analytics', '/contest': 'Contest', '/ask-ai': 'AI Assistant',
        '/leaderboard': 'Leaderboard', '/profile': 'Profile', '/messages': 'Messages',
        '/teacher-dashboard': 'Teacher Dashboard', '/question-paper': 'Question Paper',
        '/institute': 'Institute Panel', '/school-analytics': 'School Analytics',
        '/question-management': 'Question Bank', '/notifications': 'Notifications'
      };
      const label = Object.entries(pageNames).find(([k]) => location.pathname.startsWith(k));
      if (label) {
        localStorage.setItem('RANKLEN_last_page', JSON.stringify({ path: location.pathname, label: label[1], time: Date.now() }));
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < SIDEBAR_BREAKPOINT) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  // Adjust content margin based on sidebar state (desktop only)
  // On mobile, the sidebar sits OVER the content, so margin is 0.
  const contentMarginClass = sidebarOpen ? 'md:ml-[280px]' : 'md:ml-[80px]';

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#05000a] text-gray-900 dark:text-white transition-colors duration-300">
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
        <div className="md:hidden flex items-center justify-between mb-4 sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 -mx-4 -mt-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
               <button onClick={() => setSidebarOpen(true)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                 <FaBars />
               </button>
               <span className="font-bold text-lg text-gray-900 dark:text-white tracking-wide">RANKLEN</span>
            </div>
        </div>

        <div className="app-mobile-type">
          {children}
        </div>
      </div>

      {/* Floating Social Button — Bottom Right */}
      <FloatingSocialButton />

      {/* Notification Bell — Top Right (hidden on profile pages) */}
      {!location.pathname.startsWith('/profile') && <NotificationBell />}
    </div>
  );
}

export default App;
