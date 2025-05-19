import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';

export default function RequireAuth({ children, role }) {
  const [auth, setAuth] = useState({ loading: true, user: null });

  useEffect(() => {
    api.get('/account/me')
      .then(res => setAuth({ loading: false, user: res.data }))
      .catch(() => setAuth({ loading: false, user: null }));
  }, []);

  if (auth.loading) return <div>Loading...</div>;
  if (!auth.user) return <Navigate to="/login" replace />;
  if (role && !auth.user.claims.find(c => c.type === 'role' && c.value === role))
    return <div>Forbidden</div>;
  return children;
}
