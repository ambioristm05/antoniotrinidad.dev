import { Router } from 'express';

import { login, logout, me, requestPasswordReset, resetPassword } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import {
  validateLogin,
  validatePasswordReset,
  validatePasswordResetRequest,
} from '../validators/auth.validators.js';

const router = Router();

router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, validatePasswordResetRequest, requestPasswordReset);
router.post('/reset-password', authLimiter, validatePasswordReset, resetPassword);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
