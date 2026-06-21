import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

export default function ProtectedRoute() {
  const { status } = useAuth();
  const { meta } = useSiteContent();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <main className="auth-page">
        <section className="auth-panel" aria-live="polite">
          <p>{meta.code === 'es' ? 'Verificando sesion...' : 'Checking session...'}</p>
        </section>
      </main>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
