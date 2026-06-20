import { useSiteContent } from '../hooks/useSiteContent.js';

const categories = ['SaaS', 'Contenido', 'Marketing', 'Arquitectura', 'Frontend', 'Backend'];

export default function AdminCategoriesPage() {
  const { meta } = useSiteContent();
  const labels =
    meta.code === 'es'
      ? { eyebrow: 'Taxonomia', title: 'Categorias y etiquetas', create: 'Nueva categoria', active: 'Activa' }
      : { eyebrow: 'Taxonomy', title: 'Categories and tags', create: 'New category', active: 'Active' };

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
      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-chip" key={category}>
            <strong>{category}</strong>
            <span>{labels.active}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
