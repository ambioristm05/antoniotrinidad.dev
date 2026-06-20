import { Link } from 'react-router-dom';

import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { formatDate } from '../utils/formatters.js';

export default function PostCard({ post }) {
  const { language } = usePreferences();
  const { blogPage, meta } = useSiteContent();

  return (
    <article className="post-card">
      {post.imageUrl ? (
        <Link className="post-card__media" to={`/blog/${post.slug}`} aria-label={post.title}>
          <img src={post.imageUrl} alt={post.imageAlt ?? ''} loading="lazy" />
        </Link>
      ) : null}
      <div className="post-card__body">
        <div className="post-card__meta">
          <span>{post.category}</span>
          <span>{formatDate(post.publishedAt, meta.dateLocale)}</span>
          <span>
            {post.readingTime} {language === 'es' ? meta.readingUnit : blogPage.readingLabel}
          </span>
        </div>
        <h3>
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>{post.excerpt}</p>
        <div className="tag-list" aria-label={blogPage.tagsLabel}>
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="post-card__actions">
          <Link className="button button--primary button--small" to={`/blog/${post.slug}`}>
            {blogPage.cardLink}
          </Link>
        </div>
      </div>
    </article>
  );
}
