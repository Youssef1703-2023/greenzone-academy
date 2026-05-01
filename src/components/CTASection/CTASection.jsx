import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CTASection.css';

export default function CTASection() {
  const { user } = useAuth();

  return (
    <section className="cta" id="cta">
      <div className="cta__container container">
        <div className="cta__card animate-on-scroll">
          <div className="cta__glow"></div>
          <div className="cta__particles">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
          </div>
          <h2 className="cta__title">
            Ready to enter the <span className="accent">Green Zone</span>?
          </h2>
          <p className="cta__subtitle">
            {user 
              ? 'Continue building your cybersecurity foundation today.' 
              : 'Create your account and start building your cybersecurity foundation today.'}
          </p>
          <Link 
            to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/signup'} 
            className="btn btn-primary cta__btn"
          >
            {user ? (user.role === 'admin' ? 'Admin Panel' : 'Go to Dashboard') : 'Create Your Account'}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
