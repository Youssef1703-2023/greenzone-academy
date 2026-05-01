import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Course', href: '#course' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__container container">
        {/* Logo */}
        <a href="#home" className="navbar__logo" onClick={closeMobile}>
          <div className="navbar__logo-icon">
            <Shield size={22} />
          </div>
          <span className="navbar__logo-text">
            Green <span className="accent">Zone</span> Academy
          </span>
        </a>

        {/* Desktop Nav */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="navbar__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="navbar__auth">
          {user ? (
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary navbar__signup-btn">
              {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link to="/login" className="navbar__login-btn">Login</Link>
              <Link to="/signup" className="btn btn-primary navbar__signup-btn">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${isMobileOpen ? 'navbar__mobile--open' : ''}`}>
        <div className="navbar__mobile-overlay" onClick={closeMobile}></div>
        <div className="navbar__mobile-content">
          <ul className="navbar__mobile-links">
            {navLinks.map((link, i) => (
              <li key={link.label} style={{ animationDelay: `${i * 0.07}s` }}>
                <a href={link.href} className="navbar__mobile-link" onClick={closeMobile}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="navbar__mobile-auth">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary navbar__mobile-signup" onClick={closeMobile}>
                {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary navbar__mobile-login" onClick={closeMobile}>
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary navbar__mobile-signup" onClick={closeMobile}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
