import { rules, validateBody } from '../middlewares/validate.js';
import { AppError } from '../utils/AppError.js';

const projectStatuses = ['planned', 'in-progress', 'completed', 'archived'];
const sortableFields = ['createdAt', 'updatedAt', 'title', 'startDate', 'endDate', 'featured', 'status'];

const projectRules = {
  title: [rules.required('Title'), rules.string('Title'), rules.maxLength('Title', 140)],
  slug: [rules.string('Slug'), rules.maxLength('Slug', 160)],
  summary: [rules.required('Summary'), rules.string('Summary'), rules.maxLength('Summary', 240)],
  description: [rules.required('Description'), rules.string('Description'), rules.maxLength('Description', 10000)],
  role: [rules.string('Role'), rules.maxLength('Role', 160)],
  challenge: [rules.string('Challenge'), rules.maxLength('Challenge', 1200)],
  solution: [rules.string('Solution'), rules.maxLength('Solution', 1200)],
  results: [rules.arrayOfStrings('Results'), rules.maxItems('Results', 12)],
  coverImage: [rules.publicImage('Cover image')],
  gallery: [rules.arrayOfPublicImages('Gallery'), rules.maxItems('Gallery', 20)],
  technologies: [rules.arrayOfStrings('Technologies'), rules.maxItems('Technologies', 30)],
  category: [rules.string('Category'), rules.maxLength('Category', 80)],
  status: [rules.enum('Status', projectStatuses)],
  featured: [rules.boolean('Featured')],
  liveUrl: [rules.url('Live URL')],
  repoUrl: [rules.url('Repository URL')],
  startDate: [rules.date('Start date')],
  endDate: [rules.date('End date')],
};

export const validateProjectCreate = validateBody(projectRules);

const projectUpdateRules = {
  ...projectRules,
  title: projectRules.title.slice(1),
  summary: projectRules.summary.slice(1),
  description: projectRules.description.slice(1),
};

export const validateProjectUpdate = validateBody(
  projectUpdateRules,
  { requireAtLeastOne: true },
);

export const validateProjectQuery = (req, res, next) => {
  const errors = [];

  if (req.query.status && !projectStatuses.includes(req.query.status)) {
    errors.push(`Status must be one of: ${projectStatuses.join(', ')}`);
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

  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }

  next();
};

export const projectSortFields = sortableFields;
