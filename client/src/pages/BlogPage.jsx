import { useEffect, useMemo, useRef, useState } from 'react';

import PostCard from '../components/PostCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useSiteContent } from '../hooks/useSiteContent.js';

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const { blogPage, posts } = useSiteContent();
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const loadMoreRef = useRef(null);

  const filteredPosts = useMemo(() => {
    const sortedPosts = [...posts].sort((firstPost, secondPost) => new Date(secondPost.publishedAt) - new Date(firstPost.publishedAt));
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return sortedPosts;
    }

    return sortedPosts.filter((post) => {
      const content = `${post.title} ${post.excerpt} ${post.category} ${post.tags.join(' ')}`.toLowerCase();
      return content.includes(normalizedQuery);
    });
  }, [posts, query]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMorePosts = visibleCount < filteredPosts.length;

  useEffect(() => {
    setVisibleCount(POSTS_PER_PAGE);
  }, [query]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMorePosts) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((currentCount) => Math.min(currentCount + POSTS_PER_PAGE, filteredPosts.length));
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [filteredPosts.length, hasMorePosts]);

  return (
    <section className="page-section">
      <SectionHeader
        eyebrow={blogPage.eyebrow}
        title={blogPage.title}
        description={blogPage.description}
      />
      <div className="search-row">
        <label>
          {blogPage.searchLabel}
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={blogPage.searchPlaceholder} />
        </label>
      </div>
      <div className="card-grid card-grid--three">
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {hasMorePosts ? <div ref={loadMoreRef} className="load-more-sentinel" aria-hidden="true" /> : null}
    </section>
  );
}
