import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - Current state:', { user, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  return children;
};

export default ProtectedRoute; 