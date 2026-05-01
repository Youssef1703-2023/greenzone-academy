import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Award, BookOpen, ClipboardCheck, FileText, Gauge, Languages,
  Layers, Plus, RefreshCw, Settings, ShieldCheck, Users,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { getAdminOverviewStats } from '../../services/adminStatsService';
import { formatAdminValue, AdminErrorState, AdminPageHeader } from './AdminShared';
import './AdminPages.css';

const groups = [
  {
    key: 'content',
    icon: BookOpen,
    color: 'blue',
    metrics: ['totalCourses', 'totalPhases', 'totalLessons', 'totalQuizzes', 'publishedLessons', 'draftLessons'],
  },
  {
    key: 'students',
    icon: Users,
    color: 'cyan',
    metrics: ['totalStudents', 'activeStudents', 'disabledStudents', 'newStudentsThisWeek'],
  },
  {
    key: 'progress',
    icon: Gauge,
    color: 'green',
    metrics: ['averageCourseProgress', 'averageLessonsCompleted', 'studentsCompletedPhase1', 'studentsInProgress', 'studentsNotStarted'],
    percentMetrics: new Set(['averageCourseProgress']),
  },
  {
    key: 'quizzes',
    icon: Award,
    color: 'yellow',
    metrics: ['totalAttempts', 'passedAttempts', 'failedAttempts', 'averageScore', 'highestScore', 'lowestScore', 'passRate'],
    percentMetrics: new Set(['averageScore', 'highestScore', 'lowestScore', 'passRate']),
  },
];

const quickActions = [
  { labelKey: 'admin.addCourse', to: '/admin/courses', icon: Plus },
  { labelKey: 'admin.addPhase', to: '/admin/phases', icon: Layers },
  { labelKey: 'admin.addLesson', to: '/admin/lessons', icon: FileText },
  { labelKey: 'admin.addQuiz', to: '/admin/quizzes', icon: ClipboardCheck },
  { labelKey: 'admin.viewStudents', to: '/admin/students', icon: Users },
  { labelKey: 'admin.viewScores', to: '/admin/scores', icon: Award },
  { labelKey: 'admin.manageTranslations', to: '/admin/translations', icon: Languages },
  { labelKey: 'admin.reviewDraftContent', to: '/admin/lessons?status=Draft', icon: ShieldCheck },
];

const emptyOverview = {
  content: {},
  students: {},
  progress: {},
  quizzes: {},
  contentHealth: {},
  recentActivity: [],
  health: {},
};

export default function AdminOverviewPage() {
  const { language, t } = useLanguage();
  const [overview, setOverview] = useState(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getAdminOverviewStats()
      .then((stats) => {
        if (mounted) setOverview(stats);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError?.message || t('admin.backendUnavailable'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader
          title={t('admin.dashboard')}
          subtitle={t('admin.dashboardSubtitle')}
          actions={(
            <Link to="/admin/settings" className="btn btn-secondary">
              <Settings size={16} />
              {t('admin.settings')}
            </Link>
          )}
        />

        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {error && <AdminErrorState message={error} />}

        <section className="admin-overview-groups">
          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <article className="admin-metric-group" key={group.key}>
                <div className="admin-metric-group__header">
                  <div className={`admin-stat-card__icon admin-stat-card__icon--${group.color}`}>
                    <Icon size={20} />
                  </div>
                  <h2>{t(`admin.${group.key}Overview`)}</h2>
                </div>
                <div className="admin-metric-group__grid">
                  {group.metrics.map((metric) => (
                    <div className="admin-mini-stat" key={metric}>
                      <span>{t(`admin.${metric}`)}</span>
                      <strong>
                        {formatAdminValue(
                          overview[group.key]?.[metric],
                          language,
                          group.percentMetrics?.has(metric) ? '%' : '',
                        )}
                      </strong>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </section>

        <section className="admin-dashboard-grid">
          <article className="admin-panel">
            <div className="admin-panel__header">
              <h2>{t('admin.recentActivity')}</h2>
              <Activity size={18} />
            </div>
            {overview.recentActivity?.length ? (
              <div className="admin-activity-list">
                {overview.recentActivity.map((item) => (
                  <div className="admin-activity-item" key={item.id}>
                    <span>{item.type}</span>
                    <strong>{item.label}</strong>
                    <small>{item.createdAt}</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-empty-state">{t('admin.noRecentActivity')}</div>
            )}
          </article>

          <article className="admin-panel">
            <div className="admin-panel__header">
              <h2>{t('admin.quickActions')}</h2>
              <RefreshCw size={18} />
            </div>
            <div className="admin-actions-grid admin-actions-grid--compact">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link to={action.to} className="admin-action-card" key={action.labelKey}>
                    <Icon size={20} />
                    <span>{t(action.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          </article>
        </section>

        <section className="admin-dashboard-grid">
          <article className="admin-panel">
            <div className="admin-panel__header">
              <h2>{t('admin.contentHealth')}</h2>
              <FileText size={18} />
            </div>
            <div className="admin-health-grid">
              {Object.entries(overview.contentHealth || {}).map(([key, value]) => (
                <div className="admin-mini-stat" key={key}>
                  <span>{t(`admin.${key}`)}</span>
                  <strong>{formatAdminValue(value, language)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel__header">
              <h2>{t('admin.systemHealth')}</h2>
              <ShieldCheck size={18} />
            </div>
            <div className="admin-health-grid">
              {['authStatus', 'dataSource', 'translationMode', 'googleTranslateConfigured', 'databaseConnected', 'lastRefreshTime'].map((key) => (
                <div className="admin-mini-stat" key={key}>
                  <span>{t(`admin.${key}`)}</span>
                  <strong>
                    {typeof overview.health?.[key] === 'boolean'
                      ? t(overview.health[key] ? 'admin.yes' : 'admin.no')
                      : formatAdminValue(overview.health?.[key], language)}
                  </strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </AdminLayout>
  );
}
