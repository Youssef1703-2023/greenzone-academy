import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { getLessonContent } from './lesson.controller.js';
import { lessonParamsSchema, lessonQuerySchema } from './lesson.schema.js';

export const lessonRoutes = Router();

lessonRoutes.get(
  '/courses/:courseSlug/phases/:phaseId/lessons/:lessonId',
  validateRequest({ params: lessonParamsSchema, query: lessonQuerySchema }),
  getLessonContent,
);
