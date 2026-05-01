import { z } from 'zod';

export const translationParamsSchema = z.object({
  lessonId: z.string().min(1).max(120),
});

export const translationBodySchema = z.object({
  targetLang: z.enum(['ar']),
  forceRefresh: z.boolean().default(false),
});
