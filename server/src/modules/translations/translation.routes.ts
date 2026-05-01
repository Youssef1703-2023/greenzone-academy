import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateRequest } from '../../middleware/validateRequest.js';
import { translateLesson } from './translation.controller.js';
import { translationBodySchema, translationParamsSchema } from './translation.schema.js';

export const translationRoutes = Router();

const translationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
});

translationRoutes.post(
  '/translations/lessons/:lessonId',
  translationLimiter,
  validateRequest({ params: translationParamsSchema, body: translationBodySchema }),
  translateLesson,
);
