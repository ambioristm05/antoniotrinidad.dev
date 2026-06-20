import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts. Try again later.',
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: {
    status: 'fail',
    message: 'Too many contact requests. Try again later.',
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
