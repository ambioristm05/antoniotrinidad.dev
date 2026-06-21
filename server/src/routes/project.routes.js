import { Router } from 'express';

import {
  createProject,
  deleteProject,
  getFeaturedProjects,
  getProjectBySlug,
  getProjects,
  updateProject,
} from '../controllers/project.controller.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import {
  validateProjectCreate,
  validateProjectQuery,
  validateProjectUpdate,
} from '../validators/project.validators.js';

const router = Router();

router.get('/', validateProjectQuery, getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/:slug', getProjectBySlug);

router.use(protect, restrictTo('admin'));

router.post('/', validateProjectCreate, createProject);
router.patch('/:id', validateProjectUpdate, updateProject);
router.delete('/:id', deleteProject);

export default router;
