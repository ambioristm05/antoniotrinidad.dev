export const emptyCategoryForm = {
  name: '',
  slug: '',
  type: 'project',
};

export const categoryToForm = (category = {}) => ({
  ...emptyCategoryForm,
  name: category.name ?? '',
  slug: category.slug ?? '',
  type: category.type ?? 'project',
});

export const categoryFormToPayload = (form) => {
  const payload = {
    name: form.name.trim(),
    type: form.type,
  };
  const slug = form.slug.trim();

  if (slug) payload.slug = slug;

  return payload;
};
