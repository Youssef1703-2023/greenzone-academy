import { Link } from 'react-router-dom';
import { Play, BookOpen, ClipboardCheck, BarChart3, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './QuickActions.css';

const iconMap = {
  play: Play,
  book: BookOpen,
  clipboard: ClipboardCheck,
  chart: BarChart3,
};

export default function QuickActions({ actions }) {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="quick-actions">
      <h3 className="quick-actions__title">{t('dashboard.quickActions')}</h3>
      <div className="quick-actions__grid">
        {actions.map((action) => {
          const Icon = iconMap[action.icon] || Play;
          const label = {
            continue: t('dashboard.continueLearning'),
            course: t('dashboard.viewCourse'),
            quiz: t('dashboard.takeQuiz'),
            progress: t('dashboard.viewProgress'),
          }[action.id] || action.label;
          const description = {
            continue: t('dashboard.pickUp'),
            course: t('dashboard.browseCourse'),
            quiz: t('dashboard.testKnowledge'),
            progress: t('dashboard.trackStats'),
          }[action.id] || action.description;

          return (
            <Link
              to={action.route}
              className="quick-action"
              key={action.id}
            >
              <div className="quick-action__icon">
                <Icon size={20} />
              </div>
              <div className="quick-action__info">
                <span className="quick-action__label">{label}</span>
                <span className="quick-action__desc">{description}</span>
              </div>
              <ArrowIcon size={16} className="quick-action__arrow" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
