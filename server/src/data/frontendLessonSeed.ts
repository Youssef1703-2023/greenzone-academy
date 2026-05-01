import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { hashContent } from '../utils/hashContent.js';

type LessonSeed = {
  id: string;
  courseSlug: string;
  phaseOrder: number;
  lessonOrder: number;
  slug: string;
  title: string;
  contentJson: Record<string, unknown>;
  contentHash: string;
};

type LessonTranslationSeed = {
  id: string;
  lessonId: string;
  targetLang: string;
  translatedContentJson: Record<string, unknown>;
  sourceContentHash: string;
  provider: string;
  providerModel: string;
  status: 'completed';
};

let cachedSeeds: LessonSeed[] | null = null;
let cachedTranslationSeeds: LessonTranslationSeed[] | null = null;

function lessonSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function loadFrontendLessonSeeds(): Promise<LessonSeed[]> {
  if (cachedSeeds) return cachedSeeds;

  const frontendDataPath = path.resolve(process.cwd(), '..', 'src', 'data', 'lessonContentData.js');
  const moduleUrl = pathToFileURL(frontendDataPath).href;
  const dataModule = (await import(moduleUrl)) as {
    lessonContents?: Record<string, Record<string, unknown>>;
  };

  const lessonContents = dataModule.lessonContents ?? {};
  cachedSeeds = Object.entries(lessonContents).map(([key, contentJson]) => {
    const [phaseOrder, lessonOrder] = key.split('-').map(Number);
    const title = typeof contentJson.title === 'string'
      ? contentJson.title
      : lessonOrder === 1 && phaseOrder === 1
        ? 'What Is Cybersecurity?'
        : `Lesson ${lessonOrder}`;

    return {
      id: key,
      courseSlug: 'cybersecurity-fundamentals',
      phaseOrder,
      lessonOrder,
      slug: lessonSlug(title),
      title,
      contentJson,
      contentHash: hashContent(contentJson),
    };
  });

  return cachedSeeds;
}

export async function loadFrontendLessonTranslationSeeds(targetLang = 'ar'): Promise<LessonTranslationSeed[]> {
  if (cachedTranslationSeeds) {
    return cachedTranslationSeeds.filter((seed) => seed.targetLang === targetLang);
  }

  const frontendDataPath = path.resolve(process.cwd(), '..', 'src', 'data', 'lessonContentData.js');
  const moduleUrl = pathToFileURL(frontendDataPath).href;
  const dataModule = (await import(moduleUrl)) as {
    lessonContents?: Record<string, Record<string, unknown>>;
    curatedLessonTranslations?: Record<string, Record<string, unknown>>;
  };

  const lessonContents = dataModule.lessonContents ?? {};
  const curatedLessonTranslations = dataModule.curatedLessonTranslations ?? {};

  cachedTranslationSeeds = Object.entries(curatedLessonTranslations)
    .filter(([lessonId]) => lessonContents[lessonId])
    .map(([lessonId, translatedContentJson]) => ({
      id: `${lessonId}:${targetLang}:curated`,
      lessonId,
      targetLang,
      translatedContentJson,
      sourceContentHash: hashContent(lessonContents[lessonId]),
      provider: 'curated',
      providerModel: 'manual-polished-v1',
      status: 'completed',
    }));

  return cachedTranslationSeeds.filter((seed) => seed.targetLang === targetLang);
}
