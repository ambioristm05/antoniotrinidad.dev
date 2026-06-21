import { Router } from 'express';

import {
  createPost,
  deletePost,
  getAdminPosts,
  getFeaturedPosts,
  getPostBySlug,
  getPosts,
  updatePost,
} from '../controllers/post.controller.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import {
  validateAdminPostQuery,
  validatePostCreate,
  validatePostUpdate,
  validatePublicPostQuery,
} from '../validators/post.validators.js';

const router = Router();

router.get('/', validatePublicPostQuery, getPosts);
router.get('/featured', getFeaturedPosts);
router.get('/admin/all', protect, restrictTo('admin'), validateAdminPostQuery, getAdminPosts);
router.get('/:slug', getPostBySlug);

router.use(protect, restrictTo('admin'));

router.post('/', validatePostCreate, createPost);
router.patch('/:id', validatePostUpdate, updatePost);
router.delete('/:id', deletePost);

export default router;
