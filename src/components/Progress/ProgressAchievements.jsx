import { Flame, Target, Trophy, Star, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ProgressAchievements.css';

export default function ProgressAchievements({ achievements }) {
  const { t } = useLanguage();
  const icons = {
    shield: Shield,
    trophy: Trophy,
    star: Star,
    zap: Zap,
    target: Target,
    flame: Flame,
    'First Phase Completed': Shield,
    'Quiz Passed': Trophy,
    '7 Lessons Completed': Star,
    'Learning Streak Started': Zap,
  };
  const unlockedCount = achievements.filter((badge) => badge.unlocked).length;

  return (
    <div className="progress-achievements">
      <div className="progress-achievements__top">
        <div>
          <span className="progress-achievements__eyebrow">{t('progressPage.achievementSystem')}</span>
          <h3 className="progress-achievements__header">{t('progressPage.recentAchievements')}</h3>
        </div>
        <strong>{unlockedCount}/{achievements.length}</strong>
      </div>
      
      <div className="progress-achievements__grid">
        {achievements.map((badge, idx) => {
          const Icon = icons[badge.icon] || icons[badge.title] || Trophy;
          return (
            <div 
              key={badge.id || idx} 
              className={`achievement-card ${badge.unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}`}
            >
              <div className="achievement-card__icon-wrapper">
                <Icon size={24} className="achievement-card__icon" />
              </div>
              <h4 className="achievement-card__title">{badge.titleKey ? t(badge.titleKey) : badge.title}</h4>
              {badge.descriptionKey && (
                <p className="achievement-card__description">{t(badge.descriptionKey)}</p>
              )}
              <div className="achievement-card__progress" aria-hidden="true">
                <span style={{ width: `${Math.min(100, badge.progress || 0)}%` }}></span>
              </div>
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
