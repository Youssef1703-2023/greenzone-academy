import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, BookOpen, Layers,
  FileText, ClipboardCheck, Users, Award, LogOut,
  ArrowLeft, Menu, X, Languages, History, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './AdminLayout.css';

const adminNavLinks = [
  { labelKey: 'admin.overview', to: '/admin', icon: LayoutDashboard },
  { labelKey: 'admin.courses', to: '/admin/courses', icon: BookOpen },
  { labelKey: 'admin.phases', to: '/admin/phases', icon: Layers },
  { labelKey: 'admin.lessons', to: '/admin/lessons', icon: FileText },
  { labelKey: 'admin.translations', to: '/admin/translations', icon: Languages },
  { labelKey: 'admin.quizzes', to: '/admin/quizzes', icon: ClipboardCheck },
  { labelKey: 'admin.students', to: '/admin/students', icon: Users },
  { labelKey: 'admin.scores', to: '/admin/scores', icon: Award },
  { labelKey: 'admin.auditLog', to: '/admin/audit-log', icon: History },
  { labelKey: 'admin.settings', to: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* ── Top Navbar ── */}
      <header className="admin-nav">
        <div className="admin-nav__inner">
          <Link to="/admin" className="admin-nav__logo">
            <div className="admin-nav__logo-icon">
              <Shield size={18} />
            </div>
            <span className="admin-nav__logo-text">
              Green <span className="accent">Zone</span> Academy <span className="admin-nav__logo-academy">Admin</span>
            </span>
          </Link>

          {/* Desktop Links (Hidden on Admin unless specifically needed, using Sidebar instead) */}
          <div className="admin-nav__user-area">
            <span className="admin-nav__role-badge">{t('common.admin')}</span>
            <div className="admin-nav__user-info">
              <span className="admin-nav__username">{user?.name || 'Admin'}</span>
              <span className="admin-nav__email">{user?.email}</span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="admin-nav__mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="admin-nav__mobile-menu">
            {adminNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `admin-nav__mobile-link ${isActive ? 'admin-nav__mobile-link--active' : ''}`
                  }
                >
                  <Icon size={18} />
                  {t(link.labelKey)}
                </NavLink>
              );
            })}
            <div className="admin-nav__mobile-divider"></div>
            <Link to="/dashboard" className="admin-nav__mobile-link admin-nav__mobile-link--student" onClick={() => setIsMobileMenuOpen(false)}>
              <ArrowLeft size={18} />
              {t('admin.studentDashboard')}
            </Link>
            <button className="admin-nav__mobile-logout" onClick={handleLogout}>
              <LogOut size={18} />
              {t('common.logout')}
            </button>
          </div>
        )}
      </header>

      {/* ── Sidebar & Main Content ── */}
      <div className="admin-layout__body">
        <aside className="admin-sidebar">
          <nav className="admin-sidebar__nav">
            {adminNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin'}
                  className={({ isActive }) =>
                    `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                  }
                >
                  <Icon size={18} />
                  {t(link.labelKey)}
                </NavLink>
              );
            })}
          </nav>
          
          <div className="admin-sidebar__footer">
            <Link to="/dashboard" className="admin-sidebar__action-link">
              <ArrowLeft size={16} />
              {t('admin.studentDashboard')}
            </Link>
            <button onClick={handleLogout} className="admin-sidebar__action-btn">
              <LogOut size={16} />
              {t('common.logout')}
            </button>
          </div>
        </aside>

        <main className="admin-layout__main">
          <div className="admin-layout__bg"></div>
          <div className="admin-layout__content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
