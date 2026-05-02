import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminRoute.css';

export default function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="admin-route-loading">
        <div className="admin-route-loading__card">
          <div className="admin-route-loading__mark"></div>
          <div>
            <strong>Green Zone Academy</strong>
            <span>Loading admin workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
