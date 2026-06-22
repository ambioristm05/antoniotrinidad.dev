import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { api } from '../services/api.js';
import { buildEmailComposeUrl } from '../services/emailLinks.js';
import {
  buildEmailReplyUrl,
  buildMessageQuery,
  removeMessage,
  replaceMessage,
} from '../services/messageUtils.js';

const copyByLanguage = {
  es: {
    eyebrow: 'Contacto', title: 'Mensajes recibidos', search: 'Buscar mensajes', searchPlaceholder: 'Nombre, email, asunto o contenido',
    filters: { all: 'Todos', unread: 'No leídos', read: 'Leídos', archived: 'Archivados' },
    statuses: { unread: 'No leído', read: 'Leído', archived: 'Archivado' },
    loading: 'Cargando mensajes...', empty: 'No hay mensajes con estos filtros.', select: 'Selecciona un mensaje para ver su contenido.',
    loadError: 'No se pudieron cargar los mensajes.', updateError: 'No se pudo actualizar el mensaje.', deleteError: 'No se pudo eliminar el mensaje.',
    markRead: 'Marcar leído', markUnread: 'Marcar no leído', archive: 'Archivar', restore: 'Restaurar', remove: 'Eliminar',
    confirmDelete: '¿Eliminar este mensaje definitivamente?', previous: 'Página anterior', next: 'Página siguiente', page: 'Página', of: 'de',
    from: 'De', received: 'Recibido', reply: 'Responder por email',
  },
  en: {
    eyebrow: 'Contact', title: 'Received messages', search: 'Search messages', searchPlaceholder: 'Name, email, subject or content',
    filters: { all: 'All', unread: 'Unread', read: 'Read', archived: 'Archived' },
    statuses: { unread: 'Unread', read: 'Read', archived: 'Archived' },
    loading: 'Loading messages...', empty: 'There are no messages matching these filters.', select: 'Select a message to read it.',
    loadError: 'Messages could not be loaded.', updateError: 'The message could not be updated.', deleteError: 'The message could not be deleted.',
    markRead: 'Mark as read', markUnread: 'Mark as unread', archive: 'Archive', restore: 'Restore', remove: 'Delete',
    confirmDelete: 'Permanently delete this message?', previous: 'Previous page', next: 'Next page', page: 'Page', of: 'of',
    from: 'From', received: 'Received', reply: 'Reply by email',
  },
};

const formatDateTime = (value, language) =>
  new Intl.DateTimeFormat(language === 'es' ? 'es-DO' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function AdminMessagesPage() {
  const { language } = usePreferences();
  const labels = copyByLanguage[language] ?? copyByLanguage.es;
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
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

    api.getMessages(buildMessageQuery({ filter, page, search }), { signal: controller.signal })
      .then((response) => {
        setMessages(response.data.messages);
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
      const response = await api.updateMessage(selected._id, { status: nextStatus });
      const updatedMessage = response.data.contactMessage;
      setSelected(updatedMessage);

      if (filter !== 'all' && filter !== nextStatus) {
        setMessages((current) => removeMessage(current, updatedMessage._id));
        setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
      } else {
        setMessages((current) => replaceMessage(current, updatedMessage));
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
      await api.deleteMessage(selected._id);
      setMessages((current) => removeMessage(current, selected._id));
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
        <label htmlFor="message-search">{labels.search}</label>
        <div>
          <input id="message-search" maxLength="100" onChange={(event) => setSearchInput(event.target.value)} placeholder={labels.searchPlaceholder} type="search" value={searchInput} />
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
          ) : status === 'error' && messages.length === 0 ? null : messages.length === 0 ? (
            <p className="admin-state">{labels.empty}</p>
          ) : (
            <div className="message-list">
              {messages.map((message) => (
                <button className={`message-item${selected?._id === message._id ? ' is-selected' : ''}${message.status === 'unread' ? ' is-unread' : ''}`} key={message._id} onClick={() => setSelected(message)} type="button">
                  <span>{labels.statuses[message.status]}</span>
                  <strong>{message.subject}</strong>
                  <small>{message.name} · {formatDateTime(message.createdAt, language)}</small>
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
                <span>{labels.statuses[selected.status]}</span>
                <h2>{selected.subject}</h2>
                <dl>
                  <div><dt>{labels.from}</dt><dd>{selected.name} · <a href={buildEmailComposeUrl({ email: selected.email })} rel="noreferrer" target="_blank">{selected.email}</a></dd></div>
                  <div><dt>{labels.received}</dt><dd>{formatDateTime(selected.createdAt, language)}</dd></div>
                </dl>
              </header>
              <p className="message-detail__body">{selected.message}</p>
              <div className="message-actions">
                <a
                  className="button button--primary"
                  href={buildEmailReplyUrl({ email: selected.email, name: selected.name, subject: selected.subject, language })}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Mail aria-hidden="true" size={17} />
                  {labels.reply}
                </a>
                {selected.status === 'unread' ? (
                  <button className="button button--secondary" disabled={updating} onClick={() => updateStatus('read')} type="button"><MailOpen aria-hidden="true" size={17} />{labels.markRead}</button>
                ) : selected.status === 'read' ? (
                  <button className="button button--secondary" disabled={updating} onClick={() => updateStatus('unread')} type="button"><Mail aria-hidden="true" size={17} />{labels.markUnread}</button>
                ) : null}
                {selected.status === 'archived' ? (
                  <button className="button button--secondary" disabled={updating} onClick={() => updateStatus('read')} type="button"><MailOpen aria-hidden="true" size={17} />{labels.restore}</button>
                ) : (
                  <button className="button button--secondary" disabled={updating} onClick={() => updateStatus('archived')} type="button"><Archive aria-hidden="true" size={17} />{labels.archive}</button>
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
