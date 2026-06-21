import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export const signToken = (id) =>
  jwt.sign({}, env.jwtSecret, {
    algorithm: 'HS256',
    subject: id.toString(),
    expiresIn: env.jwtExpiresIn,
  });

export const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    tokenType: 'Bearer',
    expiresIn: env.jwtExpiresIn,
    data: {
      user,
    },
  });
};
