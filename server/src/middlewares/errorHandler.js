import { env } from '../config/env.js';

const duplicateKeyMessage = (error) => {
  const fields = Object.keys(error.keyValue || {}).join(', ');
  return `Duplicate value for field: ${fields}`;
};

const validationMessage = (error) =>
  Object.values(error.errors)
    .map((item) => item.message)
    .join('. ');

export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = duplicateKeyMessage(error);
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = validationMessage(error);
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(env.isDevelopment && { stack: error.stack }),
  });
};
