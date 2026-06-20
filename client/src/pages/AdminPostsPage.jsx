import { useSiteContent } from '../hooks/useSiteContent.js';

export default function AdminPostsPage({ mode = 'list' }) {
  const { meta, posts } = useSiteContent();
  const labels =
    meta.code === 'es'
      ? {
          eyebrow: 'Blog',
          newTitle: 'Nuevo articulo',
          editTitle: 'Editar articulo',
          title: 'Gestion de articulos',
          create: 'Crear articulo',
          fieldTitle: 'Titulo',
          fieldTitlePlaceholder: 'Titulo del articulo',
          excerpt: 'Extracto',
          excerptPlaceholder: 'Resumen para el listado',
          content: 'Contenido',
          contentPlaceholder: 'Markdown o contenido enriquecido',
          save: 'Guardar borrador',
        }
      : {
          eyebrow: 'Blog',
          newTitle: 'New article',
          editTitle: 'Edit article',
          title: 'Article management',
          create: 'Create article',
          fieldTitle: 'Title',
          fieldTitlePlaceholder: 'Article title',
          excerpt: 'Excerpt',
          excerptPlaceholder: 'Summary for listings',
          content: 'Content',
          contentPlaceholder: 'Markdown or rich content',
          save: 'Save draft',
        };

  if (mode !== 'list') {
    return (
      <section className="admin-page">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">{labels.eyebrow}</p>
            <h1>{mode === 'new' ? labels.newTitle : labels.editTitle}</h1>
          </div>
        </div>
        <form className="admin-form">
          <label>
            {labels.fieldTitle}
            <input placeholder={labels.fieldTitlePlaceholder} />
          </label>
          <label>
            {labels.excerpt}
            <textarea rows="3" placeholder={labels.excerptPlaceholder} />
          </label>
          <label>
            {labels.content}
            <textarea rows="10" placeholder={labels.contentPlaceholder} />
          </label>
          <button className="button button--primary" type="button">
            {labels.save}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>{labels.title}</h1>
        </div>
        <button className="button button--primary" type="button">
          {labels.create}
        </button>
      </div>
      <div className="admin-list admin-list--wide">
        {posts.map((post) => (
          <article key={post.id}>
            <span>{post.category}</span>
            <strong>{post.title}</strong>
            <small>{post.tags.join(', ')}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
