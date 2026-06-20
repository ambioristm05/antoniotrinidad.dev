import { AppError } from '../utils/AppError.js';

const isEmpty = (value) => value === undefined || value === null || value === '';

export const rules = {
  required:
    (label) =>
    (value) =>
      isEmpty(value) ? `${label} is required` : null,
  email:
    (label) =>
    (value) =>
      !isEmpty(value) && !/^\S+@\S+\.\S+$/.test(value) ? `${label} must be a valid email` : null,
  minLength:
    (label, min) =>
    (value) =>
      !isEmpty(value) && String(value).length < min ? `${label} must have at least ${min} characters` : null,
  maxLength:
    (label, max) =>
    (value) =>
      !isEmpty(value) && String(value).length > max ? `${label} cannot exceed ${max} characters` : null,
  enum:
    (label, allowed) =>
    (value) =>
      !isEmpty(value) && !allowed.includes(value)
        ? `${label} must be one of: ${allowed.join(', ')}`
        : null,
  array:
    (label) =>
    (value) =>
      !isEmpty(value) && !Array.isArray(value) ? `${label} must be an array` : null,
};

export const validateBody = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, validators] of Object.entries(schema)) {
    for (const validator of validators) {
      const message = validator(req.body[field], req.body);
      if (message) errors.push({ field, message });
    }
  }

  if (errors.length > 0) {
    throw new AppError(errors.map((error) => error.message).join('. '), 400);
  }

  next();
};
