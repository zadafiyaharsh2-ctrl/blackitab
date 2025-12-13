import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API_URL from './config';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Social from './pages/Social';
import AI from './pages/AI';
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
import IDE from './pages/IDE';

import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';


function App() {
  console.log('🚀 app initialized using api url:', API_URL);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

        {/* ===== PUBLIC ROUTES ===== */}
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

        {/* ===== PROTECTED ROUTES WITH SIDEBAR ===== */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

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

        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                <AI />
              </MainLayout>
            </ProtectedRoute>
          }
        />

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

        {/* ===== THEORY PAGE ===== */}
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

        {/* ===== IDE PAGE ===== */}
        <Route
          path="/ide"
          element={
            <ProtectedRoute>
              <MainLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={handleLogout}>
                <IDE />
              </MainLayout>
            </ProtectedRoute>
          }
        />

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

        {/* ===== SUBJECT PAGE (DYNAMIC PAGE) ===== */}
       

        {/* ===== DEFAULT REDIRECT ===== */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

/* ===== Layout Wrapper Component ===== */
function MainLayout({ children, sidebarOpen, setSidebarOpen, onLogout }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar onLogout={onLogout} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} p-6`}>
        {children}
      </div>
    </div>
  );
}

export default App;
