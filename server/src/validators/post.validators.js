import { rules, validateBody } from '../middlewares/validate.js';
import { AppError } from '../utils/AppError.js';

const postStatuses = ['draft', 'published'];
const sortableFields = ['createdAt', 'updatedAt', 'title', 'publishedAt', 'featured', 'status', 'readingTime'];

const postRules = {
  title: [rules.required('Title'), rules.string('Title'), rules.maxLength('Title', 160)],
  slug: [rules.string('Slug'), rules.maxLength('Slug', 180)],
  excerpt: [rules.required('Excerpt'), rules.string('Excerpt'), rules.maxLength('Excerpt', 260)],
  content: [rules.required('Content'), rules.string('Content'), rules.maxLength('Content', 100000)],
  coverImage: [rules.url('Cover image')],
  category: [rules.string('Category'), rules.maxLength('Category', 80)],
  tags: [rules.arrayOfStrings('Tags'), rules.maxItems('Tags', 20)],
  status: [rules.enum('Status', postStatuses)],
  featured: [rules.boolean('Featured')],
  publishedAt: [rules.date('Published at')],
};

export const validatePostCreate = validateBody(postRules);

const postUpdateRules = {
  ...postRules,
  title: postRules.title.slice(1),
  excerpt: postRules.excerpt.slice(1),
  content: postRules.content.slice(1),
};

export const validatePostUpdate = validateBody(postUpdateRules, { requireAtLeastOne: true });

const createPostQueryValidator = ({ allowStatus }) => (req, res, next) => {
  const errors = [];

  if (allowStatus && req.query.status && !postStatuses.includes(req.query.status)) {
    errors.push(`Status must be one of: ${postStatuses.join(', ')}`);
  }

  if (req.query.featured && !['true', 'false'].includes(req.query.featured)) {
    errors.push('Featured must be true or false');
  }

  for (const field of ['page', 'limit']) {
    if (req.query[field] && (!/^\d+$/.test(req.query[field]) || Number(req.query[field]) < 1)) {
      errors.push(`${field} must be a positive integer`);
    }
  }

  if (req.query.sort) {
    const invalidSort = req.query.sort
      .split(/[,\s]+/)
      .filter(Boolean)
      .some((field) => !sortableFields.includes(field.replace(/^-/, '')));

    if (invalidSort) errors.push(`Sort fields must be one of: ${sortableFields.join(', ')}`);
  }

  if (req.query.search && req.query.search.trim().length > 100) {
    errors.push('Search cannot exceed 100 characters');
  }

  if (req.query.tag && req.query.tag.trim().length > 40) {
    errors.push('Tag cannot exceed 40 characters');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }

  next();
};

export const validatePublicPostQuery = createPostQueryValidator({ allowStatus: false });
export const validateAdminPostQuery = createPostQueryValidator({ allowStatus: true });
export const postSortFields = sortableFields;
