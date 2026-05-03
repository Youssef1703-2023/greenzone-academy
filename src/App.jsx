import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ScrollToTop from './components/UI/ScrollToTop/ScrollToTop';

import AdminRoute from './components/AdminRoute';

import './App.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage/DashboardPage'));
const CoursePage = lazy(() => import('./pages/CoursePage/CoursePage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage/CoursesPage'));
const PhasePage = lazy(() => import('./pages/PhasePage/PhasePage'));
const PhaseQuizPage = lazy(() => import('./pages/PhaseQuizPage/PhaseQuizPage'));
const LessonPage = lazy(() => import('./pages/LessonPage/LessonPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage/ProgressPage'));
const QuizzesPage = lazy(() => import('./pages/QuizzesPage/QuizzesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage/GlossaryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage'));

const AdminOverviewPage = lazy(() => import('./pages/Admin/AdminOverviewPage'));
const AdminCoursesPage = lazy(() => import('./pages/Admin/AdminCoursesPage'));
const AdminPhasesPage = lazy(() => import('./pages/Admin/AdminPhasesPage'));
const AdminLessonsPage = lazy(() => import('./pages/Admin/AdminLessonsPage'));
const AdminTranslationsPage = lazy(() => import('./pages/Admin/AdminTranslationsPage'));
const AdminQuizzesPage = lazy(() => import('./pages/Admin/AdminQuizzesPage'));
const AdminStudentsPage = lazy(() => import('./pages/Admin/AdminStudentsPage'));
const AdminScoresPage = lazy(() => import('./pages/Admin/AdminScoresPage'));
const AdminAuditLogPage = lazy(() => import('./pages/Admin/AdminAuditLogPage'));
const AdminSettingsPage = lazy(() => import('./pages/Admin/AdminSettingsPage'));

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

function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <div className="route-loader__mark"></div>
      <div>
        <p className="route-loader__eyebrow">Green Zone Academy</p>
        <p className="route-loader__text">Loading workspace...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="app">
            <ScrollAnimationObserver />
            <ScrollToTop />
            <Suspense fallback={<RouteLoader />}>
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
            </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
