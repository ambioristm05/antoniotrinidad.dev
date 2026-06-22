import { Link } from 'react-router-dom';

import PostCard from '../components/PostCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import StackIcon from '../components/StackIcon.jsx';
import ContentFeedback from '../components/ContentFeedback.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { useApiResource } from '../hooks/useApiResource.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { api } from '../services/api.js';
import { env } from '../config/env.js';

export default function HomePage() {
  const { home, meta, profile, skills } = useSiteContent();
  const { data, error, retry, status } = useApiResource(({ signal }) =>
    Promise.all([api.getFeaturedProjects({ signal }), api.getFeaturedPosts({ signal })]).then(([projects, posts]) => ({
      projects: projects.data.projects.slice(0, 4),
      posts: posts.data.posts.slice(0, 3),
    })),
  );
  const featuredProjects = data?.projects ?? [];
  const featuredPosts = data?.posts ?? [];
  const feedbackCopy = meta.code === 'es'
    ? { loading: 'Cargando contenido...', error: 'No se pudo cargar el contenido destacado.', retry: 'Reintentar', noProjects: 'Todavía no hay proyectos destacados.', noPosts: 'Todavía no hay artículos destacados.' }
    : { loading: 'Loading content...', error: 'Featured content could not be loaded.', retry: 'Retry', noProjects: 'There are no featured projects yet.', noPosts: 'There are no featured articles yet.' };
  usePageMetadata({
    description: profile.tagline,
    path: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      url: env.siteUrl,
      jobTitle: profile.role,
      email: profile.email,
    },
  });

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">{profile.role}</p>
          <h1>{profile.name}</h1>
          <p className="hero-lede">{profile.tagline}</p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/projects">
              {home.primaryAction}
            </Link>
            <Link className="button button--secondary" to="/contact">
              {home.secondaryAction}
            </Link>
          </div>
          <dl className="metric-row">
            {profile.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="terminal-window">
          <div className="terminal-window__bar">
              <span />
              <span />
              <span />
            </div>
            <pre>{home.terminal}</pre>
          </div>
          <div className="signal-strip">
            <span>API</span>
            <span>UI</span>
            <span>SEO</span>
          </div>
        </div>
      </section>

      <section className="content-section content-section--featured">
        <SectionHeader
          eyebrow={home.featuredProjects.eyebrow}
          title={home.featuredProjects.title}
          description={home.featuredProjects.description}
        />
        {status === 'loading' || status === 'error' ? (
          <ContentFeedback copy={feedbackCopy} error={error} loading={status === 'loading'} onRetry={retry} />
        ) : featuredProjects.length === 0 ? (
          <p className="content-feedback">{feedbackCopy.noProjects}</p>
        ) : (
          <div className="card-grid card-grid--four card-grid--projects">
            {featuredProjects.map((project) => <ProjectCard key={project._id} project={project} />)}
          </div>
        )}
      </section>

      <section className="content-section content-section--muted">
        <div className="content-section__inner">
          <SectionHeader
            eyebrow={home.stack.eyebrow}
            title={home.stack.title}
            description={home.stack.description}
          />
          <ul className="stack-icon-grid" aria-label={home.stack.title}>
            {skills.map((skill) => (
              <li className={`stack-icon-grid__item stack-icon-grid__item--${skill.id}`} key={skill.id} title={skill.label}>
                <StackIcon id={skill.id} />
                <span className="sr-only">{skill.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="content-section">
        <SectionHeader
          eyebrow={home.blog.eyebrow}
          title={home.blog.title}
          description={home.blog.description}
        />
        {status === 'loading' || status === 'error' ? (
          <ContentFeedback copy={feedbackCopy} error={error} loading={status === 'loading'} onRetry={retry} />
        ) : featuredPosts.length === 0 ? (
          <p className="content-feedback">{feedbackCopy.noPosts}</p>
        ) : (
          <div className="card-grid card-grid--three">
            {featuredPosts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        )}
      </section>
    </>
  );
}
