import { rules, validateBody } from '../middlewares/validate.js';
import { AppError } from '../utils/AppError.js';

const sortableFields = ['createdAt', 'updatedAt'];
const adminSortableFields = ['createdAt', 'updatedAt', 'authorName', 'status'];
const commentStatuses = ['visible', 'hidden'];

export const validateCommentCreate = validateBody({
  authorName: [rules.required('Name'), rules.string('Name'), rules.minLength('Name', 2), rules.maxLength('Name', 100)],
  authorEmail: [rules.email('Email'), rules.maxLength('Email', 254)],
  authorAvatar: [rules.string('Avatar'), rules.maxLength('Avatar', 1000)],
  message: [rules.required('Comment'), rules.string('Comment'), rules.minLength('Comment', 3), rules.maxLength('Comment', 3000)],
  website: [rules.string('Website'), rules.maxLength('Website', 200)],
});

export const validateReplyCreate = validateBody({
  authorName: [rules.required('Name'), rules.string('Name'), rules.minLength('Name', 2), rules.maxLength('Name', 100)],
  authorEmail: [rules.email('Email'), rules.maxLength('Email', 254)],
  authorAvatar: [rules.string('Avatar'), rules.maxLength('Avatar', 1000)],
  message: [rules.required('Reply'), rules.string('Reply'), rules.minLength('Reply', 3), rules.maxLength('Reply', 1500)],
  website: [rules.string('Website'), rules.maxLength('Website', 200)],
});

export const validateCommentQuery = (req, res, next) => {
  const errors = [];

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

  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }

  next();
};

export const validateAdminCommentQuery = (req, res, next) => {
  const errors = [];

  if (req.query.status && !commentStatuses.includes(req.query.status)) {
    errors.push(`Status must be one of: ${commentStatuses.join(', ')}`);
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
      .some((field) => !adminSortableFields.includes(field.replace(/^-/, '')));

    if (invalidSort) errors.push(`Sort fields must be one of: ${adminSortableFields.join(', ')}`);
  }

  if (req.query.search && req.query.search.trim().length > 100) {
    errors.push('Search cannot exceed 100 characters');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }

  next();
};

export const validateCommentUpdate = validateBody(
  {
    status: [rules.enum('Status', commentStatuses)],
  },
  { requireAtLeastOne: true },
);

export const commentSortFields = sortableFields;
export const adminCommentSortFields = adminSortableFields;
