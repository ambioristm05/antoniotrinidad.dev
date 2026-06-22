import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';

export default function NotFoundPage() {
  const { notFound } = useSiteContent();
  usePageMetadata({ title: '404', description: notFound.description, path: window.location.pathname, noIndex: true });

  useEffect(() => {
    document.body.dataset.hideFooter = 'true';

    return () => {
      delete document.body.dataset.hideFooter;
    };
  }, []);

  return (
    <section className="page-section empty-state empty-state--visual">
      <img className="empty-state__image" src="/brand/404-error-illustration.svg" alt="" />
      <div className="empty-state__content">
        <p className="eyebrow">{notFound.eyebrow}</p>
        <h1>{notFound.title}</h1>
        <p>{notFound.description}</p>
        <Link className="button button--primary" to="/">
          {notFound.action}
        </Link>
      </div>
    </section>
  );
}
