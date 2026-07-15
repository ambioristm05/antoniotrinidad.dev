export const emptyProjectForm = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  role: '',
  challenge: '',
  solution: '',
  results: '',
  category: 'fullstack',
  status: 'completed',
  featured: false,
  coverImage: '',
  gallery: '',
  technologies: '',
  liveUrl: '',
  repoUrl: '',
  startDate: '',
  endDate: '',
};

const formatDateInput = (value) => (value ? String(value).slice(0, 10) : '');

export const projectToForm = (project = {}) => ({
  ...emptyProjectForm,
  ...project,
  results: (project.results ?? []).join('\n'),
  gallery: (project.gallery ?? []).join('\n'),
  technologies: (project.technologies ?? []).join(', '),
  startDate: formatDateInput(project.startDate),
  endDate: formatDateInput(project.endDate),
});

const splitValues = (value) =>
  [...new Set(String(value).split(/[\n,]/).map((item) => item.trim()).filter(Boolean))];

const splitLines = (value) =>
  [...new Set(String(value).split(/\n/).map((item) => item.trim()).filter(Boolean))];

export const projectFormToPayload = (form) => {
  const payload = {
    title: form.title.trim(),
    summary: form.summary.trim(),
    description: form.description.trim(),
    results: splitLines(form.results),
    category: form.category.trim().toLowerCase(),
    status: form.status,
    featured: Boolean(form.featured),
    gallery: splitValues(form.gallery),
    technologies: splitValues(form.technologies),
  };

  for (const field of ['slug', 'role', 'challenge', 'solution', 'coverImage', 'liveUrl', 'repoUrl', 'startDate', 'endDate']) {
    const value = form[field]?.trim();
    if (value) payload[field] = value;
  }

  return payload;
};
