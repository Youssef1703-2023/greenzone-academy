import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './DashboardHeader.css';

export default function DashboardHeader({ userName }) {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="dash-header">
      <div className="dash-header__text">
        <div className="dash-header__greeting">
          <Sparkles size={20} className="dash-header__sparkle" />
          <span>{t('dashboard.studentDashboard')}</span>
        </div>
        <h1 className="dash-header__title">
          {t('dashboard.welcomeBack')}, <span className="accent" dir="auto">{userName}</span>
        </h1>
        <p className="dash-header__subtitle">
          {t('dashboard.subtitle')}
        </p>
        <Link to="/courses/cybersecurity-fundamentals" className="btn btn-primary dash-header__btn">
          {t('dashboard.continueLearning')}
          <ArrowIcon size={18} />
        </Link>
      </div>

      <div className="dash-header__visual">
        <div className="dash-header__glow"></div>
        <div className="dash-header__ring dash-header__ring--1"></div>
        <div className="dash-header__ring dash-header__ring--2"></div>
      </div>
    </section>
  );
}
