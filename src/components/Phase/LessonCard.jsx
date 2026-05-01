import { Link } from 'react-router-dom';
import {
  CheckCircle2, PlayCircle, Lock, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LessonCard.css';

const statusConfig = {
  completed: {
    labelKey: 'common.completed',
    icon: CheckCircle2,
    className: 'lesson-card--completed',
    btnKey: 'common.review',
  },
  'in-progress': {
    labelKey: 'common.continue',
    icon: PlayCircle,
    className: 'lesson-card--active',
    btnKey: 'common.continue',
  },
  locked: {
    labelKey: 'common.locked',
    icon: Lock,
    className: 'lesson-card--locked',
    btnKey: 'common.locked',
  },
};

export default function LessonCard({ lesson, phaseId, courseSlug, index }) {
  const { language, t } = useLanguage();
  const config = statusConfig[lesson.status] || statusConfig.locked;
  const StatusIcon = config.icon;
  const isLocked = lesson.status === 'locked';
  const lessonRoute = `/courses/${courseSlug}/phase/${phaseId}/lesson/${lesson.id}`;
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div
      className={`lesson-card ${config.className}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Lesson Number */}
      <div className="lesson-card__number">
        {isLocked ? <Lock size={14} /> : lesson.id}
      </div>

      {/* Info */}
      <div className="lesson-card__info">
        <h4 className="lesson-card__title">
          <span className="lesson-card__label">{t('common.lesson')} {lesson.id}:</span>{' '}
          {lesson.title}
        </h4>
        <span className={`lesson-card__status lesson-card__status--${lesson.status}`}>
          <StatusIcon size={13} />
          {t(config.labelKey)}
        </span>
      </div>

      {/* Action */}
      <div className="lesson-card__action">
        {isLocked ? (
          <span className="lesson-card__locked-btn">
            <Lock size={14} />
          </span>
        ) : (
          <Link to={lessonRoute} className="lesson-card__btn">
            {t(config.btnKey)}
            <ArrowIcon size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
