import { TrendingUp, BookOpen, Trophy, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './StatCards.css';

const iconMap = {
  progress: TrendingUp,
  lessons: BookOpen,
  quiz: Trophy,
  phase: Layers,
};

export default function StatCards({ progress }) {
  const { t } = useLanguage();
  const stats = [
    {
      id: 'progress',
      label: t('dashboard.overallProgress'),
      value: `${progress.overallProgress}%`,
      icon: 'progress',
      color: 'green',
    },
    {
      id: 'lessons',
      label: t('dashboard.completedLessons'),
      value: `${progress.completedLessons} / ${progress.totalLessons}`,
      icon: 'lessons',
      color: 'blue',
    },
    {
      id: 'quiz',
      label: t('dashboard.latestQuizScore'),
      value: progress.latestQuizScore !== null && progress.latestQuizScore !== undefined ? `${progress.latestQuizScore}%` : t('admin.averageUnavailable'),
      icon: 'quiz',
      color: 'yellow',
    },
    {
      id: 'phase',
      label: t('dashboard.currentPhase'),
      value: `${t('common.phase')} ${progress.currentPhase}`,
      icon: 'phase',
      color: 'purple',
    },
  ];

  return (
    <div className="stat-cards">
      {stats.map((stat, i) => {
        const Icon = iconMap[stat.icon];
        return (
          <div
            className={`stat-card stat-card--${stat.color}`}
            key={stat.id}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="stat-card__icon">
              <Icon size={20} />
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stat.value}</span>
              <span className="stat-card__label">{stat.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
