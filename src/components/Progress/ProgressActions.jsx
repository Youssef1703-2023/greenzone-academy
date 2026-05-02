import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ProgressActions.css';

export default function ProgressActions({ nextStep }) {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="progress-actions">
      <h3 className="progress-actions__header">{t('dashboard.quickActions')}</h3>
      <div className="progress-actions__buttons">
        <Link to={nextStep?.route || '/courses/cybersecurity-fundamentals'} className="btn btn-primary progress-action-btn progress-action-btn--glow">
          <ArrowIcon size={18} />
          {nextStep?.cta || t('dashboard.continueLearning')}
        </Link>
        <Link to="/courses" className="btn btn-secondary progress-action-btn">
          <BookOpen size={18} />
          {t('progressPage.viewCourses')}
        </Link>
        <Link to="/quizzes" className="btn btn-secondary progress-action-btn">
          <FileText size={18} />
          {t('progressPage.viewQuizzes')}
        </Link>
      </div>
    </div>
  );
}
