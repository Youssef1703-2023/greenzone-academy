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
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const displayName = user?.name === 'Student' ? t('common.student') : user?.name || t('common.student');

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
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

      <StatCards progress={mockProgress} />

      <ProgressBar
        title={t('dashboard.courseProgress')}
        progress={mockProgress.overallProgress}
      />

      {/* Two-column layout: Course + Quick Actions | Phase + Activity */}
      <div className="dashboard__grid">
        <div className="dashboard__main">
          <CourseCard
            course={mockCourse}
            currentPhaseTitle={mockProgress.currentPhaseTitle}
          />
          <QuickActions actions={mockQuickActions.map(action => 
            action.id === 'continue' 
              ? { ...action, route: `/courses/${mockCourse.id}/phase/${mockProgress.currentPhase}` }
              : action
          )} />
        </div>

        <div className="dashboard__sidebar">
          <CurrentPhaseCard progress={mockProgress} />
          <RecentActivity activities={mockRecentActivity} />
        </div>
      </div>
      </>
      )}
    </StudentLayout>
  );
}
