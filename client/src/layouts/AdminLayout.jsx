import { LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { admin } = useSiteContent();
  const navigate = useNavigate();
  usePageMetadata({ title: 'Admin', description: 'Panel administrativo privado.', path: '/admin', noIndex: true });
  const adminItems = [
    { label: admin.nav[0], to: '/admin' },
    { label: admin.nav[1], to: '/admin/projects' },
    { label: admin.nav[2], to: '/admin/posts' },
    { label: admin.nav[3], to: '/admin/categories' },
    { label: admin.nav[4], to: '/admin/messages' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main-content">Saltar al contenido</a>
      <aside className="admin-sidebar">
        <BrandLogo />
        <p className="admin-kicker">{admin.content}</p>
        <nav className="admin-nav" aria-label="Admin">
          {adminItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-session">
          <div className="admin-session__user">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <button
            className="button button--secondary button--small"
            type="button"
            onClick={handleLogout}
            title="Cerrar sesion"
          >
            <LogOut aria-hidden="true" size={16} />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </aside>
      <main className="admin-main" id="admin-main-content" tabIndex="-1">
        <Outlet />
      </main>
    </div>
  );
}
