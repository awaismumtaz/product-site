import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children, role }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && !hasRole(role)) return <div>Forbidden</div>;
  
  return children;
}
