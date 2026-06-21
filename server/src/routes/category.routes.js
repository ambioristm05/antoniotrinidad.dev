import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import {
  validateCategoryCreate,
  validateCategoryQuery,
  validateCategoryUpdate,
} from '../validators/category.validators.js';

const router = Router();

router.get('/', validateCategoryQuery, getCategories);

router.use(protect, restrictTo('admin'));

router.post('/', validateCategoryCreate, createCategory);
router.patch('/:id', validateCategoryUpdate, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
