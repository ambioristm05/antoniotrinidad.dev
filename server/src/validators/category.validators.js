import { rules, validateBody } from '../middlewares/validate.js';
import { AppError } from '../utils/AppError.js';

const categoryTypes = ['project', 'post'];
const categoryRules = {
  name: [rules.required('Name'), rules.string('Name'), rules.maxLength('Name', 80)],
  slug: [rules.string('Slug'), rules.maxLength('Slug', 100)],
  type: [rules.required('Type'), rules.enum('Type', categoryTypes)],
};

export const validateCategoryCreate = validateBody(categoryRules);

export const validateCategoryUpdate = validateBody(
  {
    ...categoryRules,
    name: categoryRules.name.slice(1),
    type: categoryRules.type.slice(1),
  },
  { requireAtLeastOne: true },
);

export const validateCategoryQuery = (req, res, next) => {
  if (req.query.type && !categoryTypes.includes(req.query.type)) {
    throw new AppError(`Type must be one of: ${categoryTypes.join(', ')}`, 400);
  }

  next();
};
