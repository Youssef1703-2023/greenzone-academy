import { HttpError } from '../../middleware/httpError.js';
import { translateStructuredContent } from '../translations/structuredTranslation.js';
import { createTranslationProvider } from '../translations/translationProvider.factory.js';
import { LessonRepository } from './lesson.repository.js';

const TRANSLATION_UNAVAILABLE_MESSAGE = 'Arabic translation is temporarily unavailable. Showing English version.';

function lessonContentForResponse(lessonTitle: string, contentJson: Record<string, unknown>) {
  return {
    title: lessonTitle,
    ...contentJson,
  };
}

function isUsableTranslation(
  cached: Awaited<ReturnType<LessonRepository['findTranslation']>>,
  contentHash: string,
  providerName: string,
  providerModel: string,
) {
  return (
    cached !== null &&
    cached.status === 'completed' &&
    cached.sourceContentHash === contentHash &&
    (
      cached.provider === 'curated' ||
      (cached.provider === providerName && cached.providerModel === providerModel)
    )
  );
}

export class LessonService {
  constructor(
    private readonly lessons = new LessonRepository(),
    private readonly translationProvider = createTranslationProvider(),
  ) {}

  async getLessonContent(courseSlug: string, phaseId: number, lessonId: number, lang = 'en') {
    const lesson = await this.lessons.findByCoursePhaseLesson(courseSlug, phaseId, lessonId);
    if (!lesson) {
      throw new HttpError(404, 'Lesson not found');
    }

    if (lang === 'en') {
      return {
        language: 'en',
        fallback: false,
        source: 'source',
        content: lessonContentForResponse(lesson.title, lesson.contentJson),
      };
    }

    if (lang !== 'ar') {
      throw new HttpError(400, 'Unsupported language');
    }

    const cached = await this.lessons.findTranslation(lesson.id, lang);
    if (
      cached &&
      isUsableTranslation(cached, lesson.contentHash, this.translationProvider.name, this.translationProvider.model)
    ) {
      return {
        language: lang,
        fallback: false,
        source: 'cache',
        content: cached.translatedContentJson,
      };
    }

    try {
      const translated = await translateStructuredContent(
        lessonContentForResponse(lesson.title, lesson.contentJson),
        this.translationProvider,
        lang,
        'en',
      );

      await this.lessons.saveTranslation({
        lessonId: lesson.id,
        targetLang: lang,
        translatedContentJson: translated,
        sourceContentHash: lesson.contentHash,
        provider: this.translationProvider.name,
        providerModel: this.translationProvider.model,
      });

      return {
        language: lang,
        fallback: false,
        source: 'generated',
        content: translated,
      };
    } catch (error) {
      await this.lessons.createTranslationJob({
        lessonId: lesson.id,
        targetLang: lang,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown translation error',
      });

      return {
        language: 'en',
        fallback: true,
        message: TRANSLATION_UNAVAILABLE_MESSAGE,
        content: lessonContentForResponse(lesson.title, lesson.contentJson),
      };
    }
  }

  async translateLesson(lessonId: string, targetLang: string, forceRefresh = false) {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) {
      throw new HttpError(404, 'Lesson not found');
    }

    const cached = await this.lessons.findTranslation(lesson.id, targetLang);
    if (
      !forceRefresh &&
      cached &&
      isUsableTranslation(cached, lesson.contentHash, this.translationProvider.name, this.translationProvider.model)
    ) {
      return {
        language: targetLang,
        fallback: false,
        source: 'cache',
        content: cached.translatedContentJson,
      };
    }

    const translated = await translateStructuredContent(
      lessonContentForResponse(lesson.title, lesson.contentJson),
      this.translationProvider,
      targetLang,
      'en',
    );

    await this.lessons.saveTranslation({
      lessonId: lesson.id,
      targetLang,
      translatedContentJson: translated,
      sourceContentHash: lesson.contentHash,
      provider: this.translationProvider.name,
      providerModel: this.translationProvider.model,
    });

    return {
      language: targetLang,
      fallback: false,
      source: 'generated',
      content: translated,
    };
  }
}
