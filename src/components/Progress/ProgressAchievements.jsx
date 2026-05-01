import { Trophy, Star, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ProgressAchievements.css';

export default function ProgressAchievements({ achievements }) {
  const { t } = useLanguage();
  const icons = {
    'First Phase Completed': Shield,
    'Quiz Passed': Trophy,
    '7 Lessons Completed': Star,
    'Learning Streak Started': Zap
  };

  return (
    <div className="progress-achievements">
      <h3 className="progress-achievements__header">{t('progressPage.recentAchievements')}</h3>
      
      <div className="progress-achievements__grid">
        {achievements.map((badge, idx) => {
          const Icon = icons[badge.title] || Trophy;
          return (
            <div 
              key={idx} 
              className={`achievement-card ${badge.unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}`}
            >
              <div className="achievement-card__icon-wrapper">
                <Icon size={24} className="achievement-card__icon" />
              </div>
              <h4 className="achievement-card__title">{badge.titleKey ? t(badge.titleKey) : badge.title}</h4>
              <span className="achievement-card__status">
                {badge.unlocked ? t('progressPage.unlocked') : t('common.locked')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
