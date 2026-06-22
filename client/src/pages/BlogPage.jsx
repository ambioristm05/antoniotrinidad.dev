import { useMemo, useState } from 'react';

import ContentFeedback from '../components/ContentFeedback.jsx';
import PostCard from '../components/PostCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { api } from '../services/api.js';
import { filterPosts } from '../services/publicContent.js';

export default function BlogPage() {
  const { blogPage, meta } = useSiteContent();
  const [query, setQuery] = useState('');
  const { data: posts = [], error, retry, status } = useApiResource(({ signal }) =>
    api.getPosts({ limit: 100, sort: '-publishedAt' }, { signal }).then((response) => response.data.posts),
  );
  const visiblePosts = useMemo(() => filterPosts(posts ?? [], query), [posts, query]);
  const copy = meta.code === 'es'
    ? { loading: 'Cargando artículos...', error: 'No se pudieron cargar los artículos.', retry: 'Reintentar', empty: 'Todavía no hay artículos publicados.', noResults: 'No encontramos artículos para esa búsqueda.' }
    : { loading: 'Loading articles...', error: 'Articles could not be loaded.', retry: 'Retry', empty: 'There are no published articles yet.', noResults: 'No articles matched that search.' };
  usePageMetadata({ title: blogPage.eyebrow, description: blogPage.description, path: '/blog' });

  return (
    <section className="page-section">
      <SectionHeader as="h1" eyebrow={blogPage.eyebrow} title={blogPage.title} description={blogPage.description} />
      <div className="search-row"><label>{blogPage.searchLabel}<input maxLength="100" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={blogPage.searchPlaceholder} type="search" /></label></div>
      {status === 'loading' || status === 'error' ? (
        <ContentFeedback copy={copy} error={error} loading={status === 'loading'} onRetry={retry} />
      ) : posts.length === 0 ? (
        <p className="content-feedback">{copy.empty}</p>
      ) : visiblePosts.length === 0 ? (
        <p className="content-feedback">{copy.noResults}</p>
      ) : (
        <div className="card-grid card-grid--three">{visiblePosts.map((post) => <PostCard key={post._id} post={post} />)}</div>
      )}
    </section>
  );
}
