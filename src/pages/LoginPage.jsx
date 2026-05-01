import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Please enter your password.';
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

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setGeneralError(result.error || 'Login failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      setGeneralError(error?.message || 'Login failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AuthLayout>
      <div className="auth__icon">
        <Lock size={26} />
      </div>

      <h1 className="auth__title">Welcome Back</h1>
      <p className="auth__subtitle">
        Continue your cybersecurity journey in the Green Zone.
      </p>

      {generalError && (
        <div className="auth__error">
          <AlertCircle size={16} className="auth__error-icon" />
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`auth__field ${errors.email ? 'auth__field--error' : ''}`}>
          <label className="auth__label" htmlFor="login-email">Email</label>
          <div className="auth__input-wrapper">
            <Mail size={18} className="auth__input-icon" />
            <input
              id="login-email"
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

        <div className={`auth__field ${errors.password ? 'auth__field--error' : ''}`}>
          <label className="auth__label" htmlFor="login-password">Password</label>
          <div className="auth__input-wrapper">
            <KeyRound size={18} className="auth__input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="auth__input auth__input--has-toggle"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
              autoComplete="current-password"
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

        <button
          type="submit"
          className="btn btn-primary auth__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="auth__footer">
        <p className="auth__footer-text">
          Don't have an account?{' '}
          <Link to="/signup" className="auth__footer-link">Create one</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
