import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Mail, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout/AuthLayout';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Please enter your full name.';
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Please create a password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      newErrors.confirm = 'Please confirm your password.';
    } else if (password && password !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await signup(name.trim(), email.trim(), password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setGeneralError(result.error || 'Something went wrong.');
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <AuthLayout compact>
      <div className="auth__icon auth__icon--sm">
        <Shield size={24} />
      </div>

      <h1 className="auth__title">Create Your Account</h1>
      <p className="auth__subtitle auth__subtitle--compact">
        Join Green Zone Academy and start learning cybersecurity step by step.
      </p>

      {generalError && (
        <div className="auth__error">
          <AlertCircle size={16} className="auth__error-icon" />
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`auth__field auth__field--compact ${errors.name ? 'auth__field--error' : ''}`}>
          <label className="auth__label" htmlFor="signup-name">Full Name</label>
          <div className="auth__input-wrapper">
            <User size={18} className="auth__input-icon" />
            <input
              id="signup-name"
              type="text"
              className="auth__input"
              placeholder="Youssef Ahmed"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
              autoComplete="name"
              disabled={isSubmitting}
            />
          </div>
          {errors.name && <span className="auth__field-error">{errors.name}</span>}
        </div>

        <div className={`auth__field auth__field--compact ${errors.email ? 'auth__field--error' : ''}`}>
          <label className="auth__label" htmlFor="signup-email">Email</label>
          <div className="auth__input-wrapper">
            <Mail size={18} className="auth__input-icon" />
            <input
              id="signup-email"
              type="email"
              className="auth__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>
          {errors.email && <span className="auth__field-error">{errors.email}</span>}
        </div>

        <div className={`auth__field auth__field--compact ${errors.password ? 'auth__field--error' : ''}`}>
          <label className="auth__label" htmlFor="signup-password">Password</label>
          <div className="auth__input-wrapper">
            <KeyRound size={18} className="auth__input-icon" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className="auth__input auth__input--has-toggle"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="auth__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="auth__field-error">{errors.password}</span>}
        </div>

        <div className={`auth__field auth__field--compact ${errors.confirm ? 'auth__field--error' : ''}`}>
          <label className="auth__label" htmlFor="signup-confirm">Confirm Password</label>
          <div className="auth__input-wrapper">
            <KeyRound size={18} className="auth__input-icon" />
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              className="auth__input auth__input--has-toggle"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirm'); }}
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="auth__toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirm && <span className="auth__field-error">{errors.confirm}</span>}
        </div>

        <button
          type="submit"
          className="btn btn-primary auth__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth__footer">
        <p className="auth__footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth__footer-link">Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
