import { requireSupabase } from './supabaseClient';

export const ADMIN_BACKEND_UNAVAILABLE = 'Supabase admin backend is unavailable.';

const unavailable = null;

function fromStatus(status) {
  if (status === 'published') return 'Published';
  if (status === 'archived') return 'Archived';
  if (status === 'disabled') return 'Disabled';
  if (status === 'active') return 'Active';
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'In Progress';
  if (status === 'not_started') return 'Not Started';
  return 'Draft';
}

function toContentStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'published') return 'published';
  if (normalized === 'archived') return 'archived';
  return 'draft';
}

function toUserStatus(status) {
  return String(status || '').toLowerCase() === 'disabled' ? 'disabled' : 'active';
}

function fromWorkflowStage(contentJson, status) {
  if (status === 'published') return 'Published';
  const stage = contentJson?.workflow?.stage || contentJson?.workflowStatus;
  if (stage === 'review') return 'In Review';
  if (stage === 'archived') return 'Archived';
  return 'Draft';
}

function dateOnly(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function average(values) {
  const usable = values.map(Number).filter(Number.isFinite);
  if (!usable.length) return unavailable;
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

function dayKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function buildLastSevenDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
}

function normalizeQuestion(question, index) {
  const options = Array.isArray(question.options_json)
    ? question.options_json
    : Array.isArray(question.options)
      ? question.options
      : ['Option A', 'Option B', 'Option C', 'Option D'];

  return {
    id: question.id,
    questionNumber: question.question_number || index + 1,
    prompt: question.prompt || question.text || '',
    text: question.prompt || question.text || '',
    options,
    correctAnswerIndex: Number(question.correct_answer_index ?? question.correctAnswerIndex ?? 0),
  };
}

function mapQuiz(quiz) {
  const scores = quiz.quiz_attempts?.map((attempt) => attempt.score) || [];
  const passed = quiz.quiz_attempts?.filter((attempt) => attempt.passed).length || 0;
  const questions = (quiz.quiz_questions || [])
    .slice()
    .sort((a, b) => (a.question_number || 0) - (b.question_number || 0))
    .map(normalizeQuestion);

  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    phaseId: quiz.phases?.phase_number,
    phaseRecordId: quiz.phase_id,
    phaseTitle: quiz.phases?.title,
    questions,
    questionsCount: questions.length,
    passingScore: quiz.passing_score,
    attempts: quiz.quiz_attempts?.length || 0,
    averageScore: average(scores),
    passRate: quiz.quiz_attempts?.length ? Math.round((passed / quiz.quiz_attempts.length) * 100) : unavailable,
    status: fromStatus(quiz.status),
    updatedAt: quiz.updated_at,
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || crypto.randomUUID();
}

async function recordAudit(action, entityType, entityName, entityId = null, details = '') {
  try {
    const client = requireSupabase();
    await client.from('admin_audit_log').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      details,
    });
  } catch {
    // Audit logging must never make the main admin action look successful/failing incorrectly.
  }
}

async function safeQuery(query) {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new Error(error?.message || ADMIN_BACKEND_UNAVAILABLE, { cause: error });
  }
}

async function safeCount(query) {
  try {
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  } catch (error) {
    throw new Error(error?.message || ADMIN_BACKEND_UNAVAILABLE, { cause: error });
  }
}

export async function getCourses() {
  const client = requireSupabase();
  const courses = await safeQuery(client.from('courses').select('*, phases(id), lessons(id), quizzes(id)').order('created_at'));
  return courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    status: fromStatus(course.status),
    phasesCount: course.phases?.length || 0,
    lessonsCount: course.lessons?.length || 0,
    quizzesCount: course.quizzes?.length || 0,
    updatedAt: course.updated_at,
  }));
}

export async function saveCourse(record) {
  const client = requireSupabase();
  const payload = {
    slug: record.slug || slugify(record.title),
    title: record.title,
    description: record.description || '',
    difficulty: record.difficulty || 'Beginner',
    status: toContentStatus(record.status),
  };

  const query = record.id
    ? client.from('courses').update(payload).eq('id', record.id).select('*').single()
    : client.from('courses').insert(payload).select('*').single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  await recordAudit(record.id ? 'Course edited' : 'Course created', 'Course', data.title, data.id);
  return (await getCourses()).find((course) => course.id === data.id);
}

export async function deleteCourse(id) {
  const client = requireSupabase();
  const { data, error } = await client.from('courses').delete().eq('id', id).select('id,title').single();
  if (error) throw new Error(error.message);
  await recordAudit('Course deleted', 'Course', data.title, data.id);
  return { ok: true };
}

export async function getPhases() {
  const client = requireSupabase();
  const phases = await safeQuery(client
    .from('phases')
    .select('*, courses(title), lessons(id), quizzes(id)')
    .order('phase_number'));

  return phases.map((phase) => ({
    id: phase.id,
    courseId: phase.course_id,
    courseTitle: phase.courses?.title,
    order: phase.phase_number,
    title: phase.title,
    description: phase.description,
    status: fromStatus(phase.status),
    lessonsCount: phase.lessons?.length || 0,
    quizAttached: Boolean(phase.quizzes?.length),
    previewStatus: phase.status === 'published' ? 'Unlocked' : 'Locked',
    updatedAt: phase.updated_at,
  }));
}

export async function savePhase(record) {
  const client = requireSupabase();
  const payload = {
    course_id: record.courseId,
    phase_number: Number(record.order || 1),
    title: record.title,
    description: record.description || '',
    status: toContentStatus(record.status),
  };

  const query = record.id
    ? client.from('phases').update(payload).eq('id', record.id).select('*').single()
    : client.from('phases').insert(payload).select('*').single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  await recordAudit(record.id ? 'Phase edited' : 'Phase created', 'Phase', data.title, data.id);
  return (await getPhases()).find((phase) => phase.id === data.id);
}

export async function deletePhase(id) {
  const client = requireSupabase();
  const { data, error } = await client.from('phases').delete().eq('id', id).select('id,title').single();
  if (error) throw new Error(error.message);
  await recordAudit('Phase deleted', 'Phase', data.title, data.id);
  return { ok: true };
}

export async function getLessons() {
  const client = requireSupabase();
  const lessons = await safeQuery(client
    .from('lessons')
    .select('*, courses(title,slug), phases(id,title,phase_number), translations(*)')
    .order('lesson_number'));

  return lessons.map((lesson) => {
    const arabic = lesson.translations?.find((translation) => translation.target_lang === 'ar');
    return {
      id: lesson.id,
      courseId: lesson.course_id,
      courseTitle: lesson.courses?.title,
      phaseId: lesson.phases?.phase_number,
      phaseRecordId: lesson.phase_id,
      phaseTitle: lesson.phases?.title,
      order: lesson.lesson_number,
      slug: lesson.slug,
      title: lesson.title,
      contentJson: lesson.content_json,
      contentHash: lesson.content_hash,
      status: fromStatus(lesson.status),
      workflowStage: fromWorkflowStage(lesson.content_json, lesson.status),
      route: `/courses/${lesson.courses?.slug}/phase/${lesson.phases?.phase_number}/lesson/${lesson.lesson_number}`,
      englishStatus: lesson.content_json ? 'Ready' : 'Missing',
      arabicStatus: arabic?.status === 'completed' ? 'Ready' : arabic?.status === 'stale' ? 'Stale' : 'Missing',
      translationSource: arabic ? (arabic.provider === 'curated' ? 'Manual' : arabic.provider) : 'Missing',
      hashStatus: arabic ? (arabic.source_content_hash === lesson.content_hash ? 'Fresh' : 'Stale') : 'N/A',
      readingTime: lesson.reading_time || '12-15 min',
      completionCount: unavailable,
      updatedAt: lesson.updated_at,
    };
  });
}

export async function saveLesson(record) {
  const client = requireSupabase();
  const contentJson = record.contentJson || { title: record.title, sections: [] };
  const payload = {
    course_id: record.courseId,
    phase_id: record.phaseRecordId || record.phaseId,
    lesson_number: Number(record.order || 1),
    slug: record.slug || slugify(record.title),
    title: record.title,
    content_json: contentJson,
    content_hash: record.contentHash || String(JSON.stringify(contentJson).length),
    reading_time: record.readingTime || null,
    status: toContentStatus(record.status),
  };

  const query = record.id
    ? client.from('lessons').update(payload).eq('id', record.id).select('*').single()
    : client.from('lessons').insert(payload).select('*').single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  await recordAudit(record.id ? 'Lesson edited' : 'Lesson created', 'Lesson', data.title, data.id);
  return (await getLessons()).find((lesson) => lesson.id === data.id);
}

export async function deleteLesson(id) {
  const client = requireSupabase();
  const { data, error } = await client.from('lessons').delete().eq('id', id).select('id,title').single();
  if (error) throw new Error(error.message);
  await recordAudit('Lesson deleted', 'Lesson', data.title, data.id);
  return { ok: true };
}

export async function getQuizzes() {
  const client = requireSupabase();
  const quizzes = await safeQuery(client
    .from('quizzes')
    .select('*, phases(id,title,phase_number), quiz_questions(*), quiz_attempts(score,passed)')
    .order('created_at'));

  return quizzes.map(mapQuiz);
}

export async function saveQuiz(record) {
  const client = requireSupabase();
  const phases = await safeQuery(client.from('phases').select('id,course_id').eq('id', record.phaseRecordId || record.phaseId).limit(1));
  const phase = phases[0];
  if (!phase) throw new Error('Valid phase is required.');

  const payload = {
    course_id: phase.course_id,
    phase_id: phase.id,
    slug: record.slug || slugify(record.title),
    title: record.title,
    passing_score: Number(record.passingScore || 70),
    status: toContentStatus(record.status),
  };
  const query = record.id
    ? client.from('quizzes').update(payload).eq('id', record.id).select('*').single()
    : client.from('quizzes').insert(payload).select('*').single();
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  if (Array.isArray(record.questions)) {
    const normalizedQuestions = record.questions.map((question, index) => ({
      quiz_id: data.id,
      question_number: index + 1,
      prompt: question.prompt || question.text,
      options_json: question.options,
      correct_answer_index: Number(question.correctAnswerIndex || 0),
    }));

    const { error: deleteQuestionsError } = await client.from('quiz_questions').delete().eq('quiz_id', data.id);
    if (deleteQuestionsError) throw new Error(deleteQuestionsError.message);

    if (normalizedQuestions.length) {
      const { error: questionsError } = await client.from('quiz_questions').insert(normalizedQuestions);
      if (questionsError) throw new Error(questionsError.message);
    }
  }

  await recordAudit(record.id ? 'Quiz edited' : 'Quiz created', 'Quiz', data.title, data.id);
  return (await getQuizzes()).find((quiz) => quiz.id === data.id);
}

export async function deleteQuiz(id) {
  const client = requireSupabase();
  const { data, error } = await client.from('quizzes').delete().eq('id', id).select('id,title').single();
  if (error) throw new Error(error.message);
  await recordAudit('Quiz deleted', 'Quiz', data.title, data.id);
  return { ok: true };
}

export async function getStudents() {
  const client = requireSupabase();
  const [profiles, progress, attempts, lessons] = await Promise.all([
    safeQuery(client.from('profiles').select('*').eq('role', 'student').order('created_at')),
    safeQuery(client.from('student_progress').select('user_id,status,lesson_id,lessons(id,phase_id)')),
    safeQuery(client.from('quiz_attempts').select('user_id,score')),
    safeQuery(client.from('lessons').select('id,phase_id').eq('status', 'published')),
  ]);

  const lessonsByPhase = lessons.reduce((map, lesson) => {
    const list = map.get(lesson.phase_id) || [];
    list.push(lesson.id);
    map.set(lesson.phase_id, list);
    return map;
  }, new Map());

  return profiles.map((profile) => {
    const studentProgress = progress.filter((item) => item.user_id === profile.id && item.status === 'completed');
    const completedLessonIds = new Set(studentProgress.map((item) => item.lesson_id));
    const completedPhases = [...lessonsByPhase.values()].filter((phaseLessons) => (
      phaseLessons.length && phaseLessons.every((lessonId) => completedLessonIds.has(lessonId))
    )).length;
    const studentAttempts = attempts.filter((item) => item.user_id === profile.id);
    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      role: profile.role,
      status: fromStatus(profile.status),
      progress: lessons.length ? Math.round((studentProgress.length / lessons.length) * 100) : unavailable,
      completedLessons: studentProgress.length,
      completedPhases,
      joinedAt: dateOnly(profile.created_at),
      lastActive: dateOnly(profile.last_active_at),
      averageScore: average(studentAttempts.map((attempt) => attempt.score)),
      quizAttempts: studentAttempts.length,
    };
  });
}

export async function getStudentDetail(studentId) {
  const client = requireSupabase();
  const [profiles, progress, attempts, phases, lessons] = await Promise.all([
    safeQuery(client.from('profiles').select('*').eq('id', studentId).limit(1)),
    safeQuery(client
      .from('student_progress')
      .select('*, lessons(id,title,lesson_number,phase_id,phases(title,phase_number),courses(title,slug))')
      .eq('user_id', studentId)
      .order('updated_at', { ascending: false })),
    safeQuery(client
      .from('quiz_attempts')
      .select('*, quizzes(title,slug,passing_score,phases(title,phase_number))')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false })),
    safeQuery(client.from('phases').select('id,title,phase_number').order('phase_number')),
    safeQuery(client.from('lessons').select('id,phase_id,status').eq('status', 'published')),
  ]);

  const profile = profiles[0];
  if (!profile) throw new Error('Student not found.');

  const completedProgress = progress.filter((item) => item.status === 'completed');
  const completedLessonIds = new Set(completedProgress.map((item) => item.lesson_id));
  const phaseProgress = phases.map((phase) => {
    const phaseLessons = lessons.filter((lesson) => lesson.phase_id === phase.id);
    const completedLessons = phaseLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
    return {
      id: phase.id,
      title: phase.title,
      phaseNumber: phase.phase_number,
      totalLessons: phaseLessons.length,
      completedLessons,
      progress: phaseLessons.length ? Math.round((completedLessons / phaseLessons.length) * 100) : 0,
      status: phaseLessons.length && completedLessons === phaseLessons.length ? 'Completed' : completedLessons ? 'In Progress' : 'Not Started',
    };
  });

  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    status: fromStatus(profile.status),
    joinedAt: dateOnly(profile.created_at),
    lastActive: dateOnly(profile.last_active_at),
    summary: {
      completedLessons: completedProgress.length,
      totalLessons: lessons.length,
      overallProgress: lessons.length ? Math.round((completedProgress.length / lessons.length) * 100) : unavailable,
      quizAttempts: attempts.length,
      averageScore: average(attempts.map((attempt) => attempt.score)),
      passedQuizzes: attempts.filter((attempt) => attempt.passed).length,
    },
    phaseProgress,
    recentLessons: progress.slice(0, 10).map((item) => ({
      id: item.id,
      title: item.lessons?.title || 'Lesson',
      phase: item.lessons?.phases?.title || 'Phase',
      lessonNumber: item.lessons?.lesson_number,
      status: fromStatus(item.status),
      updatedAt: dateOnly(item.updated_at),
    })),
    quizAttempts: attempts.map((attempt) => ({
      id: attempt.id,
      quizName: attempt.quizzes?.title || 'Quiz',
      phase: attempt.quizzes?.phases?.title || 'Phase',
      score: attempt.score,
      passingScore: attempt.quizzes?.passing_score,
      attemptNumber: attempt.attempt_number,
      status: attempt.passed ? 'Passed' : 'Failed',
      date: dateOnly(attempt.created_at),
    })),
  };
}

export async function saveStudent(record) {
  const client = requireSupabase();
  const payload = {
    full_name: record.name,
    email: record.email,
    status: toUserStatus(record.status),
  };
  const { data, error } = await client.from('profiles').update(payload).eq('id', record.id).select('*').single();
  if (error) throw new Error(error.message);
  await recordAudit('Student edited', 'Student', data.full_name, data.id);
  return (await getStudents()).find((student) => student.id === data.id);
}

export async function toggleStudentStatus(student) {
  const client = requireSupabase();
  const status = student.status === 'Disabled' ? 'active' : 'disabled';
  const { data, error } = await client.from('profiles').update({ status }).eq('id', student.id).select('*').single();
  if (error) throw new Error(error.message);
  await recordAudit(status === 'disabled' ? 'Student disabled' : 'Student enabled', 'Student', data.full_name, data.id);
  return (await getStudents()).find((entry) => entry.id === data.id);
}

export async function resetStudentProgress(student) {
  const client = requireSupabase();
  const [{ error: progressError }, { error: attemptsError }] = await Promise.all([
    client.from('student_progress').delete().eq('user_id', student.id),
    client.from('quiz_attempts').delete().eq('user_id', student.id),
  ]);
  if (progressError || attemptsError) throw new Error(progressError?.message || attemptsError?.message);
  await recordAudit('Progress reset', 'Student', student.name, student.id);
  return (await getStudents()).find((entry) => entry.id === student.id);
}

export async function getScores() {
  const client = requireSupabase();
  const rows = await safeQuery(client
    .from('quiz_attempts')
    .select('*, profiles(full_name), quizzes(title,slug,passing_score)')
    .order('created_at', { ascending: false }));

  return rows.map((attempt) => ({
    id: attempt.id,
    studentName: attempt.profiles?.full_name || 'Student',
    studentId: attempt.user_id,
    quizName: attempt.quizzes?.title || 'Quiz',
    quizSlug: attempt.quizzes?.slug,
    score: attempt.score,
    attempts: attempt.attempt_number,
    status: attempt.passed ? 'Passed' : 'Failed',
    date: dateOnly(attempt.created_at),
  }));
}

export async function getTranslations() {
  const lessons = await getLessons();
  return lessons.map((lesson) => ({
    id: lesson.id,
    lessonId: lesson.id,
    course: lesson.courseTitle,
    phase: `Phase ${lesson.phaseId}`,
    lesson: lesson.title,
    route: lesson.route,
    englishStatus: lesson.englishStatus,
    arabicStatus: lesson.arabicStatus,
    translationSource: lesson.translationSource,
    lastUpdated: lesson.updatedAt,
    hashStatus: lesson.hashStatus,
    reviewed: lesson.arabicStatus === 'Ready',
  }));
}

export async function markTranslationReviewed(translation) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('translations')
    .update({ reviewed_at: new Date().toISOString() })
    .eq('lesson_id', translation.lessonId || translation.id)
    .eq('target_lang', 'ar')
    .select('id, lessons(title)')
    .single();
  if (error) throw new Error(error.message);
  await recordAudit('Translation reviewed', 'Translation', data.lessons?.title || translation.lesson, data.id);
  return (await getTranslations()).find((entry) => entry.lessonId === (translation.lessonId || translation.id));
}

export async function getAuditLog() {
  const client = requireSupabase();
  const rows = await safeQuery(client.from('admin_audit_log').select('*').order('created_at', { ascending: false }));
  return rows.map((event) => ({
    id: event.id,
    action: event.action,
    entityType: event.entity_type,
    entityName: event.entity_name,
    actor: event.actor || 'Admin',
    details: event.details,
    createdAt: event.created_at,
  }));
}

export async function getAdminSettings() {
  const client = requireSupabase();
  const rows = await safeQuery(client.from('settings').select('*').eq('key', 'platform').limit(1));
  return rows[0]?.value_json || {
    platformName: 'Green Zone Academy',
    defaultLanguage: 'en',
    passingScore: 70,
    translationMode: 'Manual / Supabase',
    dataSourceMode: 'Supabase',
  };
}

export async function saveAdminSettings(settings) {
  const client = requireSupabase();
  const next = { ...settings, dataSourceMode: 'Supabase' };
  const { error } = await client.from('settings').upsert({ key: 'platform', value_json: next }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
  await recordAudit('Settings updated', 'Settings', 'Admin Settings');
  return next;
}

export async function fetchBackendAdminOverview() {
  const client = requireSupabase();
  const countRows = (table, configure = (query) => query) => safeCount(
    configure(client.from(table).select('id', { count: 'exact', head: true })),
  );

  const [
    totalCourses,
    totalPhases,
    totalLessons,
    totalQuizzes,
    publishedCourses,
    draftCourses,
    publishedLessons,
    draftLessons,
    totalStudents,
    activeStudents,
    disabledStudents,
    englishLessons,
    completedArabicTranslations,
    staleArabicTranslations,
    attempts,
    attemptsDetail,
    progressRows,
    progressDetail,
    studentProfiles,
    lessonsForAnalytics,
    phasesForAnalytics,
    auditLog,
  ] = await Promise.all([
    countRows('courses'),
    countRows('phases'),
    countRows('lessons'),
    countRows('quizzes'),
    countRows('courses', (query) => query.eq('status', 'published')),
    countRows('courses', (query) => query.eq('status', 'draft')),
    countRows('lessons', (query) => query.eq('status', 'published')),
    countRows('lessons', (query) => query.eq('status', 'draft')),
    countRows('profiles', (query) => query.eq('role', 'student')),
    countRows('profiles', (query) => query.eq('role', 'student').eq('status', 'active')),
    countRows('profiles', (query) => query.eq('role', 'student').eq('status', 'disabled')),
    countRows('lessons', (query) => query.not('content_json', 'is', null)),
    countRows('translations', (query) => query.eq('target_lang', 'ar').eq('status', 'completed')),
    countRows('translations', (query) => query.eq('target_lang', 'ar').eq('status', 'stale')),
    safeQuery(client.from('quiz_attempts').select('score,passed')),
    safeQuery(client.from('quiz_attempts').select('score,passed,created_at,quizzes(title,phase_id,phases(title,phase_number))')),
    safeQuery(client.from('student_progress').select('user_id,status').eq('status', 'completed')),
    safeQuery(client.from('student_progress').select('user_id,status,lesson_id,updated_at,lessons(id,title,lesson_number,phase_id,phases(title,phase_number))').eq('status', 'completed')),
    safeQuery(client.from('profiles').select('id,created_at,status').eq('role', 'student')),
    safeQuery(client.from('lessons').select('id,title,lesson_number,phase_id,status,phases(title,phase_number)').eq('status', 'published')),
    safeQuery(client.from('phases').select('id,title,phase_number').order('phase_number')),
    safeQuery(client.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(8)),
  ]);

  const scoreValues = attempts.map((attempt) => Number(attempt.score)).filter(Number.isFinite);
  const passedAttempts = attempts.filter((attempt) => attempt.passed).length;
  const completedByStudent = progressRows.reduce((map, item) => {
    map.set(item.user_id, (map.get(item.user_id) || 0) + 1);
    return map;
  }, new Map());
  const completedLessons = [...completedByStudent.values()];
  const totalPublishedLessons = lessonsForAnalytics.length || publishedLessons;
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const activeStudentIds = new Set(studentProfiles.map((profile) => profile.id));
  const studentsWithProgress = new Set(progressRows.map((item) => item.user_id));
  const phaseOne = phasesForAnalytics.find((phase) => Number(phase.phase_number) === 1);
  const phaseOneLessonIds = new Set(
    lessonsForAnalytics
      .filter((lesson) => lesson.phase_id === phaseOne?.id)
      .map((lesson) => lesson.id),
  );
  const phaseOneCompletedByStudent = progressDetail.reduce((map, item) => {
    if (!phaseOneLessonIds.has(item.lesson_id)) return map;
    const list = map.get(item.user_id) || new Set();
    list.add(item.lesson_id);
    map.set(item.user_id, list);
    return map;
  }, new Map());
  const studentsCompletedPhaseOne = phaseOneLessonIds.size
    ? [...phaseOneCompletedByStudent.values()].filter((set) => set.size >= phaseOneLessonIds.size).length
    : 0;
  const trendDays = buildLastSevenDays();
  const trend = trendDays.map((date) => ({
    date,
    newStudents: studentProfiles.filter((profile) => dayKey(profile.created_at) === date).length,
    lessonCompletions: progressDetail.filter((item) => dayKey(item.updated_at) === date).length,
    quizAttempts: attemptsDetail.filter((item) => dayKey(item.created_at) === date).length,
  }));

  const completionsByLesson = progressDetail.reduce((map, item) => {
    map.set(item.lesson_id, (map.get(item.lesson_id) || 0) + 1);
    return map;
  }, new Map());
  const lessonHotspots = lessonsForAnalytics
    .map((lesson) => {
      const completedCount = completionsByLesson.get(lesson.id) || 0;
      const completionRate = activeStudentIds.size ? Math.round((completedCount / activeStudentIds.size) * 100) : 0;
      return {
        id: lesson.id,
        title: lesson.title,
        lessonNumber: lesson.lesson_number,
        phase: lesson.phases?.title || 'Phase',
        completedCount,
        completionRate,
        needsAttention: activeStudentIds.size > 0 && completionRate < 50,
      };
    })
    .sort((a, b) => a.completionRate - b.completionRate || b.completedCount - a.completedCount)
    .slice(0, 6);

  const phaseAnalytics = phasesForAnalytics.map((phase) => {
    const phaseLessons = lessonsForAnalytics.filter((lesson) => lesson.phase_id === phase.id);
    const completedEvents = progressDetail.filter((item) => item.lessons?.phase_id === phase.id).length;
    const possibleCompletions = Math.max(phaseLessons.length * activeStudentIds.size, 1);
    return {
      id: phase.id,
      title: phase.title,
      phaseNumber: phase.phase_number,
      lessons: phaseLessons.length,
      completionRate: Math.round((completedEvents / possibleCompletions) * 100),
    };
  });

  const quizMap = attemptsDetail.reduce((map, attempt) => {
    const title = attempt.quizzes?.title || 'Quiz';
    const record = map.get(title) || { title, attempts: 0, passed: 0, scores: [] };
    record.attempts += 1;
    if (attempt.passed) record.passed += 1;
    record.scores.push(attempt.score);
    map.set(title, record);
    return map;
  }, new Map());
  const quizPerformance = [...quizMap.values()]
    .map((quiz) => ({
      title: quiz.title,
      attempts: quiz.attempts,
      passRate: quiz.attempts ? Math.round((quiz.passed / quiz.attempts) * 100) : unavailable,
      averageScore: average(quiz.scores),
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 5);

  return {
    content: {
      totalCourses,
      totalPhases,
      totalLessons,
      totalQuizzes,
      publishedCourses,
      draftCourses,
      publishedLessons,
      draftLessons,
    },
    students: {
      totalStudents,
      activeStudents,
      disabledStudents,
      newStudentsThisWeek: studentProfiles.filter((profile) => new Date(profile.created_at) >= oneWeekAgo).length,
    },
    progress: {
      averageCourseProgress: totalPublishedLessons
        ? average([...activeStudentIds].map((id) => Math.round(((completedByStudent.get(id) || 0) / totalPublishedLessons) * 100)))
        : unavailable,
      averageLessonsCompleted: average(completedLessons),
      studentsCompletedPhase1: studentsCompletedPhaseOne,
      studentsInProgress: studentsWithProgress.size,
      studentsNotStarted: Math.max(totalStudents - studentsWithProgress.size, 0),
    },
    quizzes: {
      totalAttempts: attempts.length,
      passedAttempts,
      failedAttempts: attempts.length - passedAttempts,
      averageScore: average(scoreValues),
      highestScore: scoreValues.length ? Math.max(...scoreValues) : unavailable,
      lowestScore: scoreValues.length ? Math.min(...scoreValues) : unavailable,
      passRate: attempts.length ? Math.round((passedAttempts / attempts.length) * 100) : unavailable,
    },
    contentHealth: {
      lessonsWithEnglishContent: englishLessons,
      lessonsMissingEnglishContent: Math.max(totalLessons - englishLessons, 0),
      lessonsWithArabicTranslation: completedArabicTranslations,
      lessonsMissingArabicTranslation: Math.max(totalLessons - completedArabicTranslations, 0),
      lessonsWithStaleTranslation: staleArabicTranslations,
      draftLessons,
    },
    recentActivity: auditLog.slice(0, 8).map((event) => ({
      id: event.id,
      label: `${event.action}: ${event.entity_name}`,
      type: event.entity_type,
      createdAt: event.created_at,
    })),
    health: {
      authStatus: 'Supabase Auth',
      dataSource: 'Supabase',
      translationMode: 'Manual / Supabase',
      googleTranslateConfigured: false,
      databaseConnected: true,
      lastRefreshTime: new Date().toISOString(),
    },
    analytics: {
      trend,
      lessonHotspots,
      phaseAnalytics,
      quizPerformance,
    },
  };
}

export async function getContentHealth() {
  return (await fetchBackendAdminOverview()).contentHealth;
}

export async function getRecentActivity() {
  return (await fetchBackendAdminOverview()).recentActivity;
}

export async function exportPlatformData() {
  const [overview, courses, phases, lessons, quizzes, students, scores, translations, auditLog, settings] = await Promise.all([
    fetchBackendAdminOverview(),
    getCourses(),
    getPhases(),
    getLessons(),
    getQuizzes(),
    getStudents(),
    getScores(),
    getTranslations(),
    getAuditLog(),
    getAdminSettings(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    overview,
    settings,
    courses,
    phases,
    lessons,
    quizzes,
    students,
    scores,
    translations,
    auditLog,
  };
}

export function exportCsv(filename, rows) {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const csvRows = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => {
      const value = row[header] ?? '';
      return `"${String(value).replaceAll('"', '""')}"`;
    }).join(',')),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
