import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, BookOpen, BarChart3,
  ClipboardCheck, UserCircle, LogOut, Menu, X,
  Home, Settings, BookMarked
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import SettingsModal from '../Settings/SettingsModal';
import './StudentLayout.css';

const sideNavLinks = [
  { labelKey: 'common.dashboard', to: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'common.courses', to: '/courses', icon: BookOpen },
  { labelKey: 'common.glossary', to: '/glossary', icon: BookMarked },
  { labelKey: 'common.progress', to: '/progress', icon: BarChart3 },
  { labelKey: 'common.quizzes', to: '/quizzes', icon: ClipboardCheck },
  { labelKey: 'common.profile', to: '/profile', icon: UserCircle },
];

const mobileNavLinks = [
  { labelKey: 'common.dashboard', to: '/dashboard', icon: Home },
  { labelKey: 'common.courses', to: '/courses', icon: BookOpen },
  { labelKey: 'common.progress', to: '/progress', icon: BarChart3 },
  { labelKey: 'common.quizzes', to: '/quizzes', icon: ClipboardCheck },
  { labelKey: 'common.profile', to: '/profile', icon: UserCircle },
];

export default function StudentLayout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const displayName = user?.name === 'Student' ? t('common.student') : user?.name?.split(' ')[0] || t('common.student');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="student-layout">
      {/* ── Top Navbar ── */}
      <header className="student-nav">
        <div className="student-nav__inner">
          <Link to="/dashboard" className="student-nav__logo">
            <div className="student-nav__logo-icon">
              <Shield size={18} />
            </div>
            <span className="student-nav__logo-text" dir="ltr">
              Green <span className="accent">Zone</span> <span className="student-nav__logo-academy">Academy</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="student-nav__links">
            {sideNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `student-nav__link ${isActive ? 'student-nav__link--active' : ''}`
                  }
                >
                  <Icon size={16} />
                  {t(link.labelKey)}
                </NavLink>
              );
            })}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `student-nav__link ${isActive ? 'student-nav__link--active' : ''}`
                }
              >
                <Shield size={16} />
                {t('common.adminPanel')}
              </NavLink>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="student-nav__user">
            <div className="student-nav__avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="student-nav__username" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span dir="auto">{displayName}</span>
              {user?.role === 'admin' && (
                <span style={{
                  fontSize: '0.65rem', 
                  textTransform: 'uppercase', 
                  background: 'rgba(239,68,68,0.1)', 
                  color: '#ef4444', 
                  border: '1px solid rgba(239,68,68,0.2)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '800'
                }}>{t('common.admin')}</span>
              )}
            </span>
            <button
              className="student-nav__logout"
              onClick={() => setIsSettingsOpen(true)}
              title={t('common.settings')}
            >
              <Settings size={18} />
            </button>
            <button
              className="student-nav__logout"
              onClick={handleLogout}
              title={t('common.logout')}
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="student-nav__mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={t('common.settings')}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="student-nav__mobile-menu">
            {sideNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `student-nav__mobile-link ${isActive ? 'student-nav__mobile-link--active' : ''}`
                  }
                >
                  <Icon size={18} />
                  {t(link.labelKey)}
                </NavLink>
              );
            })}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `student-nav__mobile-link ${isActive ? 'student-nav__mobile-link--active' : ''}`
                }
              >
                <Shield size={18} />
                {t('common.adminPanel')}
              </NavLink>
            )}
            <button className="student-nav__mobile-logout" onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSettingsOpen(true);
            }}>
              <Settings size={18} />
              {t('common.settings')}
            </button>
            <button className="student-nav__mobile-logout" onClick={handleLogout}>
              <LogOut size={18} />
              {t('common.logout')}
            </button>
          </div>
        )}
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* ── Main Content ── */}
      <main className="student-layout__main">
        <div className="student-layout__bg">
          <div className="student-layout__grid"></div>
        </div>
        <div className="student-layout__content">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottom-nav">
        {mobileNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`mobile-bottom-nav__item ${isActive ? 'mobile-bottom-nav__item--active' : ''}`}
            >
              <Icon size={20} />
              <span>{t(link.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
