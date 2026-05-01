import { CheckCircle2, Lock, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './QuizPerformance.css';

export default function QuizPerformance({ phases }) {
  const { t } = useLanguage();
  // Extract quiz info from phases
  const quizzes = phases.map(phase => {
    return {
      phaseId: phase.id,
      title: `${t('common.phase')} ${phase.id} ${t('common.quiz')}`,
      status: phase.quizPassed ? 'passed' : phase.locked ? 'locked' : 'pending',
      score: phase.quizPassed ? 80 : null, // Mock score if we don't have it tracked here
      date: phase.quizPassed ? t('common.today') : '-'
    };
  });

  return (
    <div className="quiz-performance">
      <h3 className="quiz-performance__header">{t('progressPage.quizPerformance')}</h3>
      
      <div className="quiz-performance__table-wrapper">
        <table className="quiz-performance__table">
          <thead>
            <tr>
              <th>{t('progressPage.quizName')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.score')}</th>
              <th>{t('common.dateTaken')}</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.phaseId} className={`quiz-row--${quiz.status}`}>
                <td>
                  <div className="quiz-name-cell">
                    <FileText size={16} />
                    <span>{quiz.title}</span>
                  </div>
                </td>
                <td>
                  <span className={`quiz-status-badge quiz-status-badge--${quiz.status}`}>
                    {quiz.status === 'passed' && <CheckCircle2 size={12} />}
                    {quiz.status === 'locked' && <Lock size={12} />}
                    {quiz.status === 'passed' ? t('common.passed') : quiz.status === 'locked' ? t('common.locked') : t('common.pending')}
                  </span>
                </td>
                <td>
                  {quiz.score ? <span className="quiz-score-value">{quiz.score}%</span> : '-'}
                </td>
                <td className="quiz-date-cell">
                  {quiz.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
