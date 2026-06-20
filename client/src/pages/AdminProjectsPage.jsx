import { useSiteContent } from '../hooks/useSiteContent.js';

export default function AdminProjectsPage({ mode = 'list' }) {
  const { meta, projects } = useSiteContent();
  const labels =
    meta.code === 'es'
      ? {
          eyebrow: 'Proyectos',
          newTitle: 'Nuevo proyecto',
          editTitle: 'Editar proyecto',
          title: 'Gestion de proyectos',
          create: 'Crear proyecto',
          columns: ['Titulo', 'Categoria', 'Estado', 'Destacado'],
          yes: 'Si',
          no: 'No',
        }
      : {
          eyebrow: 'Projects',
          newTitle: 'New project',
          editTitle: 'Edit project',
          title: 'Project management',
          create: 'Create project',
          columns: ['Title', 'Category', 'Status', 'Featured'],
          yes: 'Yes',
          no: 'No',
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
        <ContentForm type={meta.code === 'es' ? 'proyecto' : 'project'} language={meta.code} />
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
      <AdminTable
        columns={labels.columns}
        rows={projects.map((project) => [project.title, project.category, project.status, project.featured ? labels.yes : labels.no])}
      />
    </section>
  );
}

function ContentForm({ language, type }) {
  const labels =
    language === 'es'
      ? {
          title: 'Titulo',
          titlePlaceholder: `Titulo del ${type}`,
          summary: 'Resumen',
          summaryPlaceholder: 'Descripcion corta para listados',
          category: 'Categoria',
          status: 'Estado',
          statusPlaceholder: 'MVP, En produccion...',
          save: 'Guardar borrador',
        }
      : {
          title: 'Title',
          titlePlaceholder: `Title of the ${type}`,
          summary: 'Summary',
          summaryPlaceholder: 'Short description for listings',
          category: 'Category',
          status: 'Status',
          statusPlaceholder: 'MVP, In production...',
          save: 'Save draft',
        };

  return (
    <form className="admin-form">
      <label>
        {labels.title}
        <input placeholder={labels.titlePlaceholder} />
      </label>
      <label>
        {labels.summary}
        <textarea rows="4" placeholder={labels.summaryPlaceholder} />
      </label>
      <div className="form-grid">
        <label>
          {labels.category}
          <input placeholder="SaaS, Blog, API..." />
        </label>
        <label>
          {labels.status}
          <input placeholder={labels.statusPlaceholder} />
        </label>
      </div>
      <button className="button button--primary" type="button">
        {labels.save}
      </button>
    </form>
  );
}

function AdminTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('-')}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
