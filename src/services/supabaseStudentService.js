import { requireSupabase, supabase } from './supabaseClient';

export async function getCurrentAuthUserId() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

async function findLessonId({ courseSlug, phaseId, lessonId }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('lessons')
    .select('id, courses!inner(slug), phases!inner(phase_number)')
    .eq('courses.slug', courseSlug)
    .eq('phases.phase_number', Number(phaseId))
    .eq('lesson_number', Number(lessonId))
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
}

async function findQuizId({ courseSlug, phaseId }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('quizzes')
    .select('id, courses!inner(slug), phases!inner(phase_number)')
    .eq('courses.slug', courseSlug)
    .eq('phases.phase_number', Number(phaseId))
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
}

export async function saveLessonCompletion({ courseSlug, phaseId, lessonId }) {
  const userId = await getCurrentAuthUserId();
  if (!userId) return { ok: false, reason: 'not-authenticated' };

  const lessonRecordId = await findLessonId({ courseSlug, phaseId, lessonId });
  if (!lessonRecordId) return { ok: false, reason: 'lesson-not-found' };

  const client = requireSupabase();
  const { error } = await client.from('student_progress').upsert({
    user_id: userId,
    lesson_id: lessonRecordId,
    status: 'completed',
    completed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_id' });

  if (error) throw error;
  return { ok: true };
}

export async function loadLessonNote({ courseSlug, phaseId, lessonId }) {
  const userId = await getCurrentAuthUserId();
  if (!userId) return '';

  const lessonRecordId = await findLessonId({ courseSlug, phaseId, lessonId });
  if (!lessonRecordId) return '';

  const client = requireSupabase();
  const { data, error } = await client
    .from('lesson_notes')
    .select('note_text')
    .eq('user_id', userId)
    .eq('lesson_id', lessonRecordId)
    .maybeSingle();

  if (error) throw error;
  return data?.note_text || '';
}

export async function saveLessonNote({ courseSlug, phaseId, lessonId, noteText }) {
  const userId = await getCurrentAuthUserId();
  if (!userId) return { ok: false, reason: 'not-authenticated' };

  const lessonRecordId = await findLessonId({ courseSlug, phaseId, lessonId });
  if (!lessonRecordId) return { ok: false, reason: 'lesson-not-found' };

  const client = requireSupabase();
  const { error } = await client.from('lesson_notes').upsert({
    user_id: userId,
    lesson_id: lessonRecordId,
    note_text: noteText,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_id' });

  if (error) throw error;
  return { ok: true };
}

export async function saveQuizAttempt({ courseSlug, phaseId, score, passed, selectedAnswers }) {
  const userId = await getCurrentAuthUserId();
  if (!userId) return { ok: false, reason: 'not-authenticated' };

  const quizId = await findQuizId({ courseSlug, phaseId });
  if (!quizId) return { ok: false, reason: 'quiz-not-found' };

  const client = requireSupabase();
  const { count } = await client
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('quiz_id', quizId);

  const { error } = await client.from('quiz_attempts').insert({
    user_id: userId,
    quiz_id: quizId,
    attempt_number: (count || 0) + 1,
    score,
    passed,
    selected_answers: selectedAnswers,
  });

  if (error) throw error;
  return { ok: true };
}
