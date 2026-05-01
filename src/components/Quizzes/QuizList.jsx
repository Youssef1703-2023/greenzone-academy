import { Link } from 'react-router-dom';
import { Lock, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './QuizList.css';

export default function QuizList({ quizzes }) {
  const { t } = useLanguage();

  const statusText = (status) => ({
    locked: t('common.locked'),
    passed: t('common.passed'),
    ready: t('common.ready'),
    failed: t('common.failed'),
  }[status] || status);

  return (
    <div className="quiz-list">
      <h3 className="quiz-list__header">{t('quizzesPage.allPhaseQuizzes')}</h3>

      <div className="quiz-list__grid">
        {quizzes.map((quiz) => {
          const isLocked = quiz.status === 'locked';
          const isPassed = quiz.status === 'passed';
          const isReady = quiz.status === 'ready';
          const isFailed = quiz.status === 'failed';

          return (
            <div key={quiz.id} className={`quiz-list-item quiz-list-item--${quiz.status}`}>
              <div className="quiz-list-item__icon">
                {isPassed && <CheckCircle2 size={24} />}
                {(isReady || isFailed) && <FileText size={24} />}
                {isLocked && <Lock size={24} />}
              </div>

              <div className="quiz-list-item__content">
                <div className="quiz-list-item__title-row">
                  <h4 className="quiz-list-item__title">{t('common.phase')} {quiz.phaseId} {t('common.quiz')}</h4>
                  <span className={`quiz-list-item__badge quiz-list-item__badge--${quiz.status}`}>
                    {statusText(quiz.status)}
                  </span>
                </div>

                <p className="quiz-list-item__rule">
                  {isFailed
                    ? `${t('quizzesPage.retryQuiz')} - ${t('common.phase')} ${quiz.phaseId}`
                    : isPassed
                      ? `${t('common.passed')} ${quiz.score || 100}%`
                      : `${t('phasePage.completeLessonsToUnlock')}`}
                </p>

                <div className="quiz-list-item__stats">
                  <span>{t('common.score')}: {quiz.score !== null ? `${quiz.score}%` : '-'}</span>
                  <span>{t('common.quiz')}: {quiz.attempts}</span>
                </div>
              </div>

              <div className="quiz-list-item__action">
                {isReady && (
                  <Link to={quiz.route} className="btn btn-primary quiz-list-btn">{t('quizzesPage.startQuiz')}</Link>
                )}
                {isPassed && (
                  <Link to={`/courses/cybersecurity-fundamentals/phase/${quiz.phaseId}`} className="btn btn-secondary quiz-list-btn">{t('coursePage.reviewPhase')}</Link>
                )}
                {isFailed && (
                  <Link to={quiz.route} className="btn btn-primary quiz-list-btn">{t('quizzesPage.retryQuiz')}</Link>
                )}
                {isLocked && (
                  <button className="btn btn-secondary quiz-list-btn" disabled>{t('common.locked')}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
