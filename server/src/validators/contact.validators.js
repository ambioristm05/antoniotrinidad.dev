import { rules, validateBody } from '../middlewares/validate.js';

export const validateContactCreate = validateBody({
  name: [rules.required('Name'), rules.maxLength('Name', 100)],
  email: [rules.required('Email'), rules.email('Email')],
  subject: [rules.required('Subject'), rules.maxLength('Subject', 160)],
  message: [rules.required('Message'), rules.maxLength('Message', 3000)],
});

export const validateContactUpdate = validateBody({
  status: [rules.enum('Status', ['unread', 'read', 'archived'])],
});
