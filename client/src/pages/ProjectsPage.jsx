import { useEffect, useMemo, useState } from 'react';

import ProjectCard from '../components/ProjectCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

export default function ProjectsPage() {
  const { projects, projectsPage } = useSiteContent();
  const [filter, setFilter] = useState(projectsPage.all);
  const categories = [projectsPage.all, ...new Set(projects.map((project) => project.category))];

  useEffect(() => {
    setFilter(projectsPage.all);
  }, [projectsPage.all]);

  const visibleProjects = useMemo(
    () => (filter === projectsPage.all ? projects : projects.filter((project) => project.category === filter)),
    [filter, projects, projectsPage.all],
  );

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow={projectsPage.eyebrow}
        title={projectsPage.title}
        description={projectsPage.description}
      />
      <div className="filter-bar" aria-label={projectsPage.eyebrow}>
        {categories.map((category) => (
          <button
            className={filter === category ? 'is-active' : ''}
            key={category}
            onClick={() => setFilter(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
      <div className="card-grid card-grid--three card-grid--projects">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
