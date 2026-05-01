import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env.js';
import { HttpError } from './httpError.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const isHttpError = error instanceof HttpError;
  const statusCode = isHttpError ? error.statusCode : 500;

  res.status(statusCode).json({
    error: {
      message: isHttpError ? error.message : 'Internal server error',
      details: isHttpError ? error.details : undefined,
      stack: env.NODE_ENV === 'production' ? undefined : error.stack,
    },
  });
};
