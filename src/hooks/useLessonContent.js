import { useEffect, useState } from 'react';
import { fetchLessonContent, getFallbackLessonResponse } from '../services/lessonApi';
import { translate } from '../services/i18n';

export function useLessonContent({ courseSlug, phaseId, lessonId, language }) {
  const [state, setState] = useState({
    content: null,
    isLoading: true,
    error: null,
    fallback: false,
    message: '',
    responseLanguage: language,
  });

  useEffect(() => {
    let isActive = true;

    async function loadLesson() {
      setState((previous) => ({ ...previous, isLoading: true, error: null }));

      try {
        const response = await fetchLessonContent({ courseSlug, phaseId, lessonId, language });
        if (!isActive) return;

        setState({
          content: response.content,
          isLoading: false,
          error: null,
          fallback: Boolean(response.fallback),
          message: response.message || '',
          responseLanguage: response.language,
        });
      } catch (error) {
        if (!isActive) return;

        const fallback = getFallbackLessonResponse({
          phaseId,
          lessonId,
          language,
          message: translate('lesson.loadError', language),
        });

        setState({
          content: fallback.content,
          isLoading: false,
          error,
          fallback: Boolean(fallback.fallback),
          message: fallback.message,
          responseLanguage: fallback.language,
        });
      }
    }

    loadLesson();

    return () => {
      isActive = false;
    };
  }, [courseSlug, phaseId, lessonId, language]);

  return state;
}
