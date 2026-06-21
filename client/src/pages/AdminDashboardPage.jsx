import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { useAdminDashboard } from '../hooks/useAdminDashboard.js';
import { useSiteContent } from '../hooks/useSiteContent.js';

export default function AdminDashboardPage() {
  const { language } = usePreferences();
  const { admin, meta } = useSiteContent();
  const { data, error, reload, status } = useAdminDashboard();
  const copy =
    language === 'es'
      ? {
          loading: 'Cargando datos...',
          error: 'No se pudo cargar el resumen administrativo.',
          retry: 'Reintentar',
          noProjects: 'Todavía no hay proyectos.',
          noPosts: 'Todavía no hay posts.',
        }
      : {
          loading: 'Loading data...',
          error: 'The admin overview could not be loaded.',
          retry: 'Retry',
          noProjects: 'There are no projects yet.',
          noPosts: 'There are no posts yet.',
        };
  const adminStats = [
    { label: admin.stats[0], value: data?.stats.projects },
    { label: admin.stats[1], value: data?.stats.posts },
    { label: admin.stats[2], value: data?.stats.messages },
    { label: admin.stats[3], value: data?.stats.drafts },
  ];
  const isLoading = status === 'loading';

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">{admin.dashboard}</p>
          <h1>{admin.dashboardTitle}</h1>
        </div>
        <Link className="button button--primary" to="/admin/projects/new">
          {admin.newContent}
        </Link>
      </div>
      {status === 'error' && (
        <div className="admin-feedback" role="alert">
          <span>{error?.message || copy.error}</span>
          <button className="button button--secondary" onClick={reload} type="button">
            <RefreshCw aria-hidden="true" size={17} />
            {copy.retry}
          </button>
        </div>
      )}
      <div className="stat-grid">
        {adminStats.map((stat) => (
          <article aria-busy={isLoading} className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value ?? '-'}</strong>
          </article>
        ))}
      </div>
      <div className="admin-grid">
        <section className="admin-panel">
          <h2>{admin.recentProjects}</h2>
          <div className="admin-list">
            {isLoading && !data ? (
              <p className="admin-state">{copy.loading}</p>
            ) : data?.recentProjects.length ? (
              data.recentProjects.map((project) => (
                <article key={project._id}>
                  <span>{project.status}</span>
                  <strong>{project.title}</strong>
                  <small>{project.category}</small>
                </article>
              ))
            ) : (
              <p className="admin-state">{copy.noProjects}</p>
            )}
          </div>
        </section>
        <section className="admin-panel">
          <h2>{admin.recentPosts}</h2>
          <div className="admin-list">
            {isLoading && !data ? (
              <p className="admin-state">{copy.loading}</p>
            ) : data?.recentPosts.length ? (
              data.recentPosts.map((post) => (
                <article key={post._id}>
                  <span>{post.category}</span>
                  <strong>{post.title}</strong>
                  <small>
                    {post.readingTime} {meta.readingUnit}
                  </small>
                </article>
              ))
            ) : (
              <p className="admin-state">{copy.noPosts}</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
