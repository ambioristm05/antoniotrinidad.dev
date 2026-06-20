import { Link, useParams } from 'react-router-dom';

import { useSiteContent } from '../hooks/useSiteContent.js';
import { findBySlug } from '../utils/formatters.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { projects, projectsPage } = useSiteContent();
  const project = findBySlug(projects, slug);

  if (!project) {
    return <NotFoundPage />;
  }

  return (
    <article className="page-section detail-page">
      <Link className="text-link" to="/projects">
        {projectsPage.back}
      </Link>
      <div className="detail-hero">
        <div>
          <p className="eyebrow">{project.category}</p>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
        <div className="detail-panel">
          <span className="status">{project.status}</span>
          <div className="tag-list">
            {project.technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="detail-grid">
        <section>
          <h2>{projectsPage.challenge}</h2>
          <p>{project.challenge}</p>
        </section>
        <section>
          <h2>{projectsPage.solution}</h2>
          <p>{project.solution}</p>
        </section>
        <section>
          <h2>{projectsPage.results}</h2>
          <ul className="clean-list">
            {project.results.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
        </section>
      </div>
      <div className="hero-actions">
        <a className="button button--primary" href={project.liveUrl} target="_blank" rel="noreferrer">
          {projectsPage.demo}
        </a>
        <a className="button button--secondary" href={project.repoUrl} target="_blank" rel="noreferrer">
          {projectsPage.code}
        </a>
      </div>
    </article>
  );
}
