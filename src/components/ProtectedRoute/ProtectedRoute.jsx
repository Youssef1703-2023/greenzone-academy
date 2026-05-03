import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__card">
          <div className="loading-screen__spinner"></div>
          <div className="loading-screen__copy">
            <strong>Checking your session</strong>
            <span>Preparing your dashboard and progress data.</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
