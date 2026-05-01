import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './AccountActions.css';

export default function AccountActions() {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="account-actions">
      <h3 className="account-actions__header">{t('profilePage.accountActions')}</h3>
      
      <div className="account-actions__list">
        <Link to="/dashboard" className="btn btn-secondary account-actions__btn">
          <LayoutDashboard size={18} />
          {t('profilePage.goToDashboard')}
        </Link>
        <Link to="/courses/cybersecurity-fundamentals" className="btn btn-primary account-actions__btn account-actions__btn--glow">
          <BookOpen size={18} />
          {t('dashboard.continueLearning')}
        </Link>
        <Link to="/progress" className="btn btn-secondary account-actions__btn">
          <BarChart3 size={18} />
          {t('dashboard.viewProgress')}
        </Link>
        <button onClick={handleLogout} className="btn account-actions__btn account-actions__btn--logout">
          <LogOut size={18} />
          {t('common.logout')}
        </button>
      </div>
    </div>
  );
}
