// @ts-nocheck -- Raw SQL keeps the admin API usable before local Prisma Client regeneration.
import { randomUUID } from 'node:crypto';
import { env, hasGoogleTranslateCredentials } from '../../config/env.js';
import { prisma } from '../../db/prisma.js';
import { HttpError } from '../../middleware/httpError.js';
import { hashContent } from '../../utils/hashContent.js';

const unavailable = null;

type ContentStatusValue = 'draft' | 'published' | 'archived';
type UserStatusValue = 'active' | 'disabled';

function db(): any {
  if (!prisma) {
    throw new HttpError(503, 'Admin backend database is not configured. Set DATABASE_URL and run Prisma migration/seed.');
  }

  return prisma as any;
}

async function rows<T = Record<string, unknown>>(sql: string, ...values: unknown[]): Promise<T[]> {
  return db().$queryRawUnsafe(sql, ...values);
}

async function row<T = Record<string, unknown>>(sql: string, ...values: unknown[]): Promise<T | null> {
  const result = await rows<T>(sql, ...values);
  return result[0] || null;
}

async function exec(sql: string, ...values: unknown[]) {
  return db().$executeRawUnsafe(sql, ...values);
}

function id() {
  return randomUUID();
}

function numberValue(value: unknown) {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function average(values: number[]) {
  const usable = values.filter((value) => Number.isFinite(value));
  if (!usable.length) return unavailable;
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length);
}

function toContentStatus(value: unknown): ContentStatusValue {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'published') return 'published';
  if (normalized === 'archived') return 'archived';
  return 'draft';
}

function fromContentStatus(value: unknown) {
  if (value === 'published') return 'Published';
  if (value === 'archived') return 'Archived';
  return 'Draft';
}

function toUserStatus(value: unknown): UserStatusValue {
  return String(value || '').toLowerCase() === 'disabled' ? 'disabled' : 'active';
}

function fromUserStatus(value: unknown) {
  return value === 'disabled' ? 'Disabled' : 'Active';
}

function lessonSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function iso(value?: Date | string | null) {
  return value ? new Date(value).toISOString() : null;
}

function dateOnly(value?: Date | string | null) {
  const asIso = iso(value);
  return asIso ? asIso.slice(0, 10) : null;
}

function settingsDefaults() {
  return {
    platformName: 'Green Zone Academy',
    defaultLanguage: 'en',
    passingScore: 70,
    translationMode: 'Manual / Backend',
    dataSourceMode: 'Database',
  };
}

async function audit(action: string, entityType: string, entityName: string, details = '', entityId?: string) {
  await exec(
    'INSERT INTO "AdminAuditLog" ("id", "action", "entityType", "entityId", "entityName", "actor", "details", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
    id(),
    action,
    entityType,
    entityId || null,
    entityName,
    'Admin',
    details || null,
  );
}

function normalizeCourse(course: any) {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    status: fromContentStatus(course.status),
    phasesCount: numberValue(course.phasesCount),
    lessonsCount: numberValue(course.lessonsCount),
    quizzesCount: numberValue(course.quizzesCount),
    updatedAt: iso(course.updatedAt),
  };
}

function normalizePhase(phase: any) {
  return {
    id: phase.id,
    courseId: phase.courseId,
    courseTitle: phase.courseTitle,
    order: numberValue(phase.order),
    title: phase.title,
    description: phase.description,
    status: fromContentStatus(phase.status),
    lessonsCount: numberValue(phase.lessonsCount),
    quizAttached: numberValue(phase.quizzesCount) > 0,
    previewStatus: phase.status === 'published' ? 'Unlocked' : 'Locked',
    updatedAt: iso(phase.updatedAt),
  };
}

function normalizeLesson(lesson: any) {
  const translationStatus = lesson.translationStatus;
  const hashStatus = lesson.translationId
    ? lesson.sourceContentHash === lesson.contentHash
      ? 'Fresh'
      : 'Stale'
    : 'N/A';

  return {
    id: lesson.id,
    courseId: lesson.courseId,
    courseTitle: lesson.courseTitle,
    phaseId: numberValue(lesson.phaseOrder),
    phaseRecordId: lesson.phaseId,
    phaseTitle: lesson.phaseTitle,
    order: numberValue(lesson.order),
    slug: lesson.slug,
    title: lesson.title,
    status: fromContentStatus(lesson.status),
    route: `/courses/${lesson.courseSlug}/phase/${lesson.phaseOrder}/lesson/${lesson.order}`,
    englishStatus: lesson.contentJson ? 'Ready' : 'Missing',
    arabicStatus: translationStatus === 'completed' ? 'Ready' : translationStatus === 'stale' ? 'Stale' : 'Missing',
    translationSource: lesson.translationId ? (lesson.provider === 'curated' ? 'Manual' : lesson.provider) : 'Missing',
    hashStatus,
    readingTime: '12-15 min',
    completionCount: numberValue(lesson.completionCount) || null,
    updatedAt: iso(lesson.updatedAt),
  };
}

function normalizeQuiz(quiz: any) {
  const averageScore = quiz.averageScore === null || quiz.averageScore === undefined ? unavailable : Math.round(Number(quiz.averageScore));
  const attempts = numberValue(quiz.attempts);
  const scoredAttempts = numberValue(quiz.scoredAttempts);
  const passedAttempts = numberValue(quiz.passedAttempts);

  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    phaseId: numberValue(quiz.phaseOrder),
    phaseRecordId: quiz.phaseId,
    phaseTitle: quiz.phaseTitle,
    questionsCount: numberValue(quiz.questionsCount),
    passingScore: numberValue(quiz.passingScore),
    attempts,
    averageScore,
    passRate: scoredAttempts ? Math.round((passedAttempts / scoredAttempts) * 100) : unavailable,
    status: fromContentStatus(quiz.status),
  };
}

function normalizeStudent(student: any) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    role: student.role,
    status: fromUserStatus(student.status),
    progress: numberValue(student.progressPercent),
    completedLessons: numberValue(student.completedLessonsCount),
    completedPhases: numberValue(student.completedPhasesCount),
    joinedAt: dateOnly(student.joinedAt),
    lastActive: dateOnly(student.lastActiveAt),
    averageScore: student.averageScore === null || student.averageScore === undefined ? unavailable : Math.round(Number(student.averageScore)),
    quizAttempts: numberValue(student.quizAttempts),
  };
}

export class AdminService {
  async getOverview() {
    const [content, students, progress, quizzes, contentHealth, recentActivity] = await Promise.all([
      this.getContentStats(),
      this.getStudentStats(),
      this.getProgressStats(),
      this.getQuizStats(),
      this.getContentHealth(),
      this.getRecentActivity(),
    ]);

    return {
      content,
      students,
      progress,
      quizzes,
      contentHealth,
      recentActivity,
      health: this.getHealth(),
    };
  }

  getHealth() {
    return {
      authStatus: 'Local Auth / Database Admin Data',
      dataSource: prisma ? 'Database' : 'Unavailable',
      translationMode: env.TRANSLATION_PROVIDER === 'google' ? 'Google API' : 'Manual / Backend',
      googleTranslateConfigured: hasGoogleTranslateCredentials,
      databaseConnected: Boolean(prisma),
      lastRefreshTime: new Date().toISOString(),
    };
  }

  async getContentStats() {
    const stats = await row<any>(`
      SELECT
        (SELECT COUNT(*)::int FROM "Course") AS "totalCourses",
        (SELECT COUNT(*)::int FROM "Phase") AS "totalPhases",
        (SELECT COUNT(*)::int FROM "Lesson") AS "totalLessons",
        (SELECT COUNT(*)::int FROM "Quiz") AS "totalQuizzes",
        (SELECT COUNT(*)::int FROM "Course" WHERE "status" = 'published') AS "publishedCourses",
        (SELECT COUNT(*)::int FROM "Course" WHERE "status" = 'draft') AS "draftCourses",
        (SELECT COUNT(*)::int FROM "Lesson" WHERE "status" = 'published') AS "publishedLessons",
        (SELECT COUNT(*)::int FROM "Lesson" WHERE "status" = 'draft') AS "draftLessons"
    `);

    return {
      totalCourses: numberValue(stats?.totalCourses),
      totalPhases: numberValue(stats?.totalPhases),
      totalLessons: numberValue(stats?.totalLessons),
      totalQuizzes: numberValue(stats?.totalQuizzes),
      publishedCourses: numberValue(stats?.publishedCourses),
      draftCourses: numberValue(stats?.draftCourses),
      publishedLessons: numberValue(stats?.publishedLessons),
      draftLessons: numberValue(stats?.draftLessons),
    };
  }

  async getStudentStats() {
    const stats = await row<any>(`
      SELECT
        COUNT(*)::int AS "totalStudents",
        COUNT(*) FILTER (WHERE "status" = 'active')::int AS "activeStudents",
        COUNT(*) FILTER (WHERE "status" = 'disabled')::int AS "disabledStudents",
        COUNT(*) FILTER (WHERE "joinedAt" >= NOW() - INTERVAL '7 days')::int AS "newStudentsThisWeek"
      FROM "User"
      WHERE "role" = 'student'
    `);

    return {
      totalStudents: numberValue(stats?.totalStudents),
      activeStudents: numberValue(stats?.activeStudents),
      disabledStudents: numberValue(stats?.disabledStudents),
      newStudentsThisWeek: numberValue(stats?.newStudentsThisWeek),
    };
  }

  async getProgressStats() {
    const stats = await row<any>(`
      SELECT
        AVG("progressPercent") AS "averageCourseProgress",
        AVG("completedLessonsCount") AS "averageLessonsCompleted",
        COUNT(*) FILTER (WHERE "completedPhasesCount" >= 1)::int AS "studentsCompletedPhase1",
        COUNT(*) FILTER (WHERE "progressPercent" > 0 AND "progressPercent" < 100)::int AS "studentsInProgress",
        COUNT(*) FILTER (WHERE "progressPercent" = 0)::int AS "studentsNotStarted"
      FROM "User"
      WHERE "role" = 'student'
    `);

    return {
      averageCourseProgress: stats?.averageCourseProgress === null ? unavailable : Math.round(Number(stats?.averageCourseProgress || 0)),
      averageLessonsCompleted: stats?.averageLessonsCompleted === null ? unavailable : Math.round(Number(stats?.averageLessonsCompleted || 0)),
      studentsCompletedPhase1: numberValue(stats?.studentsCompletedPhase1),
      studentsInProgress: numberValue(stats?.studentsInProgress),
      studentsNotStarted: numberValue(stats?.studentsNotStarted),
    };
  }

  async getQuizStats() {
    const stats = await row<any>(`
      SELECT
        COUNT(*)::int AS "totalAttempts",
        COUNT(*) FILTER (WHERE "score" >= COALESCE(q."passingScore", 70))::int AS "passedAttempts",
        COUNT(*) FILTER (WHERE "score" < COALESCE(q."passingScore", 70))::int AS "failedAttempts",
        AVG(s."score") AS "averageScore",
        MAX(s."score") AS "highestScore",
        MIN(s."score") AS "lowestScore"
      FROM "QuizScore" s
      LEFT JOIN "Quiz" q ON q."id" = s."quizId"
    `);
    const totalAttempts = numberValue(stats?.totalAttempts);
    const passedAttempts = numberValue(stats?.passedAttempts);

    return {
      totalAttempts,
      passedAttempts,
      failedAttempts: numberValue(stats?.failedAttempts),
      averageScore: stats?.averageScore === null ? unavailable : Math.round(Number(stats?.averageScore || 0)),
      highestScore: stats?.highestScore === null ? unavailable : numberValue(stats?.highestScore),
      lowestScore: stats?.lowestScore === null ? unavailable : numberValue(stats?.lowestScore),
      passRate: totalAttempts ? Math.round((passedAttempts / totalAttempts) * 100) : unavailable,
    };
  }

  async listCourses() {
    const result = await rows<any>(`
      SELECT
        c.*,
        COUNT(DISTINCT p."id")::int AS "phasesCount",
        COUNT(DISTINCT l."id")::int AS "lessonsCount",
        COUNT(DISTINCT q."id")::int AS "quizzesCount"
      FROM "Course" c
      LEFT JOIN "Phase" p ON p."courseId" = c."id"
      LEFT JOIN "Lesson" l ON l."courseId" = c."id"
      LEFT JOIN "Quiz" q ON q."courseId" = c."id"
      GROUP BY c."id"
      ORDER BY c."createdAt" ASC
    `);

    return result.map(normalizeCourse);
  }

  async saveCourse(payload: Record<string, unknown>, courseId?: string) {
    const title = String(payload.title || '').trim();
    if (!title) throw new HttpError(400, 'Course title is required.');

    const data = {
      slug: String(payload.slug || lessonSlug(title)),
      title,
      description: String(payload.description || ''),
      difficulty: String(payload.difficulty || 'Beginner'),
      status: toContentStatus(payload.status),
    };

    const saved = courseId
      ? await row<any>(
          'UPDATE "Course" SET "slug" = $1, "title" = $2, "description" = $3, "difficulty" = $4, "status" = $5::"ContentStatus", "updatedAt" = NOW() WHERE "id" = $6 RETURNING *',
          data.slug,
          data.title,
          data.description,
          data.difficulty,
          data.status,
          courseId,
        )
      : await row<any>(
          'INSERT INTO "Course" ("id", "slug", "title", "description", "difficulty", "status", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6::"ContentStatus", NOW(), NOW()) RETURNING *',
          id(),
          data.slug,
          data.title,
          data.description,
          data.difficulty,
          data.status,
        );

    if (!saved) throw new HttpError(404, 'Course not found.');
    await audit(courseId ? 'Course edited' : 'Course created', 'Course', saved.title, '', saved.id);
    return this.getCourse(saved.id);
  }

  async getCourse(courseId: string) {
    return (await this.listCourses()).find((course) => course.id === courseId) || null;
  }

  async deleteCourse(courseId: string) {
    const deleted = await row<any>('DELETE FROM "Course" WHERE "id" = $1 RETURNING *', courseId);
    if (!deleted) throw new HttpError(404, 'Course not found.');
    await audit('Course deleted', 'Course', deleted.title, '', deleted.id);
    return { ok: true };
  }

  async listPhases() {
    const result = await rows<any>(`
      SELECT
        p.*,
        c."title" AS "courseTitle",
        COUNT(DISTINCT l."id")::int AS "lessonsCount",
        COUNT(DISTINCT q."id")::int AS "quizzesCount"
      FROM "Phase" p
      JOIN "Course" c ON c."id" = p."courseId"
      LEFT JOIN "Lesson" l ON l."phaseId" = p."id"
      LEFT JOIN "Quiz" q ON q."phaseId" = p."id"
      GROUP BY p."id", c."title"
      ORDER BY c."title" ASC, p."order" ASC
    `);

    return result.map(normalizePhase);
  }

  async savePhase(payload: Record<string, unknown>, phaseId?: string) {
    const title = String(payload.title || '').trim();
    if (!title) throw new HttpError(400, 'Phase title is required.');
    const courseId = String(payload.courseId || '');
    if (!courseId) throw new HttpError(400, 'Course is required.');

    const order = Number(payload.order || 1);
    const description = String(payload.description || `Phase ${order}: ${title}`);
    const status = toContentStatus(payload.status);

    const saved = phaseId
      ? await row<any>(
          'UPDATE "Phase" SET "courseId" = $1, "order" = $2, "title" = $3, "description" = $4, "status" = $5::"ContentStatus", "updatedAt" = NOW() WHERE "id" = $6 RETURNING *',
          courseId,
          order,
          title,
          description,
          status,
          phaseId,
        )
      : await row<any>(
          'INSERT INTO "Phase" ("id", "courseId", "order", "title", "description", "status", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6::"ContentStatus", NOW(), NOW()) RETURNING *',
          id(),
          courseId,
          order,
          title,
          description,
          status,
        );

    if (!saved) throw new HttpError(404, 'Phase not found.');
    await audit(phaseId ? 'Phase edited' : 'Phase created', 'Phase', saved.title, '', saved.id);
    return (await this.listPhases()).find((phase) => phase.id === saved.id) || null;
  }

  async deletePhase(phaseId: string) {
    const deleted = await row<any>('DELETE FROM "Phase" WHERE "id" = $1 RETURNING *', phaseId);
    if (!deleted) throw new HttpError(404, 'Phase not found.');
    await audit('Phase deleted', 'Phase', deleted.title, '', deleted.id);
    return { ok: true };
  }

  async listLessons() {
    const result = await rows<any>(`
      SELECT
        l.*,
        c."title" AS "courseTitle",
        c."slug" AS "courseSlug",
        p."title" AS "phaseTitle",
        p."order" AS "phaseOrder",
        lt."id" AS "translationId",
        lt."status" AS "translationStatus",
        lt."provider",
        lt."sourceContentHash",
        lt."updatedAt" AS "translationUpdatedAt",
        lt."reviewedAt",
        (SELECT COUNT(*)::int FROM "StudentProgress" sp WHERE sp."lessonId" = l."id") AS "completionCount"
      FROM "Lesson" l
      JOIN "Course" c ON c."id" = l."courseId"
      JOIN "Phase" p ON p."id" = l."phaseId"
      LEFT JOIN "LessonTranslation" lt ON lt."lessonId" = l."id" AND lt."targetLang" = 'ar'
      ORDER BY p."order" ASC, l."order" ASC
    `);

    return result.map(normalizeLesson);
  }

  async saveLesson(payload: Record<string, unknown>, lessonId?: string) {
    const title = String(payload.title || '').trim();
    if (!title) throw new HttpError(400, 'Lesson title is required.');

    const contentJson = typeof payload.contentJson === 'object' && payload.contentJson !== null ? payload.contentJson : { title, sections: [] };
    const courseId = String(payload.courseId || '');
    const phaseId = String(payload.phaseRecordId || payload.phaseId || '');
    if (!courseId || !phaseId) throw new HttpError(400, 'Course and phase are required.');

    const order = Number(payload.order || 1);
    const slug = String(payload.slug || lessonSlug(title));
    const contentHash = hashContent(contentJson);
    const status = toContentStatus(payload.status);

    const saved = lessonId
      ? await row<any>(
          'UPDATE "Lesson" SET "courseId" = $1, "phaseId" = $2, "order" = $3, "slug" = $4, "title" = $5, "contentJson" = $6::jsonb, "contentHash" = $7, "status" = $8::"ContentStatus", "updatedAt" = NOW() WHERE "id" = $9 RETURNING *',
          courseId,
          phaseId,
          order,
          slug,
          title,
          JSON.stringify(contentJson),
          contentHash,
          status,
          lessonId,
        )
      : await row<any>(
          'INSERT INTO "Lesson" ("id", "courseId", "phaseId", "order", "slug", "title", "languageSource", "contentJson", "contentHash", "status", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::"ContentStatus", NOW(), NOW()) RETURNING *',
          id(),
          courseId,
          phaseId,
          order,
          slug,
          title,
          'en',
          JSON.stringify(contentJson),
          contentHash,
          status,
        );

    if (!saved) throw new HttpError(404, 'Lesson not found.');
    await audit(lessonId ? 'Lesson edited' : 'Lesson created', 'Lesson', saved.title, '', saved.id);
    return (await this.listLessons()).find((lesson) => lesson.id === saved.id) || null;
  }

  async deleteLesson(lessonId: string) {
    const deleted = await row<any>('DELETE FROM "Lesson" WHERE "id" = $1 RETURNING *', lessonId);
    if (!deleted) throw new HttpError(404, 'Lesson not found.');
    await audit('Lesson deleted', 'Lesson', deleted.title, '', deleted.id);
    return { ok: true };
  }

  async listQuizzes() {
    const result = await rows<any>(`
      SELECT
        q.*,
        p."title" AS "phaseTitle",
        p."order" AS "phaseOrder",
        COUNT(DISTINCT qq."id")::int AS "questionsCount",
        COALESCE(SUM(qs."attempts"), 0)::int AS "attempts",
        COUNT(qs."id")::int AS "scoredAttempts",
        COUNT(qs."id") FILTER (WHERE qs."score" >= q."passingScore")::int AS "passedAttempts",
        AVG(qs."score") AS "averageScore"
      FROM "Quiz" q
      JOIN "Phase" p ON p."id" = q."phaseId"
      LEFT JOIN "QuizQuestion" qq ON qq."quizId" = q."id"
      LEFT JOIN "QuizScore" qs ON qs."quizId" = q."id"
      GROUP BY q."id", p."title", p."order"
      ORDER BY p."order" ASC, q."createdAt" ASC
    `);

    return result.map(normalizeQuiz);
  }

  async saveQuiz(payload: Record<string, unknown>, quizId?: string) {
    const title = String(payload.title || '').trim();
    if (!title) throw new HttpError(400, 'Quiz title is required.');
    const phaseId = String(payload.phaseRecordId || payload.phaseId || '');
    const phase = await row<any>('SELECT * FROM "Phase" WHERE "id" = $1', phaseId);
    if (!phase) throw new HttpError(400, 'Valid phase is required.');

    const slug = String(payload.slug || lessonSlug(title));
    const passingScore = Number(payload.passingScore || 70);
    const status = toContentStatus(payload.status);

    const saved = quizId
      ? await row<any>(
          'UPDATE "Quiz" SET "courseId" = $1, "phaseId" = $2, "slug" = $3, "title" = $4, "passingScore" = $5, "status" = $6::"ContentStatus", "updatedAt" = NOW() WHERE "id" = $7 RETURNING *',
          phase.courseId,
          phase.id,
          slug,
          title,
          passingScore,
          status,
          quizId,
        )
      : await row<any>(
          'INSERT INTO "Quiz" ("id", "courseId", "phaseId", "slug", "title", "passingScore", "status", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7::"ContentStatus", NOW(), NOW()) RETURNING *',
          id(),
          phase.courseId,
          phase.id,
          slug,
          title,
          passingScore,
          status,
        );

    if (!saved) throw new HttpError(404, 'Quiz not found.');
    await audit(quizId ? 'Quiz edited' : 'Quiz created', 'Quiz', saved.title, '', saved.id);
    return (await this.listQuizzes()).find((quiz) => quiz.id === saved.id) || null;
  }

  async deleteQuiz(quizId: string) {
    const deleted = await row<any>('DELETE FROM "Quiz" WHERE "id" = $1 RETURNING *', quizId);
    if (!deleted) throw new HttpError(404, 'Quiz not found.');
    await audit('Quiz deleted', 'Quiz', deleted.title, '', deleted.id);
    return { ok: true };
  }

  async listStudents() {
    const result = await rows<any>(`
      SELECT
        u.*,
        COUNT(qs."id")::int AS "quizAttempts",
        AVG(qs."score") AS "averageScore"
      FROM "User" u
      LEFT JOIN "QuizScore" qs ON qs."studentId" = u."id"
      WHERE u."role" = 'student'
      GROUP BY u."id"
      ORDER BY u."joinedAt" ASC
    `);

    return result.map(normalizeStudent);
  }

  async saveStudent(payload: Record<string, unknown>, studentId?: string) {
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    if (!name || !email) throw new HttpError(400, 'Student name and email are required.');

    const status = toUserStatus(payload.status);
    const progress = Number(payload.progress || 0);
    const completedLessons = Number(payload.completedLessons || 0);
    const completedPhases = Number(payload.completedPhases || 0);
    const lastActive = payload.lastActive ? new Date(String(payload.lastActive)) : null;

    const saved = studentId
      ? await row<any>(
          'UPDATE "User" SET "name" = $1, "email" = $2, "status" = $3::"UserStatus", "progressPercent" = $4, "completedLessonsCount" = $5, "completedPhasesCount" = $6, "lastActiveAt" = $7, "updatedAt" = NOW() WHERE "id" = $8 AND "role" = $9::"UserRole" RETURNING *',
          name,
          email,
          status,
          progress,
          completedLessons,
          completedPhases,
          lastActive,
          studentId,
          'student',
        )
      : await row<any>(
          'INSERT INTO "User" ("id", "name", "email", "role", "status", "progressPercent", "completedLessonsCount", "completedPhasesCount", "joinedAt", "lastActiveAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4::"UserRole", $5::"UserStatus", $6, $7, $8, NOW(), $9, NOW(), NOW()) RETURNING *',
          id(),
          name,
          email,
          'student',
          status,
          progress,
          completedLessons,
          completedPhases,
          lastActive,
        );

    if (!saved) throw new HttpError(404, 'Student not found.');
    await audit(studentId ? 'Student edited' : 'Student created', 'Student', saved.name, '', saved.id);
    return (await this.listStudents()).find((student) => student.id === saved.id) || null;
  }

  async setStudentStatus(studentId: string, status: unknown) {
    const nextStatus = toUserStatus(status);
    const saved = await row<any>(
      'UPDATE "User" SET "status" = $1::"UserStatus", "updatedAt" = NOW() WHERE "id" = $2 AND "role" = $3::"UserRole" RETURNING *',
      nextStatus,
      studentId,
      'student',
    );
    if (!saved) throw new HttpError(404, 'Student not found.');
    await audit(saved.status === 'disabled' ? 'Student disabled' : 'Student enabled', 'Student', saved.name, '', saved.id);
    return (await this.listStudents()).find((student) => student.id === saved.id) || null;
  }

  async resetStudentProgress(studentId: string) {
    const student = await row<any>(
      'UPDATE "User" SET "progressPercent" = 0, "completedLessonsCount" = 0, "completedPhasesCount" = 0, "updatedAt" = NOW() WHERE "id" = $1 AND "role" = $2::"UserRole" RETURNING *',
      studentId,
      'student',
    );
    if (!student) throw new HttpError(404, 'Student not found.');

    await exec('DELETE FROM "StudentProgress" WHERE "studentId" = $1', student.id);
    await exec('DELETE FROM "QuizScore" WHERE "studentId" = $1', student.id);
    await audit('Progress reset', 'Student', student.name, 'Deleted progress and quiz score rows for this student.', student.id);
    return (await this.listStudents()).find((entry) => entry.id === student.id) || null;
  }

  async listScores() {
    const result = await rows<any>(`
      SELECT
        s.*,
        u."name" AS "studentName",
        q."title" AS "quizTitle",
        q."passingScore" AS "passingScore"
      FROM "QuizScore" s
      JOIN "User" u ON u."id" = s."studentId"
      LEFT JOIN "Quiz" q ON q."id" = s."quizId"
      ORDER BY s."createdAt" DESC
    `);

    return result.map((score) => ({
      id: score.id,
      studentName: score.studentName,
      studentId: score.studentId,
      quizName: score.quizTitle || score.quizSlug,
      quizSlug: score.quizSlug,
      score: numberValue(score.score),
      attempts: numberValue(score.attempts),
      status: numberValue(score.score) >= numberValue(score.passingScore || 70) ? 'Passed' : 'Failed',
      date: dateOnly(score.createdAt),
    }));
  }

  async listTranslations() {
    const lessons = await this.listLessons();
    const translations = await rows<any>(`
      SELECT lt.*, l."title" AS "lessonTitle"
      FROM "LessonTranslation" lt
      JOIN "Lesson" l ON l."id" = lt."lessonId"
      WHERE lt."targetLang" = 'ar'
    `);
    const byLesson = new Map(translations.map((translation) => [translation.lessonId, translation]));

    return lessons.map((lesson) => {
      const translation = byLesson.get(lesson.id);
      return {
        id: translation?.id || `lesson:${lesson.id}:ar`,
        lessonId: lesson.id,
        course: lesson.courseTitle,
        phase: `Phase ${lesson.phaseId}`,
        lesson: lesson.title,
        route: lesson.route,
        englishStatus: lesson.englishStatus,
        arabicStatus: lesson.arabicStatus,
        translationSource: lesson.translationSource,
        lastUpdated: iso(translation?.updatedAt) || lesson.updatedAt,
        hashStatus: lesson.hashStatus,
        reviewed: Boolean(translation?.reviewedAt),
      };
    });
  }

  async markTranslationReviewed(translationId: string) {
    if (translationId.startsWith('lesson:')) {
      throw new HttpError(404, 'Arabic translation row does not exist yet.');
    }

    const translation = await row<any>(
      `UPDATE "LessonTranslation" lt
       SET "reviewedAt" = NOW(), "reviewedBy" = $1, "updatedAt" = NOW()
       FROM "Lesson" l
       WHERE lt."id" = $2 AND l."id" = lt."lessonId"
       RETURNING lt.*, l."title" AS "lessonTitle"`,
      'Admin',
      translationId,
    );
    if (!translation) throw new HttpError(404, 'Translation not found.');
    await audit('Translation reviewed', 'Translation', translation.lessonTitle, '', translation.id);
    return (await this.listTranslations()).find((entry) => entry.id === translation.id) || null;
  }

  async getContentHealth() {
    const lessons = await this.listLessons();
    return {
      lessonsWithEnglishContent: lessons.filter((lesson) => lesson.englishStatus === 'Ready').length,
      lessonsMissingEnglishContent: lessons.filter((lesson) => lesson.englishStatus === 'Missing').length,
      lessonsWithArabicTranslation: lessons.filter((lesson) => lesson.arabicStatus === 'Ready').length,
      lessonsMissingArabicTranslation: lessons.filter((lesson) => lesson.arabicStatus === 'Missing').length,
      lessonsWithStaleTranslation: lessons.filter((lesson) => lesson.hashStatus === 'Stale').length,
      draftLessons: lessons.filter((lesson) => lesson.status === 'Draft').length,
    };
  }

  async getRecentActivity() {
    const auditRows = await this.getAuditLog(8);
    return auditRows.map((event) => ({
      id: event.id,
      label: `${event.action}: ${event.entityName}`,
      type: event.entityType,
      createdAt: event.createdAt,
    }));
  }

  async getAuditLog(limit = 200) {
    const result = await rows<any>(
      'SELECT * FROM "AdminAuditLog" ORDER BY "createdAt" DESC LIMIT $1',
      Math.max(1, Math.min(Number(limit) || 200, 500)),
    );

    return result.map((event) => ({
      id: event.id,
      action: event.action,
      entityType: event.entityType,
      entityName: event.entityName,
      actor: event.actor,
      details: event.details,
      createdAt: iso(event.createdAt),
    }));
  }

  async getSettings() {
    const setting = await row<any>('SELECT * FROM "AdminSetting" WHERE "key" = $1', 'platform');
    return {
      ...settingsDefaults(),
      ...(typeof setting?.valueJson === 'object' && setting.valueJson ? setting.valueJson : {}),
    };
  }

  async saveSettings(settings: Record<string, unknown>) {
    const next = {
      ...settingsDefaults(),
      ...settings,
      passingScore: Number(settings.passingScore || 70),
      dataSourceMode: 'Database',
    };

    await exec(
      `INSERT INTO "AdminSetting" ("key", "valueJson", "updatedAt")
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT ("key") DO UPDATE SET "valueJson" = EXCLUDED."valueJson", "updatedAt" = NOW()`,
      'platform',
      JSON.stringify(next),
    );
    await audit('Settings updated', 'Settings', 'Admin Settings', 'Updated platform settings in PostgreSQL.');
    return next;
  }
}
