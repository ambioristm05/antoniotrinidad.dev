export const buildQueryOptions = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;
  const sort = query.sort || '-createdAt';

  return { page, limit, skip, sort };
};

export const buildTextRegex = (value) => new RegExp(value.trim(), 'i');
