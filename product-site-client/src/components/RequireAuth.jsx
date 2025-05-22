import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children, role }) {
  const { user, hasRole, openLoginModal } = useAuth();

  useEffect(() => {
    if (!user || (role && !hasRole(role))) {
      openLoginModal();
    }
  }, [user, role, hasRole, openLoginModal]);

  if (!user || (role && !hasRole(role))) {
    return null;
  }

  return children;
}
