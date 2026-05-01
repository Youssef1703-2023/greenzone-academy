import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-page__bg">
        <div className="not-found-page__grid"></div>
      </div>
      <div className="not-found-page__content">
        <div className="not-found-page__icon">
          <ShieldAlert size={64} />
        </div>
        <h1 className="not-found-page__title">404</h1>
        <h2 className="not-found-page__subtitle">Page Not Found</h2>
        <p className="not-found-page__desc">
          The security clearance for this route is denied, or the page you are looking for does not exist in the Green Zone database.
        </p>
        <Link to="/" className="btn not-found-page__btn">
          <ArrowLeft size={18} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
