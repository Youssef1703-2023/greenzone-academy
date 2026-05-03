import { requireSupabase, supabase } from './supabaseClient';
import { cachedQuery, clearQueryCache } from './queryCache';

export async function getCurrentAuthUserId() {
  if (!supabase) return null;
  const { data } = await cachedQuery('student:auth-user', () => supabase.auth.getUser(), { ttl: 20_000 });
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

function buildPhaseMap(phases, lessons, progressRows, quizRows, attemptRows, course) {
  const completedLessonIds = new Set(
    progressRows
      .filter((item) => item.status === 'completed')
      .map((item) => item.lesson_id),
  );
  const startedLessonIds = new Set(
    progressRows
      .filter((item) => item.status === 'in_progress')
      .map((item) => item.lesson_id),
  );
  const attemptsByPhase = attemptRows.reduce((map, attempt) => {
    const phaseRecordId = attempt.quizzes?.phase_id;
    if (!phaseRecordId) return map;
    const list = map.get(phaseRecordId) || [];
    list.push(attempt);
    map.set(phaseRecordId, list);
    return map;
  }, new Map());
  const quizzesByPhase = quizRows.reduce((map, quiz) => {
    const list = map.get(quiz.phase_id) || [];
    list.push(quiz);
    map.set(quiz.phase_id, list);
    return map;
  }, new Map());

  let previousPhaseComplete = true;
  const mappedPhases = phases.map((phase) => {
    const phaseLessons = lessons
      .filter((lesson) => lesson.phase_id === phase.id)
      .sort((a, b) => (a.lesson_number || 0) - (b.lesson_number || 0));
    const completedLessons = phaseLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    const progress = phaseLessons.length ? Math.round((completedLessons / phaseLessons.length) * 100) : 100;
    const phaseAttempts = attemptsByPhase.get(phase.id) || [];
    const phaseQuizRows = quizzesByPhase.get(phase.id) || [];
    const quizPassed = phaseAttempts.some((attempt) => attempt.passed);
    const lessonsComplete = Boolean(phaseLessons.length) && completedLessons === phaseLessons.length;
    const quizRequired = Boolean(phaseQuizRows.length);
    const phaseComplete = lessonsComplete && (!quizRequired || quizPassed);
    const locked = !previousPhaseComplete;
    let firstOpenAssigned = false;

    const mappedLessons = phaseLessons.map((lesson, index) => {
      const previousLesson = phaseLessons[index - 1];
      const previousCompleted = index === 0 || completedLessonIds.has(previousLesson.id);
      const completed = completedLessonIds.has(lesson.id);
      const started = startedLessonIds.has(lesson.id);
      let status = 'locked';

      if (!locked && completed) {
        status = 'completed';
      } else if (!locked && (previousCompleted || started) && !firstOpenAssigned) {
        status = 'in-progress';
        firstOpenAssigned = true;
      }

      return {
        id: lesson.lesson_number,
        recordId: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        status,
        readingTime: lesson.reading_time || '10 min',
      };
    });

    const mappedPhase = {
      id: Number(phase.phase_number),
      recordId: phase.id,
      title: phase.title,
      subtitle: phase.description || `Phase ${phase.phase_number}: ${phase.title}`,
      courseSlug: course.slug,
      courseTitle: course.title,
      totalLessons: phaseLessons.length,
      lessonsCount: phaseLessons.length,
      completedLessons,
      progress,
      quizRequired,
      quizUnlocked: !locked && (phaseLessons.length === 0 || completedLessons >= phaseLessons.length),
      quizPassed,
      status: locked ? 'locked' : phaseComplete ? 'completed' : 'in-progress',
      locked,
      lessons: mappedLessons,
      source: 'supabase',
    };

    previousPhaseComplete = phaseComplete;
    return mappedPhase;
  });

  return mappedPhases;
}

function pickContinueTarget(course, phases) {
  const activePhase = phases.find((phase) => !phase.locked && phase.status !== 'completed') || phases.find((phase) => !phase.locked);
  if (!activePhase) return `/courses/${course.slug}`;

  const activeLesson = activePhase.lessons.find((lesson) => lesson.status === 'in-progress')
    || activePhase.lessons.find((lesson) => lesson.status !== 'locked')
    || activePhase.lessons[0];

  if (activePhase.quizUnlocked && !activePhase.quizPassed && activePhase.completedLessons >= activePhase.totalLessons) {
    return `/courses/${course.slug}/phase/${activePhase.id}/quiz`;
  }

  if (activeLesson) {
    return `/courses/${course.slug}/phase/${activePhase.id}/lesson/${activeLesson.id}`;
  }

  return `/courses/${course.slug}/phase/${activePhase.id}`;
}

export async function fetchStudentCourseExperience(courseSlug = 'cybersecurity-fundamentals') {
  const client = requireSupabase();
  const userId = await getCurrentAuthUserId();

  return cachedQuery(['student:course', userId || 'guest', courseSlug], async () => {
    const { data: course, error: courseError } = await client
      .from('courses')
      .select('id,slug,title,description,difficulty,status')
      .eq('slug', courseSlug)
      .eq('status', 'published')
      .maybeSingle();

    if (courseError) throw courseError;
    if (!course) throw new Error('Course not found.');

    const [phasesResult, lessonsResult, quizzesResult, progressResult, attemptsResult] = await Promise.all([
      client
        .from('phases')
        .select('id,phase_number,title,description,status')
        .eq('course_id', course.id)
        .eq('status', 'published')
        .order('phase_number'),
      client
        .from('lessons')
        .select('id,phase_id,lesson_number,slug,title,reading_time,status')
        .eq('course_id', course.id)
        .eq('status', 'published')
        .order('lesson_number'),
      client
        .from('quizzes')
        .select('id,phase_id,status')
        .eq('course_id', course.id)
        .eq('status', 'published'),
      userId
        ? client
          .from('student_progress')
          .select('lesson_id,status,updated_at,completed_at')
          .eq('user_id', userId)
        : Promise.resolve({ data: [], error: null }),
      userId
        ? client
          .from('quiz_attempts')
          .select('score,passed,created_at,quizzes(phase_id)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (phasesResult.error) throw phasesResult.error;
    if (lessonsResult.error) throw lessonsResult.error;
    if (quizzesResult.error) throw quizzesResult.error;
    if (progressResult.error) throw progressResult.error;
    if (attemptsResult.error) throw attemptsResult.error;

    const phases = buildPhaseMap(
      phasesResult.data || [],
      lessonsResult.data || [],
      progressResult.data || [],
      quizzesResult.data || [],
      attemptsResult.data || [],
      course,
    );
    const completedLessons = phases.reduce((sum, phase) => sum + phase.completedLessons, 0);
    const totalLessons = phases.reduce((sum, phase) => sum + phase.totalLessons, 0);
    const activePhase = phases.find((phase) => !phase.locked && phase.status !== 'completed') || phases[0];
    const latestQuizScore = attemptsResult.data?.[0]?.score ?? null;

    return {
      id: course.slug,
      recordId: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      totalPhases: phases.length,
      totalLessons,
      totalQuizzes: quizzesResult.data?.length || 0,
      hasFinalExam: true,
      progress: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
      completedLessons,
      badges: [course.difficulty || 'Beginner', 'Supabase Live', 'Quiz Based Progress'],
      phases,
      continueRoute: pickContinueTarget(course, phases),
      currentPhase: activePhase?.id || 1,
      currentPhaseTitle: activePhase?.title || 'Cybersecurity Introduction',
      currentPhaseLessons: activePhase?.totalLessons || 0,
      currentPhaseCompletedLessons: activePhase?.completedLessons || 0,
      currentPhaseStatus: activePhase?.status === 'completed' ? 'Completed' : 'In Progress',
      latestQuizScore,
      source: 'supabase',
    };
  }, { ttl: 45_000 });
}

export async function fetchStudentPhasePlayer({ courseSlug, phaseId }) {
  const course = await fetchStudentCourseExperience(courseSlug);
  const phase = course.phases.find((item) => item.id === Number(phaseId));
  if (!phase) throw new Error('Phase not found.');
  return phase;
}

export async function fetchPhaseQuizExperience({ courseSlug, phaseId }) {
  const client = requireSupabase();
  const userId = await getCurrentAuthUserId();

  return cachedQuery(['student:quiz', userId || 'guest', courseSlug, phaseId], async () => {
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
  }, { ttl: 30_000 });
}

export async function saveLessonStarted({ courseSlug, phaseId, lessonId }) {
  const userId = await getCurrentAuthUserId();
  if (!userId) return { ok: false, reason: 'not-authenticated' };

  const lessonRecordId = await findLessonId({ courseSlug, phaseId, lessonId });
  if (!lessonRecordId) return { ok: false, reason: 'lesson-not-found' };

  const client = requireSupabase();
  const { data: existing, error: existingError } = await client
    .from('student_progress')
    .select('status')
    .eq('user_id', userId)
    .eq('lesson_id', lessonRecordId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.status === 'completed') return { ok: true, skipped: true };

  const { error } = await client.from('student_progress').upsert({
    user_id: userId,
    lesson_id: lessonRecordId,
    status: 'in_progress',
  }, { onConflict: 'user_id,lesson_id' });

  if (error) throw error;
  clearQueryCache('student:');
  return { ok: true };
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
  clearQueryCache('student:');
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
  clearQueryCache('student:');
  return { ok: true };
}
