import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendToken } from '../utils/sendToken.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

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
