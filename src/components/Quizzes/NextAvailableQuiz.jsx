import { Link } from 'react-router-dom';
import { PlayCircle, ArrowLeft, ArrowRight, Lock, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './NextAvailableQuiz.css';

export default function NextAvailableQuiz({ nextQuiz, nextPhase }) {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  if (!nextQuiz && !nextPhase) {
    return (
      <div className="next-quiz-card next-quiz-card--completed">
        <div className="next-quiz-card__icon">
          <Award size={32} />
        </div>
        <div className="next-quiz-card__content">
          <h3 className="next-quiz-card__title">{t('quizzesPage.allPassed')}</h3>
          <p className="next-quiz-card__message">{t('quizzesPage.allPassedMessage')}</p>
        </div>
      </div>
    );
  }

  if (nextQuiz && (nextQuiz.status === 'ready' || nextQuiz.status === 'failed')) {
    const isRetry = nextQuiz.status === 'failed';
    return (
      <div className="next-quiz-card next-quiz-card--ready">
        <div className="next-quiz-card__icon">
          <PlayCircle size={32} />
        </div>
        <div className="next-quiz-card__content">
          <span className="next-quiz-card__label">{t('quizzesPage.nextAvailable')}</span>
          <h3 className="next-quiz-card__title">
            {isRetry ? `${t('quizzesPage.retryQuiz')} - ${t('common.phase')} ${nextQuiz.phaseId}` : `${t('common.phase')} ${nextQuiz.phaseId} ${t('common.quiz')}`}
          </h3>
          <p className="next-quiz-card__message">
            {isRetry ? t('quizzesPage.retryQuiz') : t('phasePage.allLessonsCompleted')}
          </p>
        </div>
        <div className="next-quiz-card__action">
          <Link to={nextQuiz.route} className="btn btn-primary next-quiz-card__btn next-quiz-card__btn--glow">
            {isRetry ? t('quizzesPage.retryQuiz') : t('quizzesPage.startQuiz')}
            <ArrowIcon size={18} />
          </Link>
        </div>
      </div>
    );
  }

  if (nextPhase) {
    return (
      <div className="next-quiz-card next-quiz-card--locked">
        <div className="next-quiz-card__icon">
          <Lock size={32} />
        </div>
        <div className="next-quiz-card__content">
          <span className="next-quiz-card__label">{t('quizzesPage.nextAvailable')}</span>
          <h3 className="next-quiz-card__title">{t('quizzesPage.noQuizAvailable')}</h3>
          <p className="next-quiz-card__message">{t('quizzesPage.continuePhaseLessons')}</p>
        </div>
        <div className="next-quiz-card__action">
          <Link to={`/courses/cybersecurity-fundamentals/phase/${nextPhase.id}`} className="btn btn-secondary next-quiz-card__btn">
            {t('dashboard.continueLearning')}
            <ArrowIcon size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
