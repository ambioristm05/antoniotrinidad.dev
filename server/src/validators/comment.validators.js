import { rules, validateBody } from '../middlewares/validate.js';
import { AppError } from '../utils/AppError.js';

const sortableFields = ['createdAt', 'updatedAt'];

export const validateCommentCreate = validateBody({
  authorName: [rules.required('Name'), rules.string('Name'), rules.minLength('Name', 2), rules.maxLength('Name', 100)],
  authorEmail: [rules.required('Email'), rules.email('Email'), rules.maxLength('Email', 254)],
  message: [rules.required('Comment'), rules.string('Comment'), rules.minLength('Comment', 3), rules.maxLength('Comment', 3000)],
  website: [rules.string('Website'), rules.maxLength('Website', 200)],
});

export const validateReplyCreate = validateBody({
  authorName: [rules.required('Name'), rules.string('Name'), rules.minLength('Name', 2), rules.maxLength('Name', 100)],
  authorEmail: [rules.email('Email'), rules.maxLength('Email', 254)],
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

export const commentSortFields = sortableFields;
