import { Link } from 'react-router-dom';
import { Award, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './CompletionModal.css';

export default function CompletionModal({ isOpen, courseSlug, phaseId }) {
  const { language, t } = useLanguage();
  const ForwardIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const BackIcon = language === 'ar' ? ArrowRight : ArrowLeft;

  if (!isOpen) return null;

  return (
    <div className="completion-modal-overlay">
      <div className="completion-modal">
        <div className="completion-modal__icon">
          <Award size={42} />
        </div>
        
        <h2 className="completion-modal__title">{t('lesson.congratulations')}</h2>
        
        <p className="completion-modal__message">
          {t('lesson.completionMessage')}
        </p>

        <div className="completion-modal__actions">
          <Link
            to={`/courses/${courseSlug}/phase/${phaseId}`}
            className="btn btn-secondary completion-modal__btn"
          >
            <BackIcon size={16} />
            {t('lesson.backToPhase')}
          </Link>
          
          <Link
            to={`/courses/${courseSlug}/phase/${phaseId}/quiz`}
            className="btn btn-primary completion-modal__btn completion-modal__btn--glow"
          >
            {t('lesson.takeQuiz')}
            <ForwardIcon size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
