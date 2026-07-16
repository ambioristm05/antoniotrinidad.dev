import crypto from 'node:crypto';

import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendToken } from '../utils/sendToken.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const resetTokenExpiresInMinutes = 15;
const resetRequestMessage = 'If an admin account exists for that email, a password reset link has been prepared.';

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.set('Cache-Control', 'no-store');
  sendToken(user, 200, res);
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetToken +passwordResetExpires');
  let resetUrl;

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = hashResetToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + resetTokenExpiresInMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    if (!env.isProduction) {
      resetUrl = `${env.clientUrl}/admin/reset-password?token=${resetToken}`;
    }
  }

  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'success',
    message: resetRequestMessage,
    ...(resetUrl && { data: { resetUrl, expiresInMinutes: resetTokenExpiresInMinutes } }),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const resetToken = hashResetToken(req.body.token);
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordHash +passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Password reset token is invalid or has expired', 400);
  }

  user.passwordHash = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.set('Cache-Control', 'no-store');
  sendToken(user, 200, res);
});

export const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const me = (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};
