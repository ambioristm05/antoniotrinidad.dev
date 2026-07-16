import { Router } from 'express';

import { uploadImage } from '../controllers/upload.controller.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { validateImageUpload } from '../validators/upload.validators.js';

const router = Router();

router.post('/images', protect, restrictTo('admin'), validateImageUpload, uploadImage);

export default router;
