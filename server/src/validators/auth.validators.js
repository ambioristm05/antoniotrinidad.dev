import { rules, validateBody } from '../middlewares/validate.js';

export const validateLogin = validateBody({
  email: [rules.required('Email'), rules.email('Email')],
  password: [rules.required('Password'), rules.minLength('Password', 8)],
});
