import { useSiteContent } from '../hooks/useSiteContent.js';

export default function AdminDashboardPage() {
  const { admin, meta, posts, projects } = useSiteContent();
  const adminStats = [
    { label: admin.stats[0], value: projects.length },
    { label: admin.stats[1], value: posts.length },
    { label: admin.stats[2], value: 4 },
    { label: admin.stats[3], value: 2 },
  ];

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">{admin.dashboard}</p>
          <h1>{admin.dashboardTitle}</h1>
        </div>
        <button className="button button--primary" type="button">
          {admin.newContent}
        </button>
      </div>
      <div className="stat-grid">
        {adminStats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>
      <div className="admin-grid">
        <section className="admin-panel">
          <h2>{admin.recentProjects}</h2>
          <div className="admin-list">
            {projects.map((project) => (
              <article key={project.id}>
                <span>{project.status}</span>
                <strong>{project.title}</strong>
                <small>{project.category}</small>
              </article>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <h2>{admin.recentPosts}</h2>
          <div className="admin-list">
            {posts.map((post) => (
              <article key={post.id}>
                <span>{post.category}</span>
                <strong>{post.title}</strong>
                <small>
                  {post.readingTime} {meta.readingUnit}
                </small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
