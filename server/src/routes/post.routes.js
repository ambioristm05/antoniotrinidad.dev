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
import { validatePostCreate, validatePostUpdate } from '../validators/post.validators.js';

const router = Router();

router.get('/', getPosts);
router.get('/featured', getFeaturedPosts);
router.get('/admin/all', protect, restrictTo('admin'), getAdminPosts);
router.get('/:slug', getPostBySlug);

router.use(protect, restrictTo('admin'));

router.post('/', validatePostCreate, createPost);
router.patch('/:id', validatePostUpdate, updatePost);
router.delete('/:id', deletePost);

export default router;
