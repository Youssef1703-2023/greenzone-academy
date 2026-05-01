import { Target } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './OverallProgressCard.css';

export default function OverallProgressCard({ data }) {
  const { t } = useLanguage();

  return (
    <div className="overall-progress-card">
      <div className="overall-progress-card__header">
        <div className="overall-progress-card__title-group">
          <Target className="overall-progress-card__icon" size={24} />
          <div>
            <span className="overall-progress-card__label">{t('progressPage.course')}</span>
            <h2 className="overall-progress-card__title" dir="ltr">{data.courseTitle}</h2>
          </div>
        </div>
        <div className="overall-progress-card__percent">
          {data.overallProgress}%
        </div>
      </div>

      <div className="overall-progress-card__stats">
        <div className="overall-progress-card__stat">
          <span className="stat-label">{t('dashboard.completedLessons')}</span>
          <span className="stat-value">{data.completedLessons} / {data.totalLessons}</span>
        </div>
        <div className="overall-progress-card__stat">
          <span className="stat-label">{t('progressPage.completedPhases')}</span>
          <span className="stat-value">{data.completedPhases} / {data.totalPhases}</span>
        </div>
        <div className="overall-progress-card__stat">
          <span className="stat-label">{t('progressPage.quizAverage')}</span>
          <span className="stat-value">{data.quizAverage}%</span>
        </div>
      </div>

      <div className="overall-progress-card__bar-container">
        <div 
          className="overall-progress-card__bar-fill"
          style={{ width: `${data.overallProgress}%` }}
        ></div>
      </div>
    </div>
  );
}
