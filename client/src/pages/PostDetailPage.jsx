import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useSiteContent } from '../hooks/useSiteContent.js';
import { findBySlug, formatDate } from '../utils/formatters.js';
import NotFoundPage from './NotFoundPage.jsx';

const userStorageKeys = ['antoniotrinidad:user', 'portfolio:user', 'currentUser', 'user', 'profile'];
const defaultAvatarUrl = '/brand/default-user-avatar.svg';

function extractBrowserUser(fallbackName = 'Visitante') {
  const fallbackUser = { name: fallbackName, avatarUrl: '' };

  if (typeof window === 'undefined') {
    return fallbackUser;
  }

  for (const key of userStorageKeys) {
    let storedValue = '';

    try {
      storedValue = window.localStorage.getItem(key);
    } catch {
      return fallbackUser;
    }

    if (!storedValue) {
      continue;
    }

    try {
      const userData = JSON.parse(storedValue);
      const name = userData.name ?? userData.displayName ?? userData.username ?? userData.email;
      const avatarUrl = userData.avatarUrl ?? userData.avatar ?? userData.photoURL ?? userData.image ?? '';

      if (name) {
        return { name, avatarUrl };
      }
    } catch {
      return { name: storedValue, avatarUrl: '' };
    }
  }

  return fallbackUser;
}

function UserAvatar({ name, avatarUrl }) {
  return (
    <img
      className="user-avatar"
      src={avatarUrl || defaultAvatarUrl}
      alt=""
      loading="lazy"
      title={name}
      onError={(event) => {
        if (event.currentTarget.src.endsWith(defaultAvatarUrl)) {
          return;
        }

        event.currentTarget.src = defaultAvatarUrl;
      }}
    />
  );
}

function autoGrowTextarea(event) {
  const textarea = event.currentTarget;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export default function PostDetailPage() {
  const { slug } = useParams();
  const { blogPage, meta, posts } = useSiteContent();
  const post = findBySlug(posts, slug);
  const commentsCopy = blogPage.comments;

  const initialComments = useMemo(() => {
    if (!post) {
      return [];
    }

    return commentsCopy.samples
      .map((comment, index) => ({
        ...comment,
        id: `${post.id}-comment-${index}`,
        replies: comment.replies ?? [],
      }))
      .sort((firstComment, secondComment) => new Date(secondComment.createdAt) - new Date(firstComment.createdAt));
  }, [commentsCopy.samples, post]);

  const [comments, setComments] = useState(initialComments);
  const [showAllComments, setShowAllComments] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => extractBrowserUser(commentsCopy.guestName));
  const [commentMessage, setCommentMessage] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyForms, setReplyForms] = useState({});

  useEffect(() => {
    setComments(initialComments);
    setShowAllComments(false);
    setActiveReplyId(null);
    setCurrentUser(extractBrowserUser(commentsCopy.guestName));
    setCommentMessage('');
    setReplyForms({});
  }, [initialComments]);

  if (!post) {
    return <NotFoundPage />;
  }

  const visibleComments = showAllComments ? comments : comments.slice(0, 10);
  const getAvatarUrl = (author, avatarUrl) => {
    if (author === post.author && currentUser.avatarUrl) {
      return currentUser.avatarUrl;
    }

    return avatarUrl;
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!commentMessage.trim()) {
      return;
    }

    setComments((currentComments) => [
      {
        id: `comment-${Date.now()}`,
        author: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        text: commentMessage.trim(),
        createdAt: new Date().toISOString(),
        replies: [],
      },
      ...currentComments,
    ]);
    setCommentMessage('');
    requestAnimationFrame(() => {
      const textarea = form.querySelector('textarea');
      if (textarea) {
        textarea.style.height = '';
      }
    });
  };

  const handleReplySubmit = (event, commentId) => {
    event.preventDefault();
    const form = event.currentTarget;
    const replyMessage = replyForms[commentId] ?? '';

    if (!replyMessage.trim()) {
      return;
    }

    setComments((currentComments) =>
      currentComments.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        return {
          ...comment,
          replies: [
            {
              id: `reply-${Date.now()}`,
              author: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
              text: replyMessage.trim(),
              createdAt: new Date().toISOString(),
            },
            ...comment.replies,
          ],
        };
      }),
    );
    setReplyForms((currentForms) => ({ ...currentForms, [commentId]: '' }));
    setActiveReplyId(null);
    requestAnimationFrame(() => {
      const textarea = form.querySelector('textarea');
      if (textarea) {
        textarea.style.height = '';
      }
    });
  };

  return (
    <article className="page-section article-page">
      <Link className="text-link" to="/blog">
        {blogPage.back}
      </Link>
      <header>
        <p className="eyebrow">{post.category}</p>
        <h1>{post.title}</h1>
        <div className="post-card__meta article-meta">
          <span>{formatDate(post.publishedAt, meta.dateLocale)}</span>
          <span>
            {post.readingTime} {blogPage.readingLabel}
          </span>
          <span>{post.author}</span>
        </div>
      </header>
      <p className="article-lede">{post.excerpt}</p>
      {post.imageUrl ? (
        <figure className="article-cover">
          <img src={post.imageUrl} alt={post.imageAlt ?? ''} />
        </figure>
      ) : null}
      <div className="article-body">
        <p>{post.content}</p>
        <h2>{blogPage.mainIdea}</h2>
        <p>{blogPage.mainIdeaText}</p>
      </div>
      <section className="comments-section" aria-labelledby="comments-title">
        <div className="comments-section__header">
          <div>
            <p className="eyebrow">{commentsCopy.eyebrow}</p>
            <h2 id="comments-title">{commentsCopy.title}</h2>
          </div>
          {comments.length > 10 ? (
            <button className="text-link text-link--button" type="button" onClick={() => setShowAllComments((value) => !value)}>
              {showAllComments ? commentsCopy.showRecent : commentsCopy.showAll}
            </button>
          ) : null}
        </div>

        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <div className="comment-composer__user">
            <UserAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} />
            <strong>{currentUser.name}</strong>
          </div>
          <div className="comment-composer__control">
            <textarea
              value={commentMessage}
              aria-label={commentsCopy.messageLabel}
              onInput={autoGrowTextarea}
              onChange={(event) => setCommentMessage(event.target.value)}
              placeholder={commentsCopy.messagePlaceholder}
              rows="1"
            />
            <button className="button button--primary" type="submit">
              {commentsCopy.submit}
            </button>
          </div>
        </form>

        <div className="comment-list">
          {visibleComments.map((comment) => {
            const replyMessage = replyForms[comment.id] ?? '';

            return (
              <article className="comment-item" key={comment.id}>
                <header>
                  <div className="comment-author">
                    <UserAvatar name={comment.author} avatarUrl={getAvatarUrl(comment.author, comment.avatarUrl)} />
                    <strong>{comment.author}</strong>
                  </div>
                </header>
                <p>{comment.text}</p>
                <button className="text-link text-link--button" type="button" onClick={() => setActiveReplyId(comment.id)}>
                  {commentsCopy.reply}
                </button>
                {comment.replies.length > 0 ? (
                  <div className="comment-replies">
                    {comment.replies.map((reply) => (
                      <article className="comment-reply" key={reply.id}>
                        <header>
                          <div className="comment-author">
                            <UserAvatar name={reply.author} avatarUrl={getAvatarUrl(reply.author, reply.avatarUrl)} />
                            <strong>{reply.author}</strong>
                          </div>
                        </header>
                        <p>{reply.text}</p>
                      </article>
                    ))}
                  </div>
                ) : null}
                {activeReplyId === comment.id ? (
                  <form className="reply-form" onSubmit={(event) => handleReplySubmit(event, comment.id)}>
                    <div className="comment-composer__user">
                      <UserAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} />
                      <strong>{currentUser.name}</strong>
                    </div>
                    <div className="comment-composer__control">
                      <textarea
                        value={replyMessage}
                        aria-label={commentsCopy.replyLabel}
                        onInput={autoGrowTextarea}
                        onChange={(event) =>
                          setReplyForms((currentForms) => ({
                            ...currentForms,
                            [comment.id]: event.target.value,
                          }))
                        }
                        placeholder={commentsCopy.replyPlaceholder}
                        rows="1"
                      />
                      <button className="button button--primary button--small" type="submit">
                        {commentsCopy.submitReply}
                      </button>
                    </div>
                    <div className="form-actions">
                      <button className="button button--secondary button--small" type="button" onClick={() => setActiveReplyId(null)}>
                        {commentsCopy.cancel}
                      </button>
                    </div>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </article>
  );
}
