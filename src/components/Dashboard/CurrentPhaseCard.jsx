import { Link } from 'react-router-dom';
import { Layers, BookOpen, ClipboardCheck, ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './CurrentPhaseCard.css';

export default function CurrentPhaseCard({ progress }) {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const phaseProgress = Math.round((progress.completedLessons / progress.currentPhaseLessons) * 100) || 0;

  return (
    <div className="current-phase-card">
      <div className="current-phase-card__header">
        <div className="current-phase-card__icon">
          <Layers size={22} />
        </div>
        <div>
          <span className="current-phase-card__label">{t('dashboard.currentPhase')}</span>
          <h3 className="current-phase-card__title">
            {t('common.phase')} {progress.currentPhase}: <span dir="auto">{progress.currentPhaseTitle}</span>
          </h3>
        </div>
      </div>

      <div className="current-phase-card__details">
        <div className="current-phase-card__detail">
          <BookOpen size={15} />
          <span>{progress.currentPhaseLessons} {t('common.lessons')}</span>
        </div>
        <div className="current-phase-card__detail">
          <ClipboardCheck size={15} />
          <span>{t('dashboard.quizRequired')}</span>
        </div>
        <div className="current-phase-card__detail current-phase-card__detail--status">
          <Clock size={15} />
          <span>{language === 'ar' ? t('dashboard.inProgress') : progress.currentPhaseStatus}</span>
        </div>
        
        {/* Visual Progress Bar */}
        <div className="current-phase-card__progress-container">
          <div className="current-phase-card__progress-header">
            <span>{t('dashboard.phaseProgress')}</span>
            <span>{phaseProgress}%</span>
          </div>
          <div className="current-phase-card__progress-bar">
            <div 
              className="current-phase-card__progress-fill" 
              style={{ width: `${phaseProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <Link to={`/courses/cybersecurity-fundamentals/phase/${progress.currentPhase}`} className="btn btn-secondary current-phase-card__btn">
        {t('dashboard.viewPhase')}
        <ArrowIcon size={16} />
      </Link>
    </div>
  );
}
