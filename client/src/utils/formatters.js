export function formatDate(dateValue, locale = 'es-DO') {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue));
}

export function formatDateTime(dateValue, locale = 'es-DO') {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

export function findBySlug(items, slug) {
  return items.find((item) => item.slug === slug);
}
