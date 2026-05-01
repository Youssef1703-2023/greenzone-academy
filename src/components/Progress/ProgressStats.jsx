import { BookOpen, Map, Award, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ProgressStats.css';

export default function ProgressStats({ data }) {
  const { t } = useLanguage();
  const stats = [
    {
      label: t('dashboard.completedLessons'),
      value: `${data.completedLessons} / ${data.totalLessons}`,
      icon: BookOpen,
      color: 'blue'
    },
    {
      label: t('progressPage.completedPhases'),
      value: `${data.completedPhases} / ${data.totalPhases}`,
      icon: Map,
      color: 'purple'
    },
    {
      label: t('progressPage.quizAverage'),
      value: `${data.quizAverage}%`,
      icon: Award,
      color: 'green'
    },
    {
      label: t('progressPage.currentStreak'),
      value: `${data.streak} ${t('common.days')}`,
      icon: Zap,
      color: 'yellow'
    }
  ];

  return (
    <div className="progress-stats">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="progress-stat-card">
            <div className={`progress-stat-card__icon progress-stat-card__icon--${stat.color}`}>
              <Icon size={20} />
            </div>
            <div className="progress-stat-card__info">
              <span className="progress-stat-card__label">{stat.label}</span>
              <span className="progress-stat-card__value">{stat.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
