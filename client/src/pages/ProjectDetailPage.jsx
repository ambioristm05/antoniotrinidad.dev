import { Link, useParams } from 'react-router-dom';

import ContentFeedback from '../components/ContentFeedback.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { api } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { meta, projectsPage } = useSiteContent();
  const { data: project, error, retry, status } = useApiResource(({ signal }) =>
    api.getProject(slug, { signal }).then((response) => response.data.project), slug);
  const copy = meta.code === 'es'
    ? { loading: 'Cargando proyecto...', error: 'No se pudo cargar el proyecto.', retry: 'Reintentar', about: 'Sobre el proyecto', role: 'Rol', challenge: 'Reto', solution: 'Solución', results: 'Resultados', dates: 'Periodo', gallery: 'Galería', galleryCount: 'capturas' }
    : { loading: 'Loading project...', error: 'The project could not be loaded.', retry: 'Retry', about: 'About the project', role: 'Role', challenge: 'Challenge', solution: 'Solution', results: 'Results', dates: 'Timeline', gallery: 'Gallery', galleryCount: 'screenshots' };
  usePageMetadata({
    title: project?.title ?? projectsPage.eyebrow,
    description: project?.summary ?? projectsPage.description,
    path: `/projects/${slug}`,
    image: project?.coverImage,
    type: project ? 'article' : 'website',
    structuredData: project ? {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description: project.summary,
      url: undefined,
      image: project.coverImage || undefined,
      dateCreated: project.startDate || project.createdAt,
    } : undefined,
  });

  if (status === 'error' && error?.status === 404) return <NotFoundPage />;
  if (status !== 'success') return <section className="page-section"><ContentFeedback copy={copy} error={error} loading={status === 'loading'} onRetry={retry} /></section>;

  return (
    <article className="page-section detail-page">
      <Link className="text-link" to="/projects">{projectsPage.back}</Link>
      {project.coverImage && <figure className="project-detail-cover"><img src={project.coverImage} alt="" /></figure>}
      <div className="detail-hero">
        <div>
          <p className="eyebrow">{project.category}</p>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
        </div>
        <div className="detail-panel">
          <StatusBadge status={project.status}>{project.status}</StatusBadge>
          <div className="tag-list">{(project.technologies ?? []).map((technology) => <span key={technology}>{technology}</span>)}</div>
        </div>
      </div>
      <div className="project-description">
        <h2>{copy.about}</h2>
        <p>{project.description}</p>
      </div>
      {(project.role || project.challenge || project.solution || (project.results ?? []).length > 0) && (
        <section className="project-case-study">
          {project.role && (
            <div className="project-case-study__role">
              <h2>{copy.role}</h2>
              <p>{project.role}</p>
            </div>
          )}
          <div className="project-case-study__grid">
            {project.challenge && (
              <article>
                <h2>{copy.challenge}</h2>
                <p>{project.challenge}</p>
              </article>
            )}
            {project.solution && (
              <article>
                <h2>{copy.solution}</h2>
                <p>{project.solution}</p>
              </article>
            )}
          </div>
          {(project.results ?? []).length > 0 && (
            <div className="project-results">
              <h2>{copy.results}</h2>
              <ul>
                {project.results.map((result) => <li key={result}>{result}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}
      {(project.startDate || project.endDate) && (
        <section className="project-dates"><h2>{copy.dates}</h2><p>{project.startDate ? formatDate(project.startDate, meta.dateLocale) : '—'} – {project.endDate ? formatDate(project.endDate, meta.dateLocale) : '—'}</p></section>
      )}
      {(project.gallery ?? []).length > 0 && (
        <section className="project-gallery-section">
          <div className="project-gallery-heading">
            <h2>{copy.gallery}</h2>
            <span>{project.gallery.length} {copy.galleryCount}</span>
          </div>
          <div className="project-gallery">
            {project.gallery.map((image, index) => (
              <figure className="project-gallery__item" key={image}>
                <img alt={`${project.title} - ${copy.gallery} ${index + 1}`} loading="lazy" src={image} />
              </figure>
            ))}
          </div>
        </section>
      )}
      {(project.liveUrl || project.repoUrl) && (
        <div className="hero-actions">
          {project.liveUrl && <a className="button button--primary" href={project.liveUrl} target="_blank" rel="noreferrer">{projectsPage.demo}</a>}
          {project.repoUrl && <a className="button button--secondary" href={project.repoUrl} target="_blank" rel="noreferrer">{projectsPage.code}</a>}
        </div>
      )}
    </article>
  );
}
