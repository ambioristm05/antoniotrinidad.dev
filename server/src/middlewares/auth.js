import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from './asyncHandler.js';

const getTokenFromRequest = (req) => {
  const header = req.headers.authorization?.trim() || '';
  const match = header.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new AppError('Authentication token is required', 401);
  }

  const decoded = jwt.verify(token, env.jwtSecret, {
    algorithms: ['HS256'],
  });
  const userId = decoded.sub || decoded.id;

  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('The user for this token no longer exists', 401);
  }

  req.user = user;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
