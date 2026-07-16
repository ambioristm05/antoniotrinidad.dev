import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import StatusBadge from '../components/StatusBadge.jsx';
import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { api } from '../services/api.js';
import { buildEmailComposeUrl } from '../services/emailLinks.js';
import { formatDateTime } from '../utils/formatters.js';

const copyByLanguage = {
  es: {
    eyebrow: 'Blog',
    title: 'Moderación de comentarios',
    search: 'Buscar comentarios',
    searchPlaceholder: 'Autor, email o contenido',
    filters: { all: 'Todos', hidden: 'Pendientes', visible: 'Publicados' },
    statuses: { hidden: 'Pendiente', visible: 'Publicado' },
    loading: 'Cargando comentarios...',
    empty: 'No hay comentarios con estos filtros.',
    select: 'Selecciona un comentario para revisarlo.',
    loadError: 'No se pudieron cargar los comentarios.',
    updateError: 'No se pudo actualizar el comentario.',
    deleteError: 'No se pudo eliminar el comentario.',
    publish: 'Publicar',
    hide: 'Ocultar',
    remove: 'Eliminar',
    confirmDelete: '¿Eliminar este comentario definitivamente?',
    previous: 'Página anterior',
    next: 'Página siguiente',
    page: 'Página',
    of: 'de',
    author: 'Autor',
    post: 'Artículo',
    received: 'Recibido',
    replies: 'Respuestas',
  },
  en: {
    eyebrow: 'Blog',
    title: 'Comment moderation',
    search: 'Search comments',
    searchPlaceholder: 'Author, email or content',
    filters: { all: 'All', hidden: 'Pending', visible: 'Published' },
    statuses: { hidden: 'Pending', visible: 'Published' },
    loading: 'Loading comments...',
    empty: 'There are no comments matching these filters.',
    select: 'Select a comment to review it.',
    loadError: 'Comments could not be loaded.',
    updateError: 'The comment could not be updated.',
    deleteError: 'The comment could not be deleted.',
    publish: 'Publish',
    hide: 'Hide',
    remove: 'Delete',
    confirmDelete: 'Permanently delete this comment?',
    previous: 'Previous page',
    next: 'Next page',
    page: 'Page',
    of: 'of',
    author: 'Author',
    post: 'Article',
    received: 'Received',
    replies: 'Replies',
  },
};

const removeComment = (comments, id) => comments.filter((comment) => comment._id !== id);
const replaceComment = (comments, updatedComment) =>
  comments.map((comment) => (comment._id === updatedComment._id ? updatedComment : comment));

export default function AdminCommentsPage() {
  const { language } = usePreferences();
  const labels = copyByLanguage[language] ?? copyByLanguage.es;
  const [comments, setComments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('hidden');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError('');
    setSelected(null);

    api.getAdminComments(buildCommentQuery({ filter, page, search }), { signal: controller.signal })
      .then((response) => {
        setComments(response.data.comments);
        setPagination(response.pagination);
        setStatus('success');
      })
      .catch((requestError) => {
        if (requestError.code === 'ABORTED') return;
        setError(requestError.message || labels.loadError);
        setStatus('error');
      });

    return () => controller.abort();
  }, [filter, labels.loadError, page, search]);

  const selectFilter = (nextFilter) => {
    setFilter(nextFilter);
    setPage(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const updateStatus = async (nextStatus) => {
    if (!selected || updating) return;

    setUpdating(true);
    setError('');
    try {
      const response = await api.updateComment(selected._id, { status: nextStatus });
      const updatedComment = response.data.comment;
      setSelected(updatedComment);

      if (filter !== 'all' && filter !== nextStatus) {
        setComments((current) => removeComment(current, updatedComment._id));
        setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
      } else {
        setComments((current) => replaceComment(current, updatedComment));
      }
    } catch (requestError) {
      setError(requestError.message || labels.updateError);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || updating || !window.confirm(labels.confirmDelete)) return;

    setUpdating(true);
    setError('');
    try {
      await api.deleteComment(selected._id);
      setComments((current) => removeComment(current, selected._id));
      setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
      setSelected(null);
    } catch (requestError) {
      setError(requestError.message || labels.deleteError);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div><p className="eyebrow">{labels.eyebrow}</p><h1>{labels.title}</h1></div>
        <strong className="message-total">{pagination.total}</strong>
      </div>

      <form className="message-search" onSubmit={handleSearch} role="search">
        <label htmlFor="comment-search">{labels.search}</label>
        <div>
          <input id="comment-search" maxLength="100" onChange={(event) => setSearchInput(event.target.value)} placeholder={labels.searchPlaceholder} type="search" value={searchInput} />
          <button aria-label={labels.search} className="icon-button" title={labels.search} type="submit"><Search aria-hidden="true" size={18} /></button>
        </div>
      </form>

      <div className="filter-bar message-filters" aria-label={labels.title}>
        {Object.entries(labels.filters).map(([value, label]) => (
          <button aria-pressed={filter === value} className={filter === value ? 'is-active' : ''} key={value} onClick={() => selectFilter(value)} type="button">{label}</button>
        ))}
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="messages-layout">
        <section className="message-inbox" aria-busy={status === 'loading'}>
          {status === 'loading' ? (
            <p className="admin-state">{labels.loading}</p>
          ) : status === 'error' && comments.length === 0 ? null : comments.length === 0 ? (
            <p className="admin-state">{labels.empty}</p>
          ) : (
            <div className="message-list">
              {comments.map((comment) => (
                <button className={`message-item${selected?._id === comment._id ? ' is-selected' : ''}${comment.status === 'hidden' ? ' is-unread' : ''}`} key={comment._id} onClick={() => setSelected(comment)} type="button">
                  <StatusBadge status={comment.status}>{labels.statuses[comment.status]}</StatusBadge>
                  <strong>{comment.authorName}</strong>
                  <small>{comment.post?.title ?? '-'} · {formatDateTime(comment.createdAt, language === 'es' ? 'es-DO' : 'en-US')}</small>
                </button>
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="message-pagination">
              <button aria-label={labels.previous} className="icon-button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} title={labels.previous} type="button"><ChevronLeft aria-hidden="true" size={18} /></button>
              <span>{labels.page} {pagination.page} {labels.of} {pagination.pages}</span>
              <button aria-label={labels.next} className="icon-button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)} title={labels.next} type="button"><ChevronRight aria-hidden="true" size={18} /></button>
            </div>
          )}
        </section>

        <section className="message-detail" aria-live="polite">
          {selected ? (
            <>
              <header>
                <StatusBadge status={selected.status}>{labels.statuses[selected.status]}</StatusBadge>
                <h2>{selected.authorName}</h2>
                <dl>
                  <div><dt>{labels.author}</dt><dd>{selected.authorName}{selected.authorEmail ? <> · <a href={buildEmailComposeUrl({ email: selected.authorEmail })} rel="noreferrer" target="_blank">{selected.authorEmail}</a></> : null}</dd></div>
                  <div><dt>{labels.post}</dt><dd>{selected.post?.slug ? <Link to={`/blog/${selected.post.slug}`}>{selected.post.title}</Link> : '-'}</dd></div>
                  <div><dt>{labels.received}</dt><dd>{formatDateTime(selected.createdAt, language === 'es' ? 'es-DO' : 'en-US')}</dd></div>
                  <div><dt>{labels.replies}</dt><dd>{selected.replies?.length ?? 0}</dd></div>
                </dl>
              </header>
              <p className="message-detail__body">{selected.message}</p>
              <div className="message-actions">
                {selected.status === 'hidden' ? (
                  <button className="button button--primary" disabled={updating} onClick={() => updateStatus('visible')} type="button"><CheckCircle2 aria-hidden="true" size={17} />{labels.publish}</button>
                ) : (
                  <button className="button button--secondary" disabled={updating} onClick={() => updateStatus('hidden')} type="button"><EyeOff aria-hidden="true" size={17} />{labels.hide}</button>
                )}
                <button className="button button--danger" disabled={updating} onClick={handleDelete} type="button"><Trash2 aria-hidden="true" size={17} />{labels.remove}</button>
              </div>
            </>
          ) : (
            <p className="admin-state">{labels.select}</p>
          )}
        </section>
      </div>
    </section>
  );
}

function buildCommentQuery({ filter, page, search }) {
  return {
    page,
    limit: 10,
    sort: '-createdAt',
    ...(filter !== 'all' ? { status: filter } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  };
}
