import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import CoursePage from './pages/CoursePage/CoursePage';
import CoursesPage from './pages/CoursesPage/CoursesPage';
import PhasePage from './pages/PhasePage/PhasePage';
import PhaseQuizPage from './pages/PhaseQuizPage/PhaseQuizPage';
import LessonPage from './pages/LessonPage/LessonPage';
import ProgressPage from './pages/ProgressPage/ProgressPage';
import QuizzesPage from './pages/QuizzesPage/QuizzesPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import GlossaryPage from './pages/GlossaryPage/GlossaryPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ScrollToTop from './components/UI/ScrollToTop/ScrollToTop';

// Admin imports
import AdminRoute from './components/AdminRoute';
import AdminOverviewPage from './pages/Admin/AdminOverviewPage';
import AdminCoursesPage from './pages/Admin/AdminCoursesPage';
import AdminPhasesPage from './pages/Admin/AdminPhasesPage';
import AdminLessonsPage from './pages/Admin/AdminLessonsPage';
import AdminTranslationsPage from './pages/Admin/AdminTranslationsPage';
import AdminQuizzesPage from './pages/Admin/AdminQuizzesPage';
import AdminStudentsPage from './pages/Admin/AdminStudentsPage';
import AdminScoresPage from './pages/Admin/AdminScoresPage';
import AdminAuditLogPage from './pages/Admin/AdminAuditLogPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';

import './App.css';

function ScrollAnimationObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="app">
            <ScrollAnimationObserver />
            <ScrollToTop />
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <QuizzesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/glossary"
              element={
                <ProtectedRoute>
                  <GlossaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug"
              element={
                <ProtectedRoute>
                  <CoursePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug/phase/:phaseId"
              element={
                <ProtectedRoute>
                  <PhasePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug/phase/:phaseId/lesson/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug/phase/:phaseId/quiz"
              element={
                <ProtectedRoute>
                  <PhaseQuizPage />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminOverviewPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <AdminRoute>
                  <AdminCoursesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/phases"
              element={
                <AdminRoute>
                  <AdminPhasesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/lessons"
              element={
                <AdminRoute>
                  <AdminLessonsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/translations"
              element={
                <AdminRoute>
                  <AdminTranslationsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/quizzes"
              element={
                <AdminRoute>
                  <AdminQuizzesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <AdminRoute>
                  <AdminStudentsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/scores"
              element={
                <AdminRoute>
                  <AdminScoresPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/audit-log"
              element={
                <AdminRoute>
                  <AdminAuditLogPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              }
            />
            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
