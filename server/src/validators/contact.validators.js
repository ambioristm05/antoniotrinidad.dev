import { rules, validateBody } from '../middlewares/validate.js';
import { AppError } from '../utils/AppError.js';

const contactStatuses = ['unread', 'read', 'archived'];
const sortableFields = ['createdAt', 'updatedAt', 'name', 'email', 'subject', 'status'];

export const validateContactCreate = validateBody({
  name: [rules.required('Name'), rules.string('Name'), rules.minLength('Name', 2), rules.maxLength('Name', 100)],
  email: [rules.required('Email'), rules.email('Email'), rules.maxLength('Email', 254)],
  subject: [rules.required('Subject'), rules.string('Subject'), rules.minLength('Subject', 3), rules.maxLength('Subject', 160)],
  message: [rules.required('Message'), rules.string('Message'), rules.minLength('Message', 10), rules.maxLength('Message', 3000)],
  website: [rules.string('Website'), rules.maxLength('Website', 200)],
});

export const validateContactUpdate = validateBody(
  {
    status: [rules.enum('Status', contactStatuses)],
  },
  { requireAtLeastOne: true },
);

export const validateContactQuery = (req, res, next) => {
  const errors = [];

  if (req.query.status && !contactStatuses.includes(req.query.status)) {
    errors.push(`Status must be one of: ${contactStatuses.join(', ')}`);
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

export const contactSortFields = sortableFields;
