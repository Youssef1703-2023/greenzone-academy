import { z } from 'zod';

export const lessonParamsSchema = z.object({
  courseSlug: z.string().min(1).max(120),
  phaseId: z.coerce.number().int().positive(),
  lessonId: z.coerce.number().int().positive(),
});

export const lessonQuerySchema = z.object({
  lang: z.enum(['en', 'ar']).default('en'),
});
