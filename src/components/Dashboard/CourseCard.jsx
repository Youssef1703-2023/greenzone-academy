import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, ArrowRight, Layers, BookOpen, ClipboardCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './CourseCard.css';

export default function CourseCard({ course, currentPhaseTitle, continueRoute }) {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="course-card">
      <div className="course-card__glow"></div>
      <div className="course-card__content">
        <div className="course-card__header">
          <div className="course-card__icon">
            <Shield size={28} />
          </div>
          <div>
            <h3 className="course-card__title" dir="ltr">{course.title}</h3>
            <span className="course-card__badge">{t('dashboard.beginner')}</span>
          </div>
        </div>

        <p className="course-card__desc">{t('dashboard.courseDescription')}</p>

        <div className="course-card__stats">
          <div className="course-card__stat">
            <Layers size={15} />
            <span>{course.totalPhases} {t('common.phases')}</span>
          </div>
          <div className="course-card__stat">
            <BookOpen size={15} />
            <span>{course.totalLessons} {t('common.lessons')}</span>
          </div>
          <div className="course-card__stat">
            <ClipboardCheck size={15} />
            <span>{course.totalQuizzes} {t('common.quizzes')}</span>
          </div>
        </div>

        <div className="course-card__current">
          <span className="course-card__current-label">{t('dashboard.currentPhaseLabel')}</span>
          <span className="course-card__current-value" dir="auto">{currentPhaseTitle}</span>
        </div>

        <Link to={continueRoute || `/courses/${course.id || course.slug || 'cybersecurity-fundamentals'}`} className="btn btn-primary course-card__btn">
          {t('dashboard.continueCourse')}
          <ArrowIcon size={18} />
        </Link>
      </div>
    </div>
  );
}
