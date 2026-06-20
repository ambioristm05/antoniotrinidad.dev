import SectionHeader from '../components/SectionHeader.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

export default function AboutPage() {
  const { about, skills, timeline } = useSiteContent();

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow={about.eyebrow}
        title={about.title}
        description={about.description}
      />
      <div className="split-layout">
        <div className="prose-block">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="skill-cloud">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
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
