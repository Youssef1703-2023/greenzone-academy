import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  GOOGLE_TRANSLATE_API_KEY: z.string().optional(),
  GOOGLE_TRANSLATE_PROJECT_ID: z.string().optional(),
  TRANSLATION_PROVIDER: z.enum(['libretranslate', 'google']).default('libretranslate'),
  LIBRETRANSLATE_URL: z.string().url().default('http://localhost:5001'),
  LIBRETRANSLATE_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('Invalid environment configuration. Falling back to safe defaults.', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: 'development' as const,
      PORT: 5000,
      CLIENT_URL: 'http://localhost:5173',
      DATABASE_URL: process.env.DATABASE_URL,
      GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY,
      GOOGLE_TRANSLATE_PROJECT_ID: process.env.GOOGLE_TRANSLATE_PROJECT_ID,
      TRANSLATION_PROVIDER: 'libretranslate' as const,
      LIBRETRANSLATE_URL: 'http://localhost:5001',
      LIBRETRANSLATE_API_KEY: process.env.LIBRETRANSLATE_API_KEY,
    };

export const hasGoogleTranslateCredentials = Boolean(
  env.GOOGLE_TRANSLATE_API_KEY && env.GOOGLE_TRANSLATE_PROJECT_ID,
);
