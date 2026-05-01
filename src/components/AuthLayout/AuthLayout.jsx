import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import './AuthLayout.css';

export default function AuthLayout({ children, compact = false }) {
  return (
    <div className={`auth-layout ${compact ? 'auth-layout--compact' : ''}`}>
      {/* Background Effects */}
      <div className="auth-layout__bg">
        <div className="auth-layout__grid"></div>
        <div className="auth-layout__glow auth-layout__glow--1"></div>
        <div className="auth-layout__glow auth-layout__glow--2"></div>
      </div>

      <div className="auth-layout__container">
        {/* Logo / Back to Home */}
        <Link to="/" className="auth-layout__logo">
          <div className="auth-layout__logo-icon">
            <Shield size={20} />
          </div>
          <span className="auth-layout__logo-text">
            Green <span className="accent">Zone</span> Academy
          </span>
        </Link>

        {/* Auth Card */}
        <div className="auth-layout__card">
          <div className="auth-layout__card-glow"></div>
          {children}
        </div>

        {/* Back to Home */}
        <Link to="/" className="auth-layout__back">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
