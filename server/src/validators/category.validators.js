import { rules, validateBody } from '../middlewares/validate.js';

export const validateCategoryCreate = validateBody({
  name: [rules.required('Name'), rules.maxLength('Name', 80)],
  type: [rules.required('Type'), rules.enum('Type', ['project', 'post'])],
});

export const validateCategoryUpdate = validateBody({
  name: [rules.maxLength('Name', 80)],
  type: [rules.enum('Type', ['project', 'post'])],
});
