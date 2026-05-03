import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './HeroSection.css';

const TYPING_TEXTS = [
  "Think Like a Defender.",
  "Master Security Concepts.",
  "Secure the Digital World."
];

export default function HeroSection() {
  const { user } = useAuth();
  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = TYPING_TEXTS[textIndex];
    const isAtEnd = !isDeleting && typedText === currentText;
    const isAtStart = isDeleting && typedText === '';
    const typingSpeed = isAtEnd ? 2000 : isAtStart ? 500 : isDeleting ? 40 : 100;

    const timer = setTimeout(() => {
      if (isAtEnd) {
        setIsDeleting(true);
        return;
      }

      if (isAtStart) {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % TYPING_TEXTS.length);
        return;
      }

      setTypedText(
        isDeleting
          ? currentText.substring(0, typedText.length - 1)
          : currentText.substring(0, typedText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, textIndex]);

  return (
    <section className="hero" id="home">
      {/* Background Effects */}
      <div className="hero__bg">
        <div className="hero__grid"></div>
        <div className="hero__glow hero__glow--1"></div>
        <div className="hero__glow hero__glow--2"></div>
        <div className="hero__scanline"></div>
      </div>

      <div className="hero__container container">
        <div className="hero__content">
          {/* Badge */}
          <div className="hero__badge animate-on-scroll">
            <Shield size={14} />
            <span>Cybersecurity Learning Platform</span>
          </div>

          {/* Title */}
          <h1 className="hero__title animate-on-scroll" style={{ animationDelay: '0.1s' }}>
            Learn Cybersecurity. <br />
            <span className="hero__title-accent">{typedText}</span><span className="hero__cursor">|</span>
          </h1>

          {/* Subtitle */}
          <p className="hero__subtitle animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            A structured beginner-friendly course designed to build strong cybersecurity foundations, step by step.
          </p>

          {/* CTA Buttons */}
          <div className="hero__actions">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary hero__btn-primary">
                {user.role === 'admin' ? 'Admin Panel' : 'Go to Dashboard'}
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary hero__btn-primary">
                  Create Account
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary hero__btn-secondary">
                  <LogIn size={18} />
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Trust Badge */}
          <div className="hero__trust">
            <div className="hero__trust-dot"></div>
            <span>Arabic-friendly explanations with English cybersecurity terms</span>
          </div>
        </div>

        {/* Visual Side */}
        <div className="hero__visual">
          {/* Floating Icons */}
          <div className="hero__float hero__float--shield">
            <Shield size={28} />
          </div>
          <div className="hero__float hero__float--lock">
            <Lock size={24} />
          </div>

          {/* Terminal Card */}
          <div className="hero__terminal">
            <div className="hero__terminal-header">
              <div className="hero__terminal-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="hero__terminal-title">terminal</span>
            </div>
            <div className="hero__terminal-body">
              <div className="hero__terminal-line">
                <span className="t-prompt">$</span>
                <span className="t-cmd"> greenzone</span>
                <span className="t-flag"> --start-learning</span>
              </div>
              <div className="hero__terminal-line t-output">
                <span className="t-success">✓</span> Loading course: Cybersecurity Fundamentals
              </div>
              <div className="hero__terminal-line t-output">
                <span className="t-success">✓</span> 8 phases ready
              </div>
              <div className="hero__terminal-line t-output">
                <span className="t-success">✓</span> 56 lessons available
              </div>
              <div className="hero__terminal-line t-output">
                <span className="t-success">✓</span> Progress tracking enabled
              </div>
              <div className="hero__terminal-line">
                <span className="t-prompt">$</span>
                <span className="t-cursor">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
