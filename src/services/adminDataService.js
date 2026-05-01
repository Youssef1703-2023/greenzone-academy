import { requireSupabase } from './supabaseClient';

export const ADMIN_BACKEND_UNAVAILABLE = 'Supabase admin backend is unavailable.';

const unavailable = null;

function fromStatus(status) {
  if (status === 'published') return 'Published';
  if (status === 'archived') return 'Archived';
  if (status === 'disabled') return 'Disabled';
  if (status === 'active') return 'Active';
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

function dateOnly(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function average(values) {
  const usable = values.map(Number).filter(Number.isFinite);
  if (!usable.length) return unavailable;
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
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
      status: fromStatus(lesson.status),
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
    .select('*, phases(id,title,phase_number), quiz_questions(id), quiz_attempts(score,passed)')
    .order('created_at'));

  return quizzes.map((quiz) => {
    const scores = quiz.quiz_attempts?.map((attempt) => attempt.score) || [];
    const passed = quiz.quiz_attempts?.filter((attempt) => attempt.passed).length || 0;
    return {
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      phaseId: quiz.phases?.phase_number,
      phaseRecordId: quiz.phase_id,
      phaseTitle: quiz.phases?.title,
      questionsCount: quiz.quiz_questions?.length || 0,
      passingScore: quiz.passing_score,
      attempts: quiz.quiz_attempts?.length || 0,
      averageScore: average(scores),
      passRate: quiz.quiz_attempts?.length ? Math.round((passed / quiz.quiz_attempts.length) * 100) : unavailable,
      status: fromStatus(quiz.status),
    };
  });
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
  const [profiles, progress, attempts] = await Promise.all([
    safeQuery(client.from('profiles').select('*').eq('role', 'student').order('created_at')),
    safeQuery(client.from('student_progress').select('user_id,status')),
    safeQuery(client.from('quiz_attempts').select('user_id,score')),
  ]);

  return profiles.map((profile) => {
    const studentProgress = progress.filter((item) => item.user_id === profile.id && item.status === 'completed');
    const studentAttempts = attempts.filter((item) => item.user_id === profile.id);
    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      role: profile.role,
      status: fromStatus(profile.status),
      progress: unavailable,
      completedLessons: studentProgress.length,
      completedPhases: unavailable,
      joinedAt: dateOnly(profile.created_at),
      lastActive: dateOnly(profile.last_active_at),
      averageScore: average(studentAttempts.map((attempt) => attempt.score)),
      quizAttempts: studentAttempts.length,
    };
  });
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
  const [courses, phases, lessons, quizzes, students, scores, translations, auditLog] = await Promise.all([
    getCourses(),
    getPhases(),
    getLessons(),
    getQuizzes(),
    getStudents(),
    getScores(),
    getTranslations(),
    getAuditLog(),
  ]);

  const scoreValues = scores.map((score) => Number(score.score)).filter(Number.isFinite);
  const passedAttempts = scores.filter((score) => score.status === 'Passed').length;
  const completedLessons = students.map((student) => Number(student.completedLessons)).filter(Number.isFinite);

  return {
    content: {
      totalCourses: courses.length,
      totalPhases: phases.length,
      totalLessons: lessons.length,
      totalQuizzes: quizzes.length,
      publishedCourses: courses.filter((course) => course.status === 'Published').length,
      draftCourses: courses.filter((course) => course.status === 'Draft').length,
      publishedLessons: lessons.filter((lesson) => lesson.status === 'Published').length,
      draftLessons: lessons.filter((lesson) => lesson.status === 'Draft').length,
    },
    students: {
      totalStudents: students.length,
      activeStudents: students.filter((student) => student.status === 'Active').length,
      disabledStudents: students.filter((student) => student.status === 'Disabled').length,
      newStudentsThisWeek: unavailable,
    },
    progress: {
      averageCourseProgress: unavailable,
      averageLessonsCompleted: average(completedLessons),
      studentsCompletedPhase1: unavailable,
      studentsInProgress: unavailable,
      studentsNotStarted: unavailable,
    },
    quizzes: {
      totalAttempts: scores.length,
      passedAttempts,
      failedAttempts: scores.length - passedAttempts,
      averageScore: average(scoreValues),
      highestScore: scoreValues.length ? Math.max(...scoreValues) : unavailable,
      lowestScore: scoreValues.length ? Math.min(...scoreValues) : unavailable,
      passRate: scores.length ? Math.round((passedAttempts / scores.length) * 100) : unavailable,
    },
    contentHealth: {
      lessonsWithEnglishContent: lessons.filter((lesson) => lesson.englishStatus === 'Ready').length,
      lessonsMissingEnglishContent: lessons.filter((lesson) => lesson.englishStatus === 'Missing').length,
      lessonsWithArabicTranslation: translations.filter((translation) => translation.arabicStatus === 'Ready').length,
      lessonsMissingArabicTranslation: translations.filter((translation) => translation.arabicStatus === 'Missing').length,
      lessonsWithStaleTranslation: translations.filter((translation) => translation.hashStatus === 'Stale').length,
      draftLessons: lessons.filter((lesson) => lesson.status === 'Draft').length,
    },
    recentActivity: auditLog.slice(0, 8).map((event) => ({
      id: event.id,
      label: `${event.action}: ${event.entityName}`,
      type: event.entityType,
      createdAt: event.createdAt,
    })),
    health: {
      authStatus: 'Supabase Auth',
      dataSource: 'Supabase',
      translationMode: 'Manual / Supabase',
      googleTranslateConfigured: false,
      databaseConnected: true,
      lastRefreshTime: new Date().toISOString(),
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
