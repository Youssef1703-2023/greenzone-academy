import { BookOpen, Layers, Trophy, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './RecentActivity.css';

const typeIcons = {
  lesson: BookOpen,
  phase: Layers,
  quiz: Trophy,
};

export default function RecentActivity({ activities }) {
  const { t } = useLanguage();

  if (!activities || activities.length === 0) {
    return (
      <div className="activity">
        <h3 className="activity__title">{t('dashboard.recentActivity')}</h3>
        <div className="activity__empty">
          <Clock size={32} />
          <p>{t('dashboard.noRecentActivity')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity">
      <h3 className="activity__title">{t('dashboard.recentActivity')}</h3>
      <div className="activity__list">
        {activities.map((item) => {
          const Icon = typeIcons[item.type] || BookOpen;
          return (
            <div className="activity__item" key={item.id}>
              <div className={`activity__icon activity__icon--${item.type}`}>
                <Icon size={16} />
              </div>
              <div className="activity__info">
                <span className="activity__text">
                  {item.id === 1 ? t('dashboard.startedPhase') : item.id === 2 ? t('dashboard.startedLesson') : item.text}
                </span>
                <span className="activity__time">{item.time === 'Just now' ? t('dashboard.justNow') : item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
