import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { api } from '../services/api.js';
import {
  emptyProjectForm,
  projectFormToPayload,
  projectToForm,
} from '../services/projectForm.js';

const copyByLanguage = {
  es: {
    eyebrow: 'Proyectos', title: 'Gestión de proyectos', newTitle: 'Nuevo proyecto', editTitle: 'Editar proyecto',
    create: 'Crear proyecto', edit: 'Editar', remove: 'Eliminar', cancel: 'Cancelar', save: 'Guardar proyecto',
    saving: 'Guardando...', loading: 'Cargando proyectos...', empty: 'Todavía no hay proyectos.',
    loadError: 'No se pudieron cargar los proyectos.', saveError: 'No se pudo guardar el proyecto.',
    deleteError: 'No se pudo eliminar el proyecto.', notFound: 'No se encontró el proyecto solicitado.',
    confirmDelete: '¿Eliminar este proyecto? Esta acción no se puede deshacer.',
    columns: ['Título', 'Categoría', 'Estado', 'Destacado', 'Acciones'], yes: 'Sí', no: 'No',
    fields: {
      title: 'Título', slug: 'Slug (opcional)', summary: 'Resumen', description: 'Descripción', category: 'Categoría',
      status: 'Estado', featured: 'Proyecto destacado', technologies: 'Tecnologías', coverImage: 'Imagen de portada',
      gallery: 'Galería', liveUrl: 'URL del proyecto', repoUrl: 'URL del repositorio', startDate: 'Fecha de inicio', endDate: 'Fecha de fin',
    },
    hints: { technologies: 'Separadas por comas', gallery: 'Una URL por línea' },
    statuses: { planned: 'Planificado', 'in-progress': 'En progreso', completed: 'Completado', archived: 'Archivado' },
  },
  en: {
    eyebrow: 'Projects', title: 'Project management', newTitle: 'New project', editTitle: 'Edit project',
    create: 'Create project', edit: 'Edit', remove: 'Delete', cancel: 'Cancel', save: 'Save project',
    saving: 'Saving...', loading: 'Loading projects...', empty: 'There are no projects yet.',
    loadError: 'Projects could not be loaded.', saveError: 'The project could not be saved.',
    deleteError: 'The project could not be deleted.', notFound: 'The requested project was not found.',
    confirmDelete: 'Delete this project? This action cannot be undone.',
    columns: ['Title', 'Category', 'Status', 'Featured', 'Actions'], yes: 'Yes', no: 'No',
    fields: {
      title: 'Title', slug: 'Slug (optional)', summary: 'Summary', description: 'Description', category: 'Category',
      status: 'Status', featured: 'Featured project', technologies: 'Technologies', coverImage: 'Cover image',
      gallery: 'Gallery', liveUrl: 'Live URL', repoUrl: 'Repository URL', startDate: 'Start date', endDate: 'End date',
    },
    hints: { technologies: 'Comma separated', gallery: 'One URL per line' },
    statuses: { planned: 'Planned', 'in-progress': 'In progress', completed: 'Completed', archived: 'Archived' },
  },
};

export default function AdminProjectsPage({ mode = 'list' }) {
  const { language } = usePreferences();
  const labels = copyByLanguage[language] ?? copyByLanguage.es;

  return mode === 'list' ? (
    <ProjectList labels={labels} />
  ) : (
    <ProjectEditor labels={labels} mode={mode} />
  );
}

function ProjectList({ labels }) {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    api.getProjects({ limit: 100, sort: '-createdAt' }, { signal: controller.signal })
      .then((response) => {
        setProjects(response.data.projects);
        setStatus('success');
      })
      .catch((requestError) => {
        if (requestError.code === 'ABORTED') return;
        setError(requestError.message || labels.loadError);
        setStatus('error');
      });

    return () => controller.abort();
  }, [labels.loadError]);

  const handleDelete = async (project) => {
    if (!window.confirm(labels.confirmDelete)) return;

    setError('');
    try {
      await api.deleteProject(project._id);
      setProjects((current) => current.filter((item) => item._id !== project._id));
    } catch (requestError) {
      setError(requestError.message || labels.deleteError);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>{labels.title}</h1>
        </div>
        <Link className="button button--primary" to="/admin/projects/new">
          <Plus aria-hidden="true" size={18} />
          {labels.create}
        </Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {status === 'loading' ? (
        <p className="admin-state">{labels.loading}</p>
      ) : status === 'error' && projects.length === 0 ? null : projects.length === 0 ? (
        <p className="admin-state">{labels.empty}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{labels.columns.map((column) => <th key={column}>{column}</th>)}</tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td><strong>{project.title}</strong></td>
                  <td>{project.category}</td>
                  <td>{labels.statuses[project.status] ?? project.status}</td>
                  <td>{project.featured ? labels.yes : labels.no}</td>
                  <td>
                    <div className="table-actions">
                      <Link aria-label={`${labels.edit}: ${project.title}`} className="icon-button" title={labels.edit} to={`/admin/projects/${project._id}/edit`}>
                        <Pencil aria-hidden="true" size={17} />
                      </Link>
                      <button aria-label={`${labels.remove}: ${project.title}`} className="icon-button icon-button--danger" onClick={() => handleDelete(project)} title={labels.remove} type="button">
                        <Trash2 aria-hidden="true" size={17} />
                      </button>
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

function ProjectEditor({ labels, mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(emptyProjectForm);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(mode === 'edit' ? 'loading' : 'ready');
  const [error, setError] = useState('');
  const title = mode === 'new' ? labels.newTitle : labels.editTitle;

  useEffect(() => {
    const controller = new AbortController();
    const requests = [api.getCategories({ type: 'project' }, { signal: controller.signal })];

    if (mode === 'edit') {
      requests.push(api.getProjects({ limit: 100 }, { signal: controller.signal }));
    }

    Promise.all(requests)
      .then(([categoryResponse, projectResponse]) => {
        setCategories(categoryResponse.data.categories);

        if (mode === 'edit') {
          const project = projectResponse.data.projects.find((item) => item._id === id);
          if (!project) {
            setError(labels.notFound);
            setStatus('error');
            return;
          }
          setForm(projectToForm(project));
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
      const payload = projectFormToPayload(form);
      if (mode === 'new') await api.createProject(payload);
      else await api.updateProject(id, payload);
      navigate('/admin/projects', { replace: true });
    } catch (requestError) {
      setError(requestError.message || labels.saveError);
      setStatus('ready');
    }
  };

  if (status === 'loading') return <p className="admin-state">{labels.loading}</p>;

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <Link className="button button--secondary" to="/admin/projects">
          <ArrowLeft aria-hidden="true" size={18} />
          {labels.cancel}
        </Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {status !== 'error' && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <Field label={labels.fields.title}><input maxLength="140" name="title" onChange={handleChange} required value={form.title} /></Field>
            <Field label={labels.fields.slug}><input maxLength="160" name="slug" onChange={handleChange} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} /></Field>
          </div>
          <Field label={labels.fields.summary}><textarea maxLength="240" name="summary" onChange={handleChange} required rows="3" value={form.summary} /></Field>
          <Field label={labels.fields.description}><textarea maxLength="10000" name="description" onChange={handleChange} required rows="9" value={form.description} /></Field>
          <div className="form-grid">
            <Field label={labels.fields.category}>
              <input list="project-categories" maxLength="80" name="category" onChange={handleChange} value={form.category} />
              <datalist id="project-categories">{categoryOptions.map((category) => <option key={category} value={category} />)}</datalist>
            </Field>
            <Field label={labels.fields.status}>
              <select name="status" onChange={handleChange} value={form.status}>
                {Object.entries(labels.statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
          </div>
          <Field hint={labels.hints.technologies} label={labels.fields.technologies}><input name="technologies" onChange={handleChange} value={form.technologies} /></Field>
          <Field label={labels.fields.coverImage}><input name="coverImage" onChange={handleChange} type="url" value={form.coverImage} /></Field>
          <Field hint={labels.hints.gallery} label={labels.fields.gallery}><textarea name="gallery" onChange={handleChange} rows="4" value={form.gallery} /></Field>
          <div className="form-grid">
            <Field label={labels.fields.liveUrl}><input name="liveUrl" onChange={handleChange} type="url" value={form.liveUrl} /></Field>
            <Field label={labels.fields.repoUrl}><input name="repoUrl" onChange={handleChange} type="url" value={form.repoUrl} /></Field>
          </div>
          <div className="form-grid">
            <Field label={labels.fields.startDate}><input name="startDate" onChange={handleChange} type="date" value={form.startDate} /></Field>
            <Field label={labels.fields.endDate}><input min={form.startDate || undefined} name="endDate" onChange={handleChange} type="date" value={form.endDate} /></Field>
          </div>
          <label className="checkbox-field"><input checked={form.featured} name="featured" onChange={handleChange} type="checkbox" />{labels.fields.featured}</label>
          <div className="form-actions">
            <button className="button button--primary" disabled={status === 'saving'} type="submit">{status === 'saving' ? labels.saving : labels.save}</button>
            <Link className="button button--secondary" to="/admin/projects">{labels.cancel}</Link>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({ children, hint, label }) {
  return <label>{label}{children}{hint && <small className="field-hint">{hint}</small>}</label>;
}
