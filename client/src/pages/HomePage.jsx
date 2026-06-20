import { Link } from 'react-router-dom';

import PostCard from '../components/PostCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

export default function HomePage() {
  const { home, posts, profile, projects, skills } = useSiteContent();
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const featuredPosts = posts.filter((post) => post.featured).slice(0, 3);

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
        <div className="card-grid card-grid--four card-grid--projects">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="content-section content-section--muted">
        <SectionHeader
          eyebrow={home.stack.eyebrow}
          title={home.stack.title}
          description={home.stack.description}
        />
        <div className="skill-cloud">
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeader
          eyebrow={home.blog.eyebrow}
          title={home.blog.title}
          description={home.blog.description}
        />
        <div className="card-grid card-grid--three">
          {featuredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
