import { NavLink, Outlet } from 'react-router-dom';

import BrandLogo from '../components/BrandLogo.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

export default function AdminLayout() {
  const { admin } = useSiteContent();
  const adminItems = [
    { label: admin.nav[0], to: '/admin' },
    { label: admin.nav[1], to: '/admin/projects' },
    { label: admin.nav[2], to: '/admin/posts' },
    { label: admin.nav[3], to: '/admin/categories' },
    { label: admin.nav[4], to: '/admin/messages' },
  ];

  return (
    <div className="admin-shell">
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
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
