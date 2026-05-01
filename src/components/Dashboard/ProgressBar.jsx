import './ProgressBar.css';
import { useLanguage } from '../../context/LanguageContext';

export default function ProgressBar({ title, progress }) {
  const { t } = useLanguage();

  return (
    <div className="progress-section">
      <div className="progress-section__header">
        <h3 className="progress-section__title">{title}</h3>
        <span className="progress-section__percent">{progress}%</span>
      </div>
      <div className="progress-section__bar">
        <div
          className="progress-section__fill"
          style={{ width: `${progress}%` }}
        >
          <div className="progress-section__shine"></div>
        </div>
      </div>
      <p className="progress-section__label">{progress}% {t('dashboard.completed')}</p>
    </div>
  );
}
