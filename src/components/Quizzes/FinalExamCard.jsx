import { Lock, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './FinalExamCard.css';

export default function FinalExamCard() {
  const { t } = useLanguage();

  return (
    <div className="final-exam-card">
      <div className="final-exam-card__bg-effect"></div>
      
      <div className="final-exam-card__content">
        <div className="final-exam-card__header">
          <div className="final-exam-card__icon">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h3 className="final-exam-card__title">{t('common.finalExam')}</h3>
            <p className="final-exam-card__subtitle">{t('quizzesPage.finalExamSubtitle')}</p>
          </div>
        </div>
        
        <div className="final-exam-card__requirements">
          <span className="req-title">{t('quizzesPage.requirements')}</span>
          <ul>
            <li>{t('quizzesPage.completeAllPhases')}</li>
            <li>{t('quizzesPage.passAllQuizzes')}</li>
          </ul>
        </div>
      </div>
      
      <div className="final-exam-card__action">
        <button className="btn btn-secondary final-exam-card__btn" disabled>
          <Lock size={18} />
          {t('common.locked')}
        </button>
      </div>
    </div>
  );
}
