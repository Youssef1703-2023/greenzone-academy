import { Link } from 'react-router-dom';
import {
  BookOpen, Layers, ClipboardCheck, Award,
  ArrowRight, TrendingUp, Sparkles, Clock,
} from 'lucide-react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import { courseCatalog } from '../../data/catalogData';
import { useLanguage } from '../../context/LanguageContext';
import './CoursesPage.css';

export default function CoursesPage() {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowRight;
  const statusLabels = {
    'not-started': t('common.notStarted'),
    'in-progress': t('common.inProgress'),
    'completed': t('common.completed'),
  };

  return (
    <StudentLayout>
      {/* Page Header */}
      <section className="courses-page__header">
        <div className="courses-page__header-text">
          <div className="courses-page__tag">
            <Sparkles size={16} />
            <span>{t('coursesPage.tag')}</span>
          </div>
          <h1 className="courses-page__title">
            {t('coursesPage.titlePrefix')} <span className="accent">{t('coursesPage.titleAccent')}</span>
          </h1>
          <p className="courses-page__subtitle">
            {t('coursesPage.subtitle')}
          </p>
        </div>
      </section>

      {/* Course Cards Grid */}
      <div className="courses-grid">
        {/* Real course cards */}
        {courseCatalog.map((course) => (
          <div className="catalog-card" key={course.id}>
            <div className="catalog-card__glow"></div>

            <div className="catalog-card__content">
              {/* Top */}
              <div className="catalog-card__top">
                <div className="catalog-card__icon">
                  <BookOpen size={26} />
                </div>
                <div className="catalog-card__badges">
                  <span className="catalog-card__difficulty">{t('common.beginner')}</span>
                  <span className={`catalog-card__status catalog-card__status--${course.status}`}>
                    {statusLabels[course.status]}
                  </span>
                </div>
              </div>

              {/* Title & Desc */}
              <h2 className="catalog-card__title" dir="ltr">{course.title}</h2>
              <p className="catalog-card__desc">{t('dashboard.courseDescription')}</p>

              {/* Stats */}
              <div className="catalog-card__stats">
                <div className="catalog-card__stat">
                  <Layers size={15} />
                  <span>{course.totalPhases} {t('common.phases')}</span>
                </div>
                <div className="catalog-card__stat">
                  <BookOpen size={15} />
                  <span>{course.totalLessons} {t('common.lessons')}</span>
                </div>
                <div className="catalog-card__stat">
                  <ClipboardCheck size={15} />
                  <span>{course.totalQuizzes} {t('common.quizzes')}</span>
                </div>
                {course.hasFinalExam && (
                  <div className="catalog-card__stat">
                    <Award size={15} />
                    <span>{t('common.finalExam')}</span>
                  </div>
                )}
              </div>

              {/* Progress (if enrolled) */}
              {course.enrolled && (
                <div className="catalog-card__progress">
                  <div className="catalog-card__progress-header">
                    <TrendingUp size={14} />
                    <span>{t('common.progress')}</span>
                    <span className="catalog-card__progress-value">{course.progress}%</span>
                  </div>
                  <div className="catalog-card__progress-bar">
                    <div
                      className="catalog-card__progress-fill"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action */}
              <Link
                to={`/courses/${course.slug}`}
                className="btn btn-primary catalog-card__btn"
              >
                {course.enrolled ? t('coursesPage.openCourse') : t('common.enrollNow')}
                <ArrowIcon size={18} />
              </Link>
            </div>
          </div>
        ))}

        {/* Coming Soon Card */}
        <div className="catalog-card catalog-card--coming-soon">
          <div className="catalog-card__content">
            <div className="catalog-card__top">
              <div className="catalog-card__icon catalog-card__icon--muted">
                <Clock size={26} />
              </div>
              <span className="catalog-card__coming-badge">{t('common.comingSoon')}</span>
            </div>

            <h2 className="catalog-card__title">{t('coursesPage.moreComing')}</h2>
            <p className="catalog-card__desc">
              {t('coursesPage.moreDesc')}
            </p>

            {/* Placeholder Stats */}
            <div className="catalog-card__stats">
              <div className="catalog-card__stat">
                <Layers size={15} />
                <span>{t('coursesPage.multiplePaths')}</span>
              </div>
              <div className="catalog-card__stat">
                <BookOpen size={15} />
                <span>{t('coursesPage.newLessons')}</span>
              </div>
              <div className="catalog-card__stat">
                <Award size={15} />
                <span>{t('coursesPage.certifications')}</span>
              </div>
            </div>

            {/* Disabled Button */}
            <button className="btn catalog-card__btn catalog-card__btn--disabled" disabled>
              <Clock size={16} />
              {t('common.comingSoon')}
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
