import SectionHeader from '../components/SectionHeader.jsx';
import { FacebookIcon, GitHubIcon, LinkedInIcon } from '../components/SocialIcons.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';

export default function AboutPage() {
  const { about, profile, skills, timeline } = useSiteContent();
  usePageMetadata({ title: about.eyebrow, description: about.description, path: '/about' });

  return (
    <section className="page-section">
      <SectionHeader
        as="h1"
        eyebrow={about.eyebrow}
        title={about.title}
        description={about.description}
      />
      <div className="split-layout">
        <div className="prose-block">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="hero-actions resume-cta">
            <a className="button button--primary" href={profile.resumeUrl} download>
              {about.resumeAction}
            </a>
            <a className="button button--secondary" href={profile.github} target="_blank" rel="noreferrer">
              <GitHubIcon size={18} />
              GitHub
            </a>
            <a className="button button--secondary" href={profile.linkedin} target="_blank" rel="noreferrer">
              <LinkedInIcon size={18} />
              LinkedIn
            </a>
            <a className="button button--secondary" href={profile.facebook} target="_blank" rel="noreferrer">
              <FacebookIcon size={18} />
              Facebook
            </a>
          </div>
          <div className="skill-cloud">
            {skills.map((skill) => (
              <span key={skill.id}>{skill.label}</span>
            ))}
          </div>
        </div>
        <div className="timeline">
          {timeline.map((item) => (
            <article key={item.year}>
              <span>{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
