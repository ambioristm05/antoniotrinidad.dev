import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import ContentFeedback from '../components/ContentFeedback.jsx';
import { useApiResource } from '../hooks/useApiResource.js';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { usePageMetadata } from '../hooks/usePageMetadata.js';
import { api } from '../services/api.js';
import {
  addComment,
  addReplyToComment,
  commentFormToPayload,
  emptyCommentForm,
  emptyReplyForm,
  replyFormToPayload,
} from '../services/postComments.js';
import { formatDate, formatDateTime } from '../utils/formatters.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function PostDetailPage() {
  const { slug } = useParams();
  const { blogPage, meta } = useSiteContent();
  const commentsCopy = blogPage.comments;
  const { data: post, error, retry, status } = useApiResource(({ signal }) =>
    api.getPost(slug, { signal }).then((response) => response.data.post), slug);
  const [comments, setComments] = useState([]);
  const [commentsStatus, setCommentsStatus] = useState('idle');
  const [commentsError, setCommentsError] = useState('');
  const [commentForm, setCommentForm] = useState(emptyCommentForm);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyForms, setReplyForms] = useState({});
  const [sendingComment, setSendingComment] = useState(false);
  const [sendingReplyId, setSendingReplyId] = useState(null);
  const copy = meta.code === 'es'
    ? { loading: 'Cargando artículo...', error: 'No se pudo cargar el artículo.', retry: 'Reintentar', commentsLoading: 'Cargando comentarios...', commentsError: 'No se pudieron cargar los comentarios.', emptyComments: 'Sé la primera persona en comentar este artículo.', submitError: 'No se pudo publicar. Inténtalo de nuevo.', namePlaceholder: 'Ej. María Santos', emailPlaceholder: 'maria@email.com', website: 'Sitio web' }
    : { loading: 'Loading article...', error: 'The article could not be loaded.', retry: 'Retry', commentsLoading: 'Loading comments...', commentsError: 'Comments could not be loaded.', emptyComments: 'Be the first person to comment on this article.', submitError: 'Could not publish. Please try again.', namePlaceholder: 'e.g. Maria Santos', emailPlaceholder: 'maria@email.com', website: 'Website' };
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

  useEffect(() => {
    if (status !== 'success') return undefined;

    const controller = new AbortController();
    setCommentsStatus('loading');
    setCommentsError('');

    api.getPostComments(slug, { limit: 50 }, { signal: controller.signal })
      .then((response) => {
        setComments(response.data.comments);
        setCommentsStatus('success');
      })
      .catch((requestError) => {
        if (requestError?.code === 'ABORTED') return;
        setCommentsError(requestError.message || copy.commentsError);
        setCommentsStatus('error');
      });

    return () => controller.abort();
  }, [copy.commentsError, slug, status]);

  const handleCommentChange = ({ target }) => {
    setCommentForm((current) => ({ ...current, [target.name]: target.value }));
    setCommentsError('');
  };

  const handleReplyChange = (commentId, { target }) => {
    setReplyForms((current) => ({
      ...current,
      [commentId]: {
        ...(current[commentId] ?? emptyReplyForm),
        [target.name]: target.value,
      },
    }));
    setCommentsError('');
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    setSendingComment(true);
    setCommentsError('');

    try {
      const response = await api.createPostComment(slug, commentFormToPayload(commentForm));
      setComments((current) => addComment(current, response.data.comment));
      setCommentForm(emptyCommentForm);
      setCommentsStatus('success');
    } catch (requestError) {
      setCommentsError(requestError.message || copy.submitError);
    } finally {
      setSendingComment(false);
    }
  };

  const handleReplySubmit = async (event, commentId) => {
    event.preventDefault();
    setSendingReplyId(commentId);
    setCommentsError('');

    try {
      const form = replyForms[commentId] ?? emptyReplyForm;
      const response = await api.createPostCommentReply(slug, commentId, replyFormToPayload(form));
      setComments((current) => addReplyToComment(current, commentId, response.data.reply));
      setReplyForms((current) => ({ ...current, [commentId]: emptyReplyForm }));
      setActiveReplyId(null);
    } catch (requestError) {
      setCommentsError(requestError.message || copy.submitError);
    } finally {
      setSendingReplyId(null);
    }
  };

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
      <section className="comments-section" aria-labelledby="comments-title">
        <div className="comments-section__header">
          <div>
            <p className="eyebrow">{commentsCopy.eyebrow}</p>
            <h2 id="comments-title">{commentsCopy.title}</h2>
          </div>
        </div>

        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <div className="contact-honeypot" aria-hidden="true">
            <label htmlFor="comment-website">{copy.website}</label>
            <input autoComplete="off" id="comment-website" name="website" onChange={handleCommentChange} tabIndex="-1" value={commentForm.website} />
          </div>
          <div className="form-grid">
            <label>
              {meta.code === 'es' ? 'Nombre' : 'Name'}
              <input autoComplete="name" maxLength="100" minLength="2" name="authorName" onChange={handleCommentChange} placeholder={copy.namePlaceholder} required value={commentForm.authorName} />
            </label>
            <label>
              Email
              <input autoComplete="email" maxLength="254" name="authorEmail" onChange={handleCommentChange} placeholder={copy.emailPlaceholder} required type="email" value={commentForm.authorEmail} />
            </label>
          </div>
          <div className="comment-composer__control">
            <textarea aria-label={commentsCopy.messageLabel} maxLength="3000" minLength="3" name="message" onChange={handleCommentChange} placeholder={commentsCopy.messagePlaceholder} required rows="2" value={commentForm.message} />
            <button className="button button--primary" disabled={sendingComment} type="submit">
              {sendingComment ? `${commentsCopy.submit}...` : commentsCopy.submit}
            </button>
          </div>
        </form>

        {commentsStatus === 'loading' && <p className="content-feedback">{copy.commentsLoading}</p>}
        {commentsError && <p className="form-error" role="alert">{commentsError}</p>}
        {commentsStatus === 'success' && comments.length === 0 && <p className="content-feedback">{copy.emptyComments}</p>}

        <div className="comment-list">
          {comments.map((comment) => {
            const replyForm = replyForms[comment._id] ?? emptyReplyForm;

            return (
              <article className="comment-item" key={comment._id}>
                <header>
                  <div className="comment-author">
                    <strong>{comment.authorName}</strong>
                  </div>
                  <time dateTime={comment.createdAt}>{formatDateTime(comment.createdAt, meta.dateLocale)}</time>
                </header>
                <p>{comment.message}</p>
                <button className="text-link text-link--button" type="button" onClick={() => setActiveReplyId((current) => (current === comment._id ? null : comment._id))}>
                  {commentsCopy.reply}
                </button>
                {(comment.replies ?? []).length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map((reply) => (
                      <article className="comment-reply" key={reply._id}>
                        <header>
                          <strong>{reply.authorName}</strong>
                          <time dateTime={reply.createdAt}>{formatDateTime(reply.createdAt, meta.dateLocale)}</time>
                        </header>
                        <p>{reply.message}</p>
                      </article>
                    ))}
                  </div>
                )}
                {activeReplyId === comment._id && (
                  <form className="reply-form" onSubmit={(event) => handleReplySubmit(event, comment._id)}>
                    <div className="form-grid">
                      <label>
                        {meta.code === 'es' ? 'Nombre' : 'Name'}
                        <input autoComplete="name" maxLength="100" minLength="2" name="authorName" onChange={(event) => handleReplyChange(comment._id, event)} placeholder={copy.namePlaceholder} required value={replyForm.authorName} />
                      </label>
                      <label>
                        Email
                        <input autoComplete="email" maxLength="254" name="authorEmail" onChange={(event) => handleReplyChange(comment._id, event)} placeholder={copy.emailPlaceholder} type="email" value={replyForm.authorEmail} />
                      </label>
                    </div>
                    <div className="comment-composer__control">
                      <textarea aria-label={commentsCopy.replyLabel} maxLength="1500" minLength="3" name="message" onChange={(event) => handleReplyChange(comment._id, event)} placeholder={commentsCopy.replyPlaceholder} required rows="2" value={replyForm.message} />
                      <button className="button button--primary button--small" disabled={sendingReplyId === comment._id} type="submit">
                        {sendingReplyId === comment._id ? `${commentsCopy.submitReply}...` : commentsCopy.submitReply}
                      </button>
                    </div>
                    <div className="form-actions">
                      <button className="button button--secondary button--small" type="button" onClick={() => setActiveReplyId(null)}>
                        {commentsCopy.cancel}
                      </button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </article>
  );
}
