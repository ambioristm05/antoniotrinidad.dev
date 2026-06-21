import { env } from '../config/env.js';

const duplicateKeyMessage = (error) => {
  const fields = Object.keys(error.keyValue || {}).join(', ');
  return `Duplicate value for field: ${fields}`;
};

const validationMessage = (error) =>
  Object.values(error.errors)
    .map((item) => item.message)
    .join('. ');

export const errorHandler = (error, req, res, _next) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Internal server error';

  if (error.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body cannot exceed 1mb';
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'Request body contains invalid JSON';
  }

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

  if (statusCode >= 500) {
    console.error('Unhandled request error:', error);

    if (env.isProduction) {
      message = 'Internal server error';
    }
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(env.isDevelopment && { stack: error.stack }),
  });
};
