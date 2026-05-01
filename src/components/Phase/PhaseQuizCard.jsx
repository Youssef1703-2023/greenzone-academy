import { Link } from 'react-router-dom';
import {
  ClipboardCheck, Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './PhaseQuizCard.css';

export default function PhaseQuizCard({ phase }) {
  const { language, t } = useLanguage();
  const isUnlocked = phase.quizUnlocked;
  const isPassed = phase.quizPassed;
  const quizRoute = `/courses/${phase.courseSlug}/phase/${phase.id}/quiz`;
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className={`quiz-card ${isUnlocked ? 'quiz-card--unlocked' : 'quiz-card--locked'}`}>
      <div className="quiz-card__header">
        <div className={`quiz-card__icon ${isUnlocked ? '' : 'quiz-card__icon--locked'}`}>
          {isUnlocked ? <ClipboardCheck size={24} /> : <Lock size={22} />}
        </div>
        <div>
          <h3 className="quiz-card__title">{t('common.phase')} {phase.id} {t('common.quiz')}</h3>
          {isPassed && (
            <span className="quiz-card__passed">
              <CheckCircle2 size={13} /> {t('common.passed')}
            </span>
          )}
        </div>
      </div>

      <p className="quiz-card__desc">
        {isUnlocked ? t('phasePage.allLessonsCompleted') : t('phasePage.completeLessonsToUnlock')}
      </p>

      <div className="quiz-card__req">
        <AlertCircle size={14} />
        <span>
          {isUnlocked
            ? t('phasePage.quizReadyMessage')
            : `${phase.completedLessons} / ${phase.totalLessons} ${t('phasePage.lessonsCompleted')}`}
        </span>
      </div>

      {isUnlocked ? (
        <Link to={quizRoute} className="btn btn-primary quiz-card__btn">
          {isPassed ? t('phasePage.retakeQuiz') : t('phasePage.startQuiz')}
          <ArrowIcon size={16} />
        </Link>
      ) : (
        <button className="quiz-card__btn quiz-card__btn--disabled" disabled>
          <Lock size={15} />
          {t('phasePage.lockedComplete')}
        </button>
      )}
    </div>
  );
}
