import { BookOpen, Clock, CheckCircle2, PlayCircle, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LessonHeader.css';

export default function LessonHeader({ phase, lesson, overview }) {
  const { t } = useLanguage();
  const isCompleted = lesson.status === 'completed';
  const isLocked = lesson.status === 'locked';

  return (
    <div className={`lesson-header ${isCompleted ? 'lesson-header--completed' : ''}`}>
      <div className="lesson-header__top">
        <span className="lesson-header__phase-badge">{t('common.phase')} {phase.id}</span>
        
        <span className={`lesson-header__status lesson-header__status--${lesson.status}`}>
          {isCompleted ? (
            <><CheckCircle2 size={13} /> {t('common.completed')}</>
          ) : isLocked ? (
            <><Lock size={13} /> {t('common.locked')}</>
          ) : (
            <><PlayCircle size={13} /> {t('common.inProgress')}</>
          )}
        </span>
      </div>

      <h1 className="lesson-header__title">
        <span className="lesson-header__label">{t('common.lesson')} {lesson.id}:</span> {lesson.title}
      </h1>
      <p className="lesson-header__subtitle">
        {overview || 'Content placeholder. Real lesson content will be added later.'}
      </p>

      <div className="lesson-header__stats">
        <div className="lesson-header__stat">
          <BookOpen size={16} />
          <span>{t('common.lesson')} {lesson.id} / {phase.totalLessons}</span>
        </div>
        <div className="lesson-header__stat">
          <Clock size={16} />
          <span>10 min</span>
        </div>
      </div>

      <div className="lesson-header__progress">
        <div className="lesson-header__progress-info">
          <span>{t('phasePage.phaseProgress')}</span>
          <span className="lesson-header__progress-value">{phase.progress}%</span>
        </div>
        <div className="lesson-header__progress-bar">
          <div
            className="lesson-header__progress-fill"
            style={{ width: `${phase.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
