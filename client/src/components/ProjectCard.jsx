import { Link } from 'react-router-dom';

import { useSiteContent } from '../hooks/useSiteContent.js';

export default function ProjectCard({ project }) {
  const { projectsPage } = useSiteContent();

  return (
    <article className="project-card">
      {project.coverImage ? (
        <Link className="project-card__media" to={`/projects/${project.slug}`} aria-label={project.title}>
          <img src={project.coverImage} alt="" loading="lazy" />
        </Link>
      ) : null}
      <div className="project-card__body">
        <h3>
          <Link to={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>
        <p>{project.summary}</p>
        <div className="tag-list" aria-label={projectsPage.technologiesLabel}>
          {(project.technologies ?? []).map((technology) => (
            <span key={technology}>{technology}</span>
          ))}
        </div>
        {(project.liveUrl || project.repoUrl) && (
          <div className="project-card__actions">
            {project.liveUrl && <a className="button button--primary button--small" href={project.liveUrl} target="_blank" rel="noreferrer">{projectsPage.demo}</a>}
            {project.repoUrl && <a className="button button--secondary button--small" href={project.repoUrl} target="_blank" rel="noreferrer">{projectsPage.code}</a>}
          </div>
        )}
      </div>
    </article>
  );
}
