import { getLessonContent as getFallbackLessonContent } from '../data/lessonContentData';
import { fetchSupabaseLessonContent } from './supabaseContentService';

export async function fetchLessonContent({ courseSlug, phaseId, lessonId, language }) {
  return fetchSupabaseLessonContent({ courseSlug, phaseId, lessonId, language });
}

export function getFallbackLessonResponse({ phaseId, lessonId, language, message }) {
  const content = getFallbackLessonContent(Number(phaseId), Number(lessonId), language || 'en');
  return {
    language: content._isTranslated ? language : 'en',
    fallback: language === 'ar' && !content._isTranslated,
    source: 'frontend-fallback',
    message,
    content,
  };
}
