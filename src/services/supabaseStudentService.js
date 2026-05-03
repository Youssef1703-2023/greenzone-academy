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
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
}

function normalizeQuizQuestion(question, index) {
  return {
    id: question.id || index + 1,
    text: question.prompt,
    prompt: question.prompt,
    options: Array.isArray(question.options_json) ? question.options_json : [],
    correctAnswerIndex: Number(question.correct_answer_index || 0),
  };
}

export async function fetchPhaseQuizExperience({ courseSlug, phaseId }) {
  const client = requireSupabase();
  const userId = await getCurrentAuthUserId();

  const { data: phase, error: phaseError } = await client
    .from('phases')
    .select('id,title,phase_number,courses!inner(slug,title)')
    .eq('courses.slug', courseSlug)
    .eq('phase_number', Number(phaseId))
    .maybeSingle();

  if (phaseError) throw phaseError;
  if (!phase) throw new Error('Phase not found.');

  const [lessonsResult, progressResult, quizResult] = await Promise.all([
    client
      .from('lessons')
      .select('id,title,status')
      .eq('phase_id', phase.id)
      .eq('status', 'published'),
    userId
      ? client
        .from('student_progress')
        .select('lesson_id,status')
        .eq('user_id', userId)
      : Promise.resolve({ data: [], error: null }),
    client
      .from('quizzes')
      .select('id,title,passing_score,status,quiz_questions(*),quiz_attempts(score,passed,attempt_number,created_at,selected_answers)')
      .eq('phase_id', phase.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (lessonsResult.error) throw lessonsResult.error;
  if (progressResult.error) throw progressResult.error;
  if (quizResult.error) throw quizResult.error;
  if (!quizResult.data) throw new Error('No published quiz found for this phase.');

  const lessons = lessonsResult.data || [];
  const completedLessonIds = new Set(
    (progressResult.data || [])
      .filter((item) => item.status === 'completed')
      .map((item) => item.lesson_id),
  );
  const completedLessons = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
  const attempts = (quizResult.data.quiz_attempts || [])
    .slice()
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const latestAttempt = attempts[0] || null;
  const quizQuestions = (quizResult.data.quiz_questions || [])
    .slice()
    .sort((a, b) => (a.question_number || 0) - (b.question_number || 0))
    .map(normalizeQuizQuestion);
  const quizPassed = Boolean(latestAttempt?.passed);
  const quizUnlocked = lessons.length === 0 || completedLessons >= lessons.length;

  return {
    id: Number(phase.phase_number),
    recordId: phase.id,
    title: phase.title,
    courseSlug,
    courseTitle: phase.courses?.title || 'Course',
    totalLessons: lessons.length,
    completedLessons,
    progress: lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 100,
    quizUnlocked,
    quizPassed,
    quizScore: latestAttempt?.score || 0,
    status: quizPassed ? 'completed' : 'in-progress',
    source: 'supabase',
    quiz: {
      id: quizResult.data.id,
      title: quizResult.data.title,
      questionsCount: quizQuestions.length,
      passingScore: quizResult.data.passing_score,
      attempts: attempts.length,
      questions: quizQuestions,
    },
  };
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
