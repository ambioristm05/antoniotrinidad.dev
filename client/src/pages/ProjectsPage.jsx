import { useEffect, useMemo, useState } from 'react';

import ContentFeedback from '../components/ContentFeedback.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { api } from '../services/api.js';
import { filterProjects, getProjectCategories } from '../services/publicContent.js';

export default function ProjectsPage() {
  const { meta, projectsPage } = useSiteContent();
  const [filter, setFilter] = useState('');
  const { data: projects = [], error, retry, status } = useApiResource(({ signal }) =>
    api.getProjects({ limit: 100, sort: '-createdAt', status: 'completed' }, { signal })
      .then((response) => response.data.projects),
  );
  const copy = meta.code === 'es'
    ? { loading: 'Cargando proyectos...', error: 'No se pudieron cargar los proyectos.', retry: 'Reintentar', empty: 'Todavía no hay proyectos publicados.' }
    : { loading: 'Loading projects...', error: 'Projects could not be loaded.', retry: 'Retry', empty: 'There are no published projects yet.' };
  const categories = useMemo(() => getProjectCategories(projects ?? []), [projects]);
  const visibleProjects = useMemo(() => filterProjects(projects ?? [], filter), [filter, projects]);
  usePageMetadata({ title: projectsPage.eyebrow, description: projectsPage.description, path: '/projects' });

  useEffect(() => {
    if (filter && !categories.includes(filter)) setFilter('');
  }, [categories, filter]);

  return (
    <section className="page-section">
      <SectionHeader as="h1" eyebrow={projectsPage.eyebrow} title={projectsPage.title} description={projectsPage.description} />
      {status === 'loading' || status === 'error' ? (
        <ContentFeedback copy={copy} error={error} loading={status === 'loading'} onRetry={retry} />
      ) : projects.length === 0 ? (
        <p className="content-feedback">{copy.empty}</p>
      ) : (
        <>
          <div className="filter-bar" aria-label={projectsPage.eyebrow}>
            <button className={!filter ? 'is-active' : ''} onClick={() => setFilter('')} type="button">{projectsPage.all}</button>
            {categories.map((category) => <button className={filter === category ? 'is-active' : ''} key={category} onClick={() => setFilter(category)} type="button">{category}</button>)}
          </div>
          <div className="card-grid card-grid--three card-grid--projects">
            {visibleProjects.map((project) => <ProjectCard key={project._id} project={project} />)}
          </div>
        </>
      )}
    </section>
  );
}
