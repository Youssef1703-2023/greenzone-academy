import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Green Zone Academy Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__bg"></div>
          <div className="error-boundary__content">
            <div className="error-boundary__icon">
              <AlertTriangle size={64} />
            </div>
            <h1 className="error-boundary__title">System Error</h1>
            <p className="error-boundary__desc">
              A critical error occurred in the academy interface. The issue has been logged.
            </p>
            {this.state.error && (
              <div className="error-boundary__details">
                <code>{this.state.error.toString()}</code>
              </div>
            )}
            <div className="error-boundary__actions">
              <button 
                className="btn btn-secondary error-boundary__btn" 
                onClick={() => window.location.reload()}
              >
                <RotateCcw size={18} />
                Reload Page
              </button>
              <Link to="/" className="btn error-boundary__btn" onClick={() => this.setState({ hasError: false })}>
                <Home size={18} />
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
