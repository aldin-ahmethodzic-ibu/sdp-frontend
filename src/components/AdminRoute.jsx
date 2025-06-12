import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.user_type !== 'admin') {
    return <Navigate to="/chatbot" replace />;
  }

  return children;
};

export default AdminRoute; 