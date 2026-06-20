import { Router } from 'express';

import {
  createContactMessage,
  deleteContactMessage,
  getContactMessages,
  updateContactMessage,
} from '../controllers/contact.controller.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import { contactLimiter } from '../middlewares/rateLimit.js';
import { validateContactCreate, validateContactUpdate } from '../validators/contact.validators.js';

const router = Router();

router.post('/', contactLimiter, validateContactCreate, createContactMessage);

router.use(protect, restrictTo('admin'));

router.get('/messages', getContactMessages);
router.patch('/messages/:id', validateContactUpdate, updateContactMessage);
router.delete('/messages/:id', deleteContactMessage);

export default router;
