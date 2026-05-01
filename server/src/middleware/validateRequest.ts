import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from './httpError.js';

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validateRequest(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    for (const [location, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const result = schema.safeParse(req[location as keyof ValidationSchemas]);
      if (!result.success) {
        return next(new HttpError(400, 'Invalid request', result.error.flatten()));
      }

      if (location === 'body') {
        req.body = result.data;
      }
    }

    return next();
  };
}
