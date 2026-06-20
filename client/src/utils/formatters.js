export function formatDate(dateValue, locale = 'es-DO') {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue));
}

export function findBySlug(items, slug) {
  return items.find((item) => item.slug === slug);
}
