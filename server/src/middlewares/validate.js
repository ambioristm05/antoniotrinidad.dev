import { AppError } from '../utils/AppError.js';

const isEmpty = (value) =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

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
  string:
    (label) =>
    (value) =>
      !isEmpty(value) && typeof value !== 'string' ? `${label} must be a string` : null,
  boolean:
    (label) =>
    (value) =>
      !isEmpty(value) && typeof value !== 'boolean' ? `${label} must be a boolean` : null,
  url:
    (label) =>
    (value) =>
      !isEmpty(value) && !isHttpUrl(value) ? `${label} must be a valid HTTP or HTTPS URL` : null,
  date:
    (label) =>
    (value) =>
      !isEmpty(value) && Number.isNaN(Date.parse(value)) ? `${label} must be a valid date` : null,
  arrayOfStrings:
    (label) =>
    (value) =>
      !isEmpty(value) &&
      (!Array.isArray(value) ||
        value.some((item) => typeof item !== 'string' || item.trim() === ''))
        ? `${label} must be an array of non-empty strings`
        : null,
  arrayOfUrls:
    (label) =>
    (value) =>
      !isEmpty(value) &&
      (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !isHttpUrl(item)))
        ? `${label} must be an array of valid HTTP or HTTPS URLs`
        : null,
  maxItems:
    (label, max) =>
    (value) =>
      Array.isArray(value) && value.length > max ? `${label} cannot contain more than ${max} items` : null,
};

export const validateBody = (schema, { requireAtLeastOne = false } = {}) => (req, res, next) => {
  const errors = [];

  if (
    requireAtLeastOne &&
    !Object.keys(schema).some((field) => Object.prototype.hasOwnProperty.call(req.body, field))
  ) {
    throw new AppError('At least one valid field is required', 400);
  }

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
