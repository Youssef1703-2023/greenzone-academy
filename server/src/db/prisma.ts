import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

export const prisma = env.DATABASE_URL ? new PrismaClient() : null;

export function hasDatabase() {
  return prisma !== null;
}
