export const buildQueryOptions = (query, { allowedSortFields = [] } = {}) => {
  const page = Math.max(Math.trunc(Number(query.page)) || 1, 1);
  const limit = Math.min(Math.max(Math.trunc(Number(query.limit)) || 10, 1), 50);
  const skip = (page - 1) * limit;
  const requestedSort = query.sort || '-createdAt';
  const sortFields = requestedSort
    .split(/[,\s]+/)
    .filter(Boolean)
    .filter((field) => allowedSortFields.length === 0 || allowedSortFields.includes(field.replace(/^-/, '')));
  const sort = sortFields.join(' ') || '-createdAt';

  return { page, limit, skip, sort };
};

export const buildTextRegex = (value) => {
  const escapedValue = value
    .trim()
    .slice(0, 100)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return new RegExp(escapedValue, 'i');
};
