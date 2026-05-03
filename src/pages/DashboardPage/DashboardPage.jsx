import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import DashboardHeader from '../../components/Dashboard/DashboardHeader';
import StatCards from '../../components/Dashboard/StatCards';
import ProgressBar from '../../components/Dashboard/ProgressBar';
import CourseCard from '../../components/Dashboard/CourseCard';
import CurrentPhaseCard from '../../components/Dashboard/CurrentPhaseCard';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import QuickActions from '../../components/Dashboard/QuickActions';
import Skeleton from '../../components/UI/Skeleton/Skeleton';
import {
  mockCourse,
  mockProgress,
  mockRecentActivity,
  mockQuickActions,
} from '../../data/dashboardData';
import { fetchStudentCourseExperience } from '../../services/supabaseStudentService';
import './DashboardPage.css';

function buildDashboardState(course) {
  return {
    course,
    progress: {
      overallProgress: course.progress,
      completedLessons: course.completedLessons || 0,
      totalLessons: course.totalLessons,
      latestQuizScore: course.latestQuizScore,
      currentPhase: course.currentPhase || 1,
      currentPhaseTitle: course.currentPhaseTitle || 'Cybersecurity Introduction',
      currentPhaseLessons: course.currentPhaseLessons || 0,
      currentPhaseCompletedLessons: course.currentPhaseCompletedLessons || 0,
      currentPhaseStatus: course.currentPhaseStatus || 'In Progress',
    },
    recentActivity: [
      {
        id: 'continue',
        type: 'lesson',
        text: `Ready to continue: ${course.currentPhaseTitle || course.title}`,
        time: course.source === 'supabase' ? 'Live from Supabase' : 'Local fallback',
      },
      {
        id: 'progress',
        type: 'phase',
        text: `${course.completedLessons || 0} of ${course.totalLessons} lessons completed`,
        time: `${course.progress || 0}% complete`,
      },
    ],
    quickActions: mockQuickActions.map((action) => {
      if (action.id === 'continue') return { ...action, route: course.continueRoute || `/courses/${course.slug || course.id}` };
      if (action.id === 'course') return { ...action, route: `/courses/${course.slug || course.id}` };
      return action;
    }),
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState(() => buildDashboardState({
    ...mockCourse,
    ...mockProgress,
    slug: mockCourse.id,
    progress: mockProgress.overallProgress,
    completedLessons: mockProgress.completedLessons,
    continueRoute: `/courses/${mockCourse.id}/phase/${mockProgress.currentPhase}`,
  }));
  const displayName = user?.name === 'Student' ? t('common.student') : user?.name || t('common.student');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const liveCourse = await fetchStudentCourseExperience('cybersecurity-fundamentals');
        if (mounted) setDashboard(buildDashboardState(liveCourse));
      } catch {
        if (mounted) {
          setDashboard({
            course: mockCourse,
            progress: mockProgress,
            recentActivity: mockRecentActivity,
            quickActions: mockQuickActions.map(action => 
              action.id === 'continue' 
                ? { ...action, route: `/courses/${mockCourse.id}/phase/${mockProgress.currentPhase}` }
                : action
            ),
          });
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StudentLayout>
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Skeleton type="text" width="200px" height="24px" />
              <Skeleton type="text" width="300px" height="16px" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <Skeleton type="card" height="100px" />
            <Skeleton type="card" height="100px" />
            <Skeleton type="card" height="100px" />
            <Skeleton type="card" height="100px" />
          </div>
          <Skeleton type="card" height="40px" />
          <div className="dashboard__grid">
            <div className="dashboard__main" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Skeleton type="card" height="280px" />
              <Skeleton type="card" height="160px" />
            </div>
            <div className="dashboard__sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <Skeleton type="card" height="220px" />
              <Skeleton type="card" height="300px" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <DashboardHeader userName={displayName} />

      {user?.role === 'admin' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--accent)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent)'}}>
            <Shield size={24} />
            <h2 style={{fontSize: '1.25rem', fontWeight: '800', margin: 0}}>{t('dashboard.adminAccess')}</h2>
          </div>
          <p style={{color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0}}>
            {t('dashboard.adminAccessDescription')}
          </p>
          <div style={{marginTop: '8px'}}>
            <Link to="/admin" className="btn btn-primary" style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}>
              <Shield size={18} />
              {t('dashboard.openAdminPanel')}
            </Link>
          </div>
        </div>
      )}

      <StatCards progress={dashboard.progress} />

      <ProgressBar
        title={t('dashboard.courseProgress')}
        progress={dashboard.progress.overallProgress}
      />

      {/* Two-column layout: Course + Quick Actions | Phase + Activity */}
      <div className="dashboard__grid">
        <div className="dashboard__main">
          <CourseCard
            course={dashboard.course}
            currentPhaseTitle={dashboard.progress.currentPhaseTitle}
            continueRoute={dashboard.course.continueRoute}
          />
          <QuickActions actions={dashboard.quickActions} />
        </div>

        <div className="dashboard__sidebar">
          <CurrentPhaseCard progress={dashboard.progress} courseSlug={dashboard.course.slug || dashboard.course.id} />
          <RecentActivity activities={dashboard.recentActivity} />
        </div>
      </div>
      </>
      )}
    </StudentLayout>
  );
}
