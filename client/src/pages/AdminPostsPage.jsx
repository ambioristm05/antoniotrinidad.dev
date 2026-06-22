import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { api } from '../services/api.js';
import { emptyPostForm, postFormToPayload, postToForm } from '../services/postForm.js';
import { formatDate } from '../utils/formatters.js';

const copyByLanguage = {
  es: {
    eyebrow: 'Blog', title: 'Gestión de artículos', newTitle: 'Nuevo artículo', editTitle: 'Editar artículo',
    create: 'Crear artículo', edit: 'Editar', remove: 'Eliminar', cancel: 'Cancelar', save: 'Guardar artículo',
    saving: 'Guardando...', loading: 'Cargando artículos...', empty: 'Todavía no hay artículos.',
    loadError: 'No se pudieron cargar los artículos.', saveError: 'No se pudo guardar el artículo.',
    deleteError: 'No se pudo eliminar el artículo.', notFound: 'No se encontró el artículo solicitado.',
    confirmDelete: '¿Eliminar este artículo? Esta acción no se puede deshacer.',
    columns: ['Título', 'Categoría', 'Estado', 'Lectura', 'Publicación', 'Acciones'], minutes: 'min',
    fields: {
      title: 'Título', slug: 'Slug (opcional)', excerpt: 'Extracto', content: 'Contenido Markdown',
      category: 'Categoría', tags: 'Etiquetas', status: 'Estado', coverImage: 'Imagen de portada',
      featured: 'Artículo destacado', publishedAt: 'Fecha de publicación',
    },
    hints: { tags: 'Separadas por comas', content: 'Puedes usar encabezados, listas, enlaces y bloques de código Markdown.' },
    placeholders: {
      title: 'Ej. Cómo construir una API segura', slug: 'como-construir-una-api-segura',
      excerpt: 'Ej. Principios prácticos para proteger una API Express.',
      content: '# Introducción\n\nEscribe aquí el contenido del artículo...', category: 'Ej. Backend',
      tags: 'Node.js, Express, MongoDB', coverImage: 'https://res.cloudinary.com/.../portada.webp',
    },
    statuses: { draft: 'Borrador', published: 'Publicado' },
  },
  en: {
    eyebrow: 'Blog', title: 'Article management', newTitle: 'New article', editTitle: 'Edit article',
    create: 'Create article', edit: 'Edit', remove: 'Delete', cancel: 'Cancel', save: 'Save article',
    saving: 'Saving...', loading: 'Loading articles...', empty: 'There are no articles yet.',
    loadError: 'Articles could not be loaded.', saveError: 'The article could not be saved.',
    deleteError: 'The article could not be deleted.', notFound: 'The requested article was not found.',
    confirmDelete: 'Delete this article? This action cannot be undone.',
    columns: ['Title', 'Category', 'Status', 'Reading', 'Publication', 'Actions'], minutes: 'min',
    fields: {
      title: 'Title', slug: 'Slug (optional)', excerpt: 'Excerpt', content: 'Markdown content',
      category: 'Category', tags: 'Tags', status: 'Status', coverImage: 'Cover image',
      featured: 'Featured article', publishedAt: 'Publication date',
    },
    hints: { tags: 'Comma separated', content: 'You can use Markdown headings, lists, links and code blocks.' },
    placeholders: {
      title: 'E.g. How to build a secure API', slug: 'how-to-build-a-secure-api',
      excerpt: 'E.g. Practical principles for securing an Express API.',
      content: '# Introduction\n\nWrite the article content here...', category: 'E.g. Backend',
      tags: 'Node.js, Express, MongoDB', coverImage: 'https://res.cloudinary.com/.../cover.webp',
    },
    statuses: { draft: 'Draft', published: 'Published' },
  },
};

export default function AdminPostsPage({ mode = 'list' }) {
  const { language } = usePreferences();
  const labels = copyByLanguage[language] ?? copyByLanguage.es;

  return mode === 'list' ? <PostList labels={labels} language={language} /> : <PostEditor labels={labels} mode={mode} />;
}

function PostList({ labels, language }) {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    api.getAdminPosts({ limit: 100, sort: '-createdAt' }, { signal: controller.signal })
      .then((response) => {
        setPosts(response.data.posts);
        setStatus('success');
      })
      .catch((requestError) => {
        if (requestError.code === 'ABORTED') return;
        setError(requestError.message || labels.loadError);
        setStatus('error');
      });

    return () => controller.abort();
  }, [labels.loadError]);

  const handleDelete = async (post) => {
    if (!window.confirm(labels.confirmDelete)) return;

    setError('');
    try {
      await api.deletePost(post._id);
      setPosts((current) => current.filter((item) => item._id !== post._id));
    } catch (requestError) {
      setError(requestError.message || labels.deleteError);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div><p className="eyebrow">{labels.eyebrow}</p><h1>{labels.title}</h1></div>
        <Link className="button button--primary" to="/admin/posts/new"><Plus aria-hidden="true" size={18} />{labels.create}</Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {status === 'loading' ? (
        <p className="admin-state">{labels.loading}</p>
      ) : status === 'error' && posts.length === 0 ? null : posts.length === 0 ? (
        <p className="admin-state">{labels.empty}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr>{labels.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id}>
                  <td><strong>{post.title}</strong></td>
                  <td>{post.category}</td>
                  <td>{labels.statuses[post.status] ?? post.status}</td>
                  <td>{post.readingTime} {labels.minutes}</td>
                  <td>{post.publishedAt ? formatDate(post.publishedAt, language === 'es' ? 'es-DO' : 'en-US') : '-'}</td>
                  <td>
                    <div className="table-actions">
                      <Link aria-label={`${labels.edit}: ${post.title}`} className="icon-button" title={labels.edit} to={`/admin/posts/${post._id}/edit`}><Pencil aria-hidden="true" size={17} /></Link>
                      <button aria-label={`${labels.remove}: ${post.title}`} className="icon-button icon-button--danger" onClick={() => handleDelete(post)} title={labels.remove} type="button"><Trash2 aria-hidden="true" size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PostEditor({ labels, mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(emptyPostForm);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(mode === 'edit' ? 'loading' : 'ready');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const requests = [api.getCategories({ type: 'post' }, { signal: controller.signal })];
    if (mode === 'edit') requests.push(api.getAdminPosts({ limit: 100 }, { signal: controller.signal }));

    Promise.all(requests)
      .then(([categoryResponse, postResponse]) => {
        setCategories(categoryResponse.data.categories);
        if (mode === 'edit') {
          const post = postResponse.data.posts.find((item) => item._id === id);
          if (!post) {
            setError(labels.notFound);
            setStatus('error');
            return;
          }
          setForm(postToForm(post));
        }
        setStatus('ready');
      })
      .catch((requestError) => {
        if (requestError.code === 'ABORTED') return;
        setError(requestError.message || labels.loadError);
        setStatus('error');
      });

    return () => controller.abort();
  }, [id, labels.loadError, labels.notFound, mode]);

  const categoryOptions = useMemo(() => categories.map((category) => category.name), [categories]);
  const handleChange = ({ target }) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setForm((current) => ({ ...current, [target.name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('saving');

    try {
      const payload = postFormToPayload(form);
      if (mode === 'new') await api.createPost(payload);
      else await api.updatePost(id, payload);
      navigate('/admin/posts', { replace: true });
    } catch (requestError) {
      setError(requestError.message || labels.saveError);
      setStatus('ready');
    }
  };

  if (status === 'loading') return <p className="admin-state">{labels.loading}</p>;

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div><p className="eyebrow">{labels.eyebrow}</p><h1>{mode === 'new' ? labels.newTitle : labels.editTitle}</h1></div>
        <Link className="button button--secondary" to="/admin/posts"><ArrowLeft aria-hidden="true" size={18} />{labels.cancel}</Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {status !== 'error' && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label={labels.fields.title}><input maxLength="160" name="title" onChange={handleChange} placeholder={labels.placeholders.title} required value={form.title} /></Field>
            <Field label={labels.fields.slug}><input maxLength="180" name="slug" onChange={handleChange} placeholder={labels.placeholders.slug} value={form.slug} /></Field>
          </div>
          <Field label={labels.fields.excerpt}><textarea maxLength="260" name="excerpt" onChange={handleChange} placeholder={labels.placeholders.excerpt} required rows="3" value={form.excerpt} /></Field>
          <Field hint={labels.hints.content} label={labels.fields.content}><textarea className="content-editor" maxLength="100000" name="content" onChange={handleChange} placeholder={labels.placeholders.content} required rows="18" value={form.content} /></Field>
          <div className="form-grid">
            <Field label={labels.fields.category}>
              <input list="post-categories" maxLength="80" name="category" onChange={handleChange} placeholder={labels.placeholders.category} value={form.category} />
              <datalist id="post-categories">{categoryOptions.map((category) => <option key={category} value={category} />)}</datalist>
            </Field>
            <Field hint={labels.hints.tags} label={labels.fields.tags}><input name="tags" onChange={handleChange} placeholder={labels.placeholders.tags} value={form.tags} /></Field>
          </div>
          <div className="form-grid">
            <Field label={labels.fields.status}>
              <select name="status" onChange={handleChange} value={form.status}>{Object.entries(labels.statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            </Field>
            <Field label={labels.fields.publishedAt}><input disabled={form.status === 'draft'} name="publishedAt" onChange={handleChange} type="datetime-local" value={form.publishedAt} /></Field>
          </div>
          <Field label={labels.fields.coverImage}><input name="coverImage" onChange={handleChange} placeholder={labels.placeholders.coverImage} type="url" value={form.coverImage} /></Field>
          <label className="checkbox-field"><input checked={form.featured} name="featured" onChange={handleChange} type="checkbox" />{labels.fields.featured}</label>
          <div className="form-actions">
            <button className="button button--primary" disabled={status === 'saving'} type="submit">{status === 'saving' ? labels.saving : labels.save}</button>
            <Link className="button button--secondary" to="/admin/posts">{labels.cancel}</Link>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({ children, hint, label }) {
  return <label>{label}{children}{hint && <small className="field-hint">{hint}</small>}</label>;
}
