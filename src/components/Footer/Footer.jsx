import { Link } from 'react-router-dom';
import { Shield, Globe, MessageCircle, Mail } from 'lucide-react';
import './Footer.css';

const footerLinks = [
  { label: 'Home', href: '#home', isAnchor: true },
  { label: 'Course', href: '#course', isAnchor: true },
  { label: 'Features', href: '#features', isAnchor: true },
  { label: 'Login', to: '/login' },
  { label: 'Sign Up', to: '/signup' },
];

const socialLinks = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: MessageCircle, href: '#', label: 'Community' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <div className="footer__logo-icon">
                <Shield size={20} />
              </div>
              <span className="footer__logo-text">
                Green <span className="accent">Zone</span> Academy
              </span>
            </div>
            <p className="footer__slogan">
              Learn safely. Practice ethically. Build your cybersecurity future.
            </p>
            <div className="footer__socials">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.label} href={social.href} className="footer__social-link" aria-label={social.label}>
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <nav className="footer__nav">
            <h4 className="footer__nav-title">Quick Links</h4>
            <ul className="footer__links">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  {link.isAnchor ? (
                    <a href={link.href} className="footer__link">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className="footer__link">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} Green Zone Academy. All rights reserved.
          </p>
          <p className="footer__credit">
            Built by <span className="footer__credit-name">JoeTech</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
