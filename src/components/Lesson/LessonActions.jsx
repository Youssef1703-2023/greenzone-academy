import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LessonActions.css';

export default function LessonActions({ lesson, courseSlug, phaseId, nextLessonId, onMarkCompleted, allLessonsCompleted }) {
  const { language, t } = useLanguage();
  const isCompleted = lesson.status === 'completed';
  const isLocked = lesson.status === 'locked';
  const isLastLesson = !nextLessonId;
  const ForwardIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="lesson-actions">
      {/* Mark Completed Button */}
      {isCompleted ? (
        <button className="btn lesson-actions__btn lesson-actions__btn--completed" disabled>
          <CheckCircle size={18} />
          {t('lesson.completed')}
        </button>
      ) : isLocked ? (
        <button className="btn lesson-actions__btn lesson-actions__btn--locked" disabled>
          <Lock size={18} />
          {t('lesson.completePrevious')}
        </button>
      ) : (
        <button 
          className="btn lesson-actions__btn lesson-actions__btn--mark"
          onClick={onMarkCompleted}
        >
          <CheckCircle size={18} />
          {t('lesson.markCompleted')}
        </button>
      )}

      {/* Navigation or CTA */}
      {isLastLesson && allLessonsCompleted ? (
        <div className="lesson-actions__cta">
          <h3 className="lesson-actions__cta-title">{t('lesson.lessonsCompletedTitle', { phaseId })}</h3>
          <p className="lesson-actions__cta-message">
            {t('lesson.lessonsCompletedMessage')}
          </p>
          <div className="lesson-actions__nav">
            <Link
              to={`/courses/${courseSlug}/phase/${phaseId}`}
              className="btn lesson-actions__btn lesson-actions__btn--secondary"
            >
              <BackIcon size={16} />
              {t('lesson.backToPhase')}
            </Link>
            <Link
              to={`/courses/${courseSlug}/phase/${phaseId}/quiz`}
              className="btn btn-primary lesson-actions__btn lesson-actions__btn--glow"
            >
              {t('lesson.takePhaseQuiz')}
              <ForwardIcon size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="lesson-actions__nav">
          <Link
            to={`/courses/${courseSlug}/phase/${phaseId}`}
            className="btn lesson-actions__btn lesson-actions__btn--secondary"
          >
            <BackIcon size={16} />
            {t('lesson.backToPhase')}
          </Link>
          
          {nextLessonId && !isLocked ? (
            <Link
              to={`/courses/${courseSlug}/phase/${phaseId}/lesson/${nextLessonId}`}
              className="btn btn-primary lesson-actions__btn"
            >
              {t('lesson.nextLesson')}
              <ForwardIcon size={16} />
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
