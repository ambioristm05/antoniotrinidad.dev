import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { usePreferences } from '../contexts/PreferencesContext.jsx';
import { api } from '../services/api.js';
import {
  categoryFormToPayload,
  categoryToForm,
  emptyCategoryForm,
} from '../services/categoryForm.js';

const copyByLanguage = {
  es: {
    eyebrow: 'Taxonomía',
    title: 'Categorías',
    create: 'Nueva categoría',
    newTitle: 'Crear categoría',
    editTitle: 'Editar categoría',
    name: 'Nombre',
    slug: 'Slug (opcional)',
    type: 'Tipo',
    project: 'Proyecto',
    post: 'Artículo',
    save: 'Guardar categoría',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    edit: 'Editar',
    remove: 'Eliminar',
    loading: 'Cargando categorías...',
    empty: 'Todavía no hay categorías.',
    loadError: 'No se pudieron cargar las categorías.',
    saveError: 'No se pudo guardar la categoría.',
    deleteError: 'No se pudo eliminar la categoría.',
    confirmDelete: '¿Eliminar esta categoría? El contenido existente conservará su texto de categoría.',
  },
  en: {
    eyebrow: 'Taxonomy',
    title: 'Categories',
    create: 'New category',
    newTitle: 'Create category',
    editTitle: 'Edit category',
    name: 'Name',
    slug: 'Slug (optional)',
    type: 'Type',
    project: 'Project',
    post: 'Article',
    save: 'Save category',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    remove: 'Delete',
    loading: 'Loading categories...',
    empty: 'There are no categories yet.',
    loadError: 'Categories could not be loaded.',
    saveError: 'The category could not be saved.',
    deleteError: 'The category could not be deleted.',
    confirmDelete: 'Delete this category? Existing content will keep its category text.',
  },
};

const sortCategories = (categories) =>
  [...categories].sort((left, right) => left.type.localeCompare(right.type) || left.name.localeCompare(right.name));

export default function AdminCategoriesPage() {
  const { language } = usePreferences();
  const labels = copyByLanguage[language] ?? copyByLanguage.es;
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategoryForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    api.getCategories(undefined, { signal: controller.signal })
      .then((response) => {
        setCategories(sortCategories(response.data.categories));
        setStatus('success');
      })
      .catch((requestError) => {
        if (requestError.code === 'ABORTED') return;
        setError(requestError.message || labels.loadError);
        setStatus('error');
      });

    return () => controller.abort();
  }, [labels.loadError]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCategoryForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (category) => {
    setEditingId(category._id);
    setForm(categoryToForm(category));
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(emptyCategoryForm);
    setShowForm(false);
  };

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('saving');

    try {
      const payload = categoryFormToPayload(form);
      const response = editingId
        ? await api.updateCategory(editingId, payload)
        : await api.createCategory(payload);
      const savedCategory = response.data.category;

      setCategories((current) =>
        sortCategories(
          editingId
            ? current.map((category) => (category._id === editingId ? savedCategory : category))
            : [...current, savedCategory],
        ),
      );
      setStatus('success');
      closeForm();
    } catch (requestError) {
      setError(requestError.message || labels.saveError);
      setStatus('success');
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(labels.confirmDelete)) return;

    setError('');
    setDeletingId(category._id);
    try {
      await api.deleteCategory(category._id);
      setCategories((current) => current.filter((item) => item._id !== category._id));
      if (editingId === category._id) closeForm();
    } catch (requestError) {
      setError(requestError.message || labels.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>{labels.title}</h1>
        </div>
        <button className="button button--primary" onClick={openCreate} type="button">
          <Plus aria-hidden="true" size={18} />
          {labels.create}
        </button>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {showForm && (
        <section className="category-editor" aria-labelledby="category-editor-title">
          <div className="category-editor__heading">
            <h2 id="category-editor-title">{editingId ? labels.editTitle : labels.newTitle}</h2>
            <button aria-label={labels.cancel} className="icon-button" onClick={closeForm} title={labels.cancel} type="button">
              <X aria-hidden="true" size={18} />
            </button>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>{labels.name}<input autoFocus maxLength="80" name="name" onChange={handleChange} required value={form.name} /></label>
              <label>{labels.slug}<input maxLength="100" name="slug" onChange={handleChange} value={form.slug} /></label>
            </div>
            <label>{labels.type}
              <select name="type" onChange={handleChange} required value={form.type}>
                <option value="project">{labels.project}</option>
                <option value="post">{labels.post}</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="button button--primary" disabled={status === 'saving'} type="submit">{status === 'saving' ? labels.saving : labels.save}</button>
              <button className="button button--secondary" onClick={closeForm} type="button">{labels.cancel}</button>
            </div>
          </form>
        </section>
      )}

      {status === 'loading' ? (
        <p className="admin-state">{labels.loading}</p>
      ) : status === 'error' && categories.length === 0 ? null : categories.length === 0 ? (
        <p className="admin-state">{labels.empty}</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-chip" key={category._id}>
              <div className="category-chip__content">
                <span>{category.type === 'project' ? labels.project : labels.post}</span>
                <strong>{category.name}</strong>
                <small>{category.slug}</small>
              </div>
              <div className="table-actions">
                <button aria-label={`${labels.edit}: ${category.name}`} className="icon-button" onClick={() => openEdit(category)} title={labels.edit} type="button"><Pencil aria-hidden="true" size={17} /></button>
                <button aria-label={`${labels.remove}: ${category.name}`} className="icon-button icon-button--danger" disabled={deletingId === category._id} onClick={() => handleDelete(category)} title={labels.remove} type="button"><Trash2 aria-hidden="true" size={17} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
