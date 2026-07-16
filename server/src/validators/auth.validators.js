import { rules, validateBody } from '../middlewares/validate.js';

export const validateLogin = validateBody({
  email: [rules.required('Email'), rules.email('Email')],
  password: [rules.required('Password'), rules.minLength('Password', 8)],
});

export const validatePasswordResetRequest = validateBody({
  email: [rules.required('Email'), rules.email('Email')],
});

export const validatePasswordReset = validateBody({
  token: [rules.required('Token'), rules.string('Token'), rules.minLength('Token', 32), rules.maxLength('Token', 256)],
  password: [rules.required('Password'), rules.minLength('Password', 8)],
});
