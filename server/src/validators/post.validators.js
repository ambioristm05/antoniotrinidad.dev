import { rules, validateBody } from '../middlewares/validate.js';

const postRules = {
  title: [rules.required('Title'), rules.maxLength('Title', 160)],
  excerpt: [rules.required('Excerpt'), rules.maxLength('Excerpt', 260)],
  content: [rules.required('Content')],
  tags: [rules.array('Tags')],
  status: [rules.enum('Status', ['draft', 'published'])],
};

export const validatePostCreate = validateBody(postRules);

export const validatePostUpdate = validateBody({
  title: [rules.maxLength('Title', 160)],
  excerpt: [rules.maxLength('Excerpt', 260)],
  tags: [rules.array('Tags')],
  status: [rules.enum('Status', ['draft', 'published'])],
});
