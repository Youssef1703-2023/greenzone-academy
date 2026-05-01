import fs from 'node:fs/promises';
import path from 'node:path';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';
import { loadFrontendLessonSeeds, loadFrontendLessonTranslationSeeds } from '../../data/frontendLessonSeed.js';

export type LessonRecord = {
  id: string;
  courseSlug: string;
  phaseOrder: number;
  lessonOrder: number;
  slug: string;
  title: string;
  contentJson: Record<string, unknown>;
  contentHash: string;
};

type CachedLessonTranslation = {
  id: string;
  lessonId: string;
  targetLang: string;
  translatedContentJson: unknown;
  sourceContentHash: string;
  provider: string;
  providerModel: string | null;
  status: 'pending' | 'completed' | 'failed' | 'stale';
  createdAt: Date;
  updatedAt: Date;
};

const devCachePath = path.resolve(process.cwd(), '.cache', 'lesson-translations.json');

async function readDevTranslationCache(): Promise<Record<string, CachedLessonTranslation>> {
  try {
    const raw = await fs.readFile(devCachePath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, Omit<CachedLessonTranslation, 'createdAt' | 'updatedAt'> & {
      createdAt: string;
      updatedAt: string;
    }>;

    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [
        key,
        {
          ...value,
          createdAt: new Date(value.createdAt),
          updatedAt: new Date(value.updatedAt),
        },
      ]),
    );
  } catch {
    return {};
  }
}

async function writeDevTranslationCache(cache: Record<string, CachedLessonTranslation>) {
  await fs.mkdir(path.dirname(devCachePath), { recursive: true });
  await fs.writeFile(devCachePath, JSON.stringify(cache, null, 2), 'utf8');
}

function devTranslationKey(lessonId: string, targetLang: string) {
  return `${lessonId}:${targetLang}`;
}

export class LessonRepository {
  async findByCoursePhaseLesson(courseSlug: string, phaseOrder: number, lessonOrder: number): Promise<LessonRecord | null> {
    if (prisma) {
      const lesson = await prisma.lesson.findFirst({
        where: {
          course: { slug: courseSlug },
          phase: { order: phaseOrder },
          order: lessonOrder,
        },
        include: {
          course: true,
          phase: true,
        },
      });

      if (lesson) {
        return {
          id: lesson.id,
          courseSlug: lesson.course.slug,
          phaseOrder: lesson.phase.order,
          lessonOrder: lesson.order,
          slug: lesson.slug,
          title: lesson.title,
          contentJson: lesson.contentJson as Record<string, unknown>,
          contentHash: lesson.contentHash,
        };
      }
    }

    const seeds = await loadFrontendLessonSeeds();
    return seeds.find(
      (lesson) =>
        lesson.courseSlug === courseSlug &&
        lesson.phaseOrder === phaseOrder &&
        lesson.lessonOrder === lessonOrder,
    ) ?? null;
  }

  async findById(lessonId: string): Promise<LessonRecord | null> {
    if (prisma) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true, phase: true },
      });

      if (lesson) {
        return {
          id: lesson.id,
          courseSlug: lesson.course.slug,
          phaseOrder: lesson.phase.order,
          lessonOrder: lesson.order,
          slug: lesson.slug,
          title: lesson.title,
          contentJson: lesson.contentJson as Record<string, unknown>,
          contentHash: lesson.contentHash,
        };
      }
    }

    const seeds = await loadFrontendLessonSeeds();
    return seeds.find((lesson) => lesson.id === lessonId) ?? null;
  }

  async findTranslation(lessonId: string, targetLang: string): Promise<CachedLessonTranslation | null> {
    if (!prisma) {
      const cache = await readDevTranslationCache();
      const cached = cache[devTranslationKey(lessonId, targetLang)];
      if (cached) return cached;

      const curatedTranslations = await loadFrontendLessonTranslationSeeds(targetLang);
      const curated = curatedTranslations.find((translation) => translation.lessonId === lessonId);
      if (!curated) return null;

      const timestamp = new Date(0);
      return {
        ...curated,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }

    return prisma.lessonTranslation.findUnique({
      where: { lessonId_targetLang: { lessonId, targetLang } },
    });
  }

  async saveTranslation(input: {
    lessonId: string;
    targetLang: string;
    translatedContentJson: unknown;
    sourceContentHash: string;
    provider: string;
    providerModel?: string;
  }) {
    if (!prisma) {
      const cache = await readDevTranslationCache();
      const now = new Date();
      const key = devTranslationKey(input.lessonId, input.targetLang);
      cache[key] = {
        id: key,
        lessonId: input.lessonId,
        targetLang: input.targetLang,
        translatedContentJson: input.translatedContentJson,
        sourceContentHash: input.sourceContentHash,
        provider: input.provider,
        providerModel: input.providerModel ?? null,
        status: 'completed',
        createdAt: cache[key]?.createdAt ?? now,
        updatedAt: now,
      };
      await writeDevTranslationCache(cache);
      return cache[key];
    }

    return prisma.lessonTranslation.upsert({
      where: { lessonId_targetLang: { lessonId: input.lessonId, targetLang: input.targetLang } },
      update: {
        translatedContentJson: input.translatedContentJson as Prisma.InputJsonValue,
        sourceContentHash: input.sourceContentHash,
        provider: input.provider,
        providerModel: input.providerModel,
        status: 'completed',
      },
      create: {
        lessonId: input.lessonId,
        targetLang: input.targetLang,
        translatedContentJson: input.translatedContentJson as Prisma.InputJsonValue,
        sourceContentHash: input.sourceContentHash,
        provider: input.provider,
        providerModel: input.providerModel,
        status: 'completed',
      },
    });
  }

  async createTranslationJob(input: { lessonId: string; targetLang: string; status: 'failed' | 'pending'; errorMessage?: string }) {
    if (!prisma) return null;
    return prisma.translationJob.create({ data: input });
  }
}
