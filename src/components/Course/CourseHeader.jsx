import { Link } from 'react-router-dom';
import { Shield, Layers, BookOpen, ClipboardCheck, Award, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './CourseHeader.css';

export default function CourseHeader({ course }) {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="course-header">
      <div className="course-header__glow"></div>

      <div className="course-header__content">
        <div className="course-header__top">
          <div className="course-header__icon">
            <Shield size={32} />
          </div>
          <span className="course-header__difficulty">{t('common.beginner')}</span>
        </div>

        <h1 className="course-header__title" dir="ltr">{course.title}</h1>
        <p className="course-header__desc">{t('dashboard.courseDescription')}</p>

        {/* Badges */}
        <div className="course-header__badges">
          {course.badges.map((badge) => (
            <span className="course-header__badge" key={badge}>{badge}</span>
          ))}
        </div>

        {/* Stats Row */}
        <div className="course-header__stats">
          <div className="course-header__stat">
            <Layers size={16} />
            <span>{course.totalPhases} {t('common.phases')}</span>
          </div>
          <div className="course-header__stat">
            <BookOpen size={16} />
            <span>{course.totalLessons} {t('common.lessons')}</span>
          </div>
          <div className="course-header__stat">
            <ClipboardCheck size={16} />
            <span>{course.totalQuizzes} {t('common.quizzes')}</span>
          </div>
          {course.hasFinalExam && (
            <div className="course-header__stat">
              <Award size={16} />
              <span>{t('common.finalExam')}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="course-header__progress">
          <div className="course-header__progress-info">
            <span>{t('coursePage.overallProgress')}</span>
            <span className="course-header__progress-value">{course.progress}%</span>
          </div>
          <div className="course-header__progress-bar">
            <div
              className="course-header__progress-fill"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>

        <Link to={`/courses/${course.slug}/phase/1`} className="btn btn-primary course-header__btn">
          {t('coursePage.continueCourse')}
          <ArrowIcon size={18} />
        </Link>
      </div>

      {/* Decorative Visual */}
      <div className="course-header__visual">
        <div className="course-header__ring course-header__ring--1"></div>
        <div className="course-header__ring course-header__ring--2"></div>
        <div className="course-header__ring course-header__ring--3"></div>
        <div className="course-header__shield">
          <Shield size={56} />
        </div>
      </div>
    </section>
  );
}
