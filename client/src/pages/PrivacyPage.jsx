import { Link } from 'react-router-dom';

import SectionHeader from '../components/SectionHeader.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

const siteName = 'antoniotrinidad.dev';

export default function PrivacyPage() {
  const { privacy } = useSiteContent();

  return (
    <section className="page-section article-page">
      <SectionHeader
        eyebrow={privacy.eyebrow}
        title={privacy.title}
        description={linkSiteName(privacy.description)}
      />
      <div className="article-body">
        {privacy.responsible ? (
          <section className="privacy-section">
            <h2>{privacy.responsible.title}</h2>
            <dl className="privacy-list">
              {privacy.responsible.items.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>
                    {renderLink(item)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
        {privacy.sections ? (
          privacy.sections.map((section) => (
            <section className="privacy-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{linkSiteName(paragraph)}</p>
              ))}
              {section.items ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.link ? (
                <p>
                  {section.link.before}
                  <a href={section.link.href}>{section.link.label}</a>
                  {section.link.after}
                </p>
              ) : null}
            </section>
          ))
        ) : (
          privacy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        )}
      </div>
    </section>
  );
}

function linkSiteName(text) {
  if (!text?.includes(siteName)) {
    return text;
  }

  const parts = text.split(siteName);

  return parts.map((part, index) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 ? <Link to="/">{siteName}</Link> : null}
    </span>
  ));
}

function renderLink(item) {
  if (!item.href) {
    return item.value === siteName ? <Link to="/">{item.value}</Link> : item.value;
  }

  if (item.href.startsWith('/')) {
    return <Link to={item.href}>{item.value}</Link>;
  }

  return <a href={item.href}>{item.value}</a>;
}
