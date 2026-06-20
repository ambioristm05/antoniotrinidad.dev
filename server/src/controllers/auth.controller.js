import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendToken } from '../utils/sendToken.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  user.passwordHash = undefined;
  sendToken(user, 200, res);
});

export const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const me = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};
