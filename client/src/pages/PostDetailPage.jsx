import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import ContentFeedback from '../components/ContentFeedback.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { api } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function PostDetailPage() {
  const { slug } = useParams();
  const { blogPage, meta } = useSiteContent();
  const { data: post, error, retry, status } = useApiResource(({ signal }) =>
    api.getPost(slug, { signal }).then((response) => response.data.post), slug);
  const copy = meta.code === 'es'
    ? { loading: 'Cargando artículo...', error: 'No se pudo cargar el artículo.', retry: 'Reintentar' }
    : { loading: 'Loading article...', error: 'The article could not be loaded.', retry: 'Retry' };
  usePageMetadata({
    title: post?.title ?? blogPage.eyebrow,
    description: post?.excerpt ?? blogPage.description,
    path: `/blog/${slug}`,
    image: post?.coverImage,
    type: post ? 'article' : 'website',
    structuredData: post ? {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.coverImage || undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: { '@type': 'Person', name: post.author?.name || 'Antonio Trinidad' },
    } : undefined,
  });

  if (status === 'error' && error?.status === 404) return <NotFoundPage />;
  if (status !== 'success') return <section className="page-section"><ContentFeedback copy={copy} error={error} loading={status === 'loading'} onRetry={retry} /></section>;

  return (
    <article className="page-section article-page">
      <Link className="text-link" to="/blog">{blogPage.back}</Link>
      <header>
        <p className="eyebrow">{post.category}</p>
        <h1>{post.title}</h1>
        <div className="post-card__meta article-meta">
          <span>{formatDate(post.publishedAt, meta.dateLocale)}</span>
          <span>{post.readingTime} {blogPage.readingLabel}</span>
          {post.author?.name && <span>{post.author.name}</span>}
        </div>
      </header>
      <p className="article-lede">{post.excerpt}</p>
      {post.coverImage && <figure className="article-cover"><img src={post.coverImage} alt="" /></figure>}
      <div className="article-body markdown-body"><Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown></div>
      {(post.tags ?? []).length > 0 && <div className="tag-list article-tags">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
    </article>
  );
}
