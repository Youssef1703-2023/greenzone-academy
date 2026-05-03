import { Link } from 'react-router-dom';
import {
  BookOpen, ClipboardCheck, Lock,
  ArrowLeft, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './PhaseCard.css';

const statusConfig = {
  'completed': {
    labelKey: 'common.completed',
    icon: CheckCircle2,
    className: 'phase-card--completed',
  },
  'in-progress': {
    labelKey: 'common.inProgress',
    icon: Clock,
    className: 'phase-card--active',
  },
  'locked': {
    labelKey: 'common.locked',
    icon: Lock,
    className: 'phase-card--locked',
  },
};

export default function PhaseCard({ phase, index, courseSlug = 'cybersecurity-fundamentals' }) {
  const { language, t } = useLanguage();
  const config = statusConfig[phase.status] || statusConfig['locked'];
  const StatusIcon = config.icon;
  const isLocked = phase.locked;
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div
      className={`phase-card ${config.className}`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Phase Number Badge */}
      <div className="phase-card__number">
        {isLocked ? <Lock size={16} /> : phase.id}
      </div>

      <div className="phase-card__body">
        <div className="phase-card__header">
          <h3 className="phase-card__title">
            <span className="phase-card__phase-label">{t('common.phase')} {phase.id}:</span>{' '}
            {phase.title}
          </h3>
          <span className={`phase-card__status phase-card__status--${phase.status}`}>
            <StatusIcon size={13} />
            {t(config.labelKey)}
          </span>
        </div>

        {/* Meta */}
        <div className="phase-card__meta">
          <div className="phase-card__meta-item">
            <BookOpen size={14} />
            <span>{phase.lessonsCount} {t('common.lessons')}</span>
          </div>
          <div className="phase-card__meta-item">
            <ClipboardCheck size={14} />
            <span>{phase.quizPassed ? t('coursePage.quizPassed') : t('coursePage.quizRequired')}</span>
          </div>
          {!isLocked && phase.status === 'in-progress' && (
            <div className="phase-card__meta-item phase-card__meta-item--progress">
              <span>{phase.completedLessons}/{phase.lessonsCount} {t('dashboard.completed')}</span>
            </div>
          )}
        </div>

        {/* Progress Bar (only for active/completed) */}
        {!isLocked && (
          <div className="phase-card__progress">
            <div
              className="phase-card__progress-fill"
              style={{ width: `${phase.progress}%` }}
            ></div>
          </div>
        )}

        {/* Action */}
        <div className="phase-card__action">
          {isLocked ? (
            <span className="phase-card__locked-text">
              <Lock size={14} />
              {t('coursePage.unlockPrevious')}
            </span>
          ) : (
            <Link
              to={`/courses/${courseSlug}/phase/${phase.id}`}
              className="btn btn-primary phase-card__btn"
            >
              {phase.status === 'completed' ? t('coursePage.reviewPhase') : t('coursePage.viewPhase')}
              <ArrowIcon size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
