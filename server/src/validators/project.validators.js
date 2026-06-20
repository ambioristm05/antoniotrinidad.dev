import { rules, validateBody } from '../middlewares/validate.js';

const projectRules = {
  title: [rules.required('Title'), rules.maxLength('Title', 140)],
  summary: [rules.required('Summary'), rules.maxLength('Summary', 240)],
  description: [rules.required('Description')],
  technologies: [rules.array('Technologies')],
  status: [rules.enum('Status', ['planned', 'in-progress', 'completed', 'archived'])],
};

export const validateProjectCreate = validateBody(projectRules);

export const validateProjectUpdate = validateBody({
  title: [rules.maxLength('Title', 140)],
  summary: [rules.maxLength('Summary', 240)],
  technologies: [rules.array('Technologies')],
  status: [rules.enum('Status', ['planned', 'in-progress', 'completed', 'archived'])],
});
