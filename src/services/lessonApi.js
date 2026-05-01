import { getLessonContent as getFallbackLessonContent } from '../data/lessonContentData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchLessonContent({ courseSlug, phaseId, lessonId, language }) {
  const url = new URL(`${API_BASE_URL}/courses/${courseSlug}/phases/${phaseId}/lessons/${lessonId}`);
  url.searchParams.set('lang', language);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Lesson API failed with status ${response.status}`);
  }

  return response.json();
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
