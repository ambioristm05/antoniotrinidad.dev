import { Router } from 'express';

import {
  createPostComment,
  createPostCommentReply,
  getPostComments,
} from '../controllers/comment.controller.js';
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
import { commentLimiter } from '../middlewares/rateLimit.js';
import {
  validateCommentCreate,
  validateCommentQuery,
  validateReplyCreate,
} from '../validators/comment.validators.js';
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
router.get('/:slug/comments', validateCommentQuery, getPostComments);
router.post('/:slug/comments', commentLimiter, validateCommentCreate, createPostComment);
router.post('/:slug/comments/:commentId/replies', commentLimiter, validateReplyCreate, createPostCommentReply);
router.get('/:slug', getPostBySlug);

router.use(protect, restrictTo('admin'));

router.post('/', validatePostCreate, createPost);
router.patch('/:id', validatePostUpdate, updatePost);
router.delete('/:id', deletePost);

export default router;
