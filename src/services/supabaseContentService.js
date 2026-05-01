import { requireSupabase } from './supabaseClient';

function lessonResponseFromRows({ lesson, translation, language }) {
  const useTranslation = language === 'ar' && translation?.content_json;
  return {
    language: useTranslation ? 'ar' : 'en',
    fallback: language === 'ar' && !useTranslation,
    source: useTranslation ? 'supabase-translation' : 'supabase',
    message: language === 'ar' && !useTranslation
      ? 'Arabic translation is temporarily unavailable. Showing English version.'
      : '',
    content: useTranslation ? translation.content_json : lesson.content_json,
  };
}

export async function fetchSupabaseLessonContent({ courseSlug, phaseId, lessonId, language }) {
  const client = requireSupabase();

  const { data: lesson, error } = await client
    .from('lessons')
    .select(`
      *,
      courses!inner(slug),
      phases!inner(phase_number)
    `)
    .eq('courses.slug', courseSlug)
    .eq('phases.phase_number', Number(phaseId))
    .eq('lesson_number', Number(lessonId))
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  if (!lesson) throw new Error('Lesson not found in Supabase.');

  let translation = null;
  if (language === 'ar') {
    const { data, error: translationError } = await client
      .from('translations')
      .select('*')
      .eq('lesson_id', lesson.id)
      .eq('target_lang', 'ar')
      .eq('status', 'completed')
      .maybeSingle();

    if (translationError) throw translationError;
    translation = data;
  }

  return lessonResponseFromRows({ lesson, translation, language });
}
