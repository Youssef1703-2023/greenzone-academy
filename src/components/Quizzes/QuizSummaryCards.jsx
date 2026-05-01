import { ClipboardCheck, CheckCircle2, Award, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './QuizSummaryCards.css';

export default function QuizSummaryCards({ data }) {
  const { t } = useLanguage();
  const cards = [
    {
      label: t('quizzesPage.totalQuizzes'),
      value: data.totalQuizzes,
      icon: ClipboardCheck,
      color: 'blue'
    },
    {
      label: t('quizzesPage.passed'),
      value: data.passedQuizzes,
      icon: CheckCircle2,
      color: 'green'
    },
    {
      label: t('quizzesPage.averageScore'),
      value: `${data.averageScore}%`,
      icon: Award,
      color: 'purple'
    },
    {
      label: t('common.finalExam'),
      value: data.finalExamStatus === 'Ready' ? t('common.ready') : t('common.locked'),
      icon: Lock,
      color: 'yellow'
    }
  ];

  return (
    <div className="quiz-summary-cards">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="quiz-summary-card">
            <div className={`quiz-summary-card__icon quiz-summary-card__icon--${card.color}`}>
              <Icon size={20} />
            </div>
            <div className="quiz-summary-card__info">
              <span className="quiz-summary-card__label">{card.label}</span>
              <span className="quiz-summary-card__value">{card.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
