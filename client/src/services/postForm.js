export const emptyPostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: 'general',
  tags: '',
  status: 'draft',
  featured: false,
  publishedAt: '',
};

const toLocalDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
};

export const postToForm = (post = {}) => ({
  ...emptyPostForm,
  ...post,
  tags: (post.tags ?? []).join(', '),
  publishedAt: toLocalDateTime(post.publishedAt),
});

const splitTags = (value) =>
  [...new Set(String(value).split(/[\n,]/).map((tag) => tag.trim().toLowerCase()).filter(Boolean))];

export const postFormToPayload = (form) => {
  const payload = {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    category: form.category.trim().toLowerCase(),
    tags: splitTags(form.tags),
    status: form.status,
    featured: Boolean(form.featured),
  };

  for (const field of ['slug', 'coverImage']) {
    const value = form[field]?.trim();
    if (value) payload[field] = value;
  }

  if (form.status === 'published' && form.publishedAt) {
    payload.publishedAt = new Date(form.publishedAt).toISOString();
  }

  return payload;
};
