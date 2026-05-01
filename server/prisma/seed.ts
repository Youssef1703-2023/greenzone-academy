import { PrismaClient, type Prisma } from '@prisma/client';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { loadFrontendLessonSeeds, loadFrontendLessonTranslationSeeds } from '../src/data/frontendLessonSeed.js';

const prisma = new PrismaClient();

async function loadCourseData() {
  const moduleUrl = pathToFileURL(path.resolve(process.cwd(), '..', 'src', 'data', 'coursePageData.js')).href;
  const dataModule = (await import(moduleUrl)) as {
    courseData: {
      slug: string;
      title: string;
      description: string;
      difficulty: string;
      phases: Array<{ id: number; title: string; locked: boolean; quizRequired: boolean }>;
    };
  };
  return dataModule.courseData;
}

async function loadPhaseData() {
  const moduleUrl = pathToFileURL(path.resolve(process.cwd(), '..', 'src', 'data', 'phaseData.js')).href;
  const dataModule = (await import(moduleUrl)) as {
    defaultPhasesDetailData?: Record<string, { quiz?: { title?: string; passingScore?: number; questions?: Array<Record<string, unknown>> } }>;
  };
  return dataModule.defaultPhasesDetailData ?? {};
}

function questionPayload(question: Record<string, unknown>, index: number) {
  const options = Array.isArray(question.options) ? question.options : [];
  const correct = typeof question.correctAnswer === 'string'
    ? question.correctAnswer
    : typeof question.answer === 'string'
      ? question.answer
      : String(options[0] ?? '');

  return {
    order: index + 1,
    prompt: String(question.question ?? question.prompt ?? `Question ${index + 1}`),
    optionsJson: options as Prisma.InputJsonValue,
    correctAnswer: correct,
  };
}

async function main() {
  const courseData = await loadCourseData();
  const phaseData = await loadPhaseData();
  const lessonSeeds = await loadFrontendLessonSeeds();
  const translationSeeds = await loadFrontendLessonTranslationSeeds('ar');

  const course = await prisma.course.upsert({
    where: { slug: courseData.slug },
    update: {
      title: courseData.title,
      description: courseData.description,
      difficulty: courseData.difficulty,
      status: 'published',
    },
    create: {
      slug: courseData.slug,
      title: courseData.title,
      description: courseData.description,
      difficulty: courseData.difficulty,
      status: 'published',
    },
  });

  const phasesByOrder = new Map<number, { id: string; order: number }>();
  for (const phase of courseData.phases) {
    const saved = await prisma.phase.upsert({
      where: { courseId_order: { courseId: course.id, order: phase.id } },
      update: {
        title: phase.title,
        description: `Phase ${phase.id}: ${phase.title}`,
        status: phase.locked ? 'draft' : 'published',
      },
      create: {
        courseId: course.id,
        order: phase.id,
        title: phase.title,
        description: `Phase ${phase.id}: ${phase.title}`,
        status: phase.locked ? 'draft' : 'published',
      },
    });
    phasesByOrder.set(phase.id, saved);

    const detailQuiz = phaseData[String(phase.id)]?.quiz;
    const quizSlug = `phase-${phase.id}-quiz`;
    const quiz = await prisma.quiz.upsert({
      where: { slug: quizSlug },
      update: {
        title: detailQuiz?.title || `Phase ${phase.id} Quiz`,
        passingScore: detailQuiz?.passingScore || 70,
        status: phase.quizRequired ? 'published' : 'draft',
        phaseId: saved.id,
        courseId: course.id,
      },
      create: {
        courseId: course.id,
        phaseId: saved.id,
        slug: quizSlug,
        title: detailQuiz?.title || `Phase ${phase.id} Quiz`,
        passingScore: detailQuiz?.passingScore || 70,
        status: phase.quizRequired ? 'published' : 'draft',
      },
    });

    const questions = detailQuiz?.questions || [];
    if (questions.length) {
      for (let index = 0; index < questions.length; index += 1) {
        await prisma.quizQuestion.upsert({
          where: { quizId_order: { quizId: quiz.id, order: index + 1 } },
          update: questionPayload(questions[index], index),
          create: { quizId: quiz.id, ...questionPayload(questions[index], index) },
        });
      }
    }
  }

  const lessonsBySeedId = new Map<string, { id: string; contentHash: string }>();
  for (const lesson of lessonSeeds) {
    const phase = phasesByOrder.get(lesson.phaseOrder);
    if (!phase) continue;

    const saved = await prisma.lesson.upsert({
      where: { courseId_slug: { courseId: course.id, slug: lesson.slug } },
      update: {
        phaseId: phase.id,
        order: lesson.lessonOrder,
        title: lesson.title,
        contentJson: lesson.contentJson as Prisma.InputJsonValue,
        contentHash: lesson.contentHash,
        status: 'published',
      },
      create: {
        courseId: course.id,
        phaseId: phase.id,
        order: lesson.lessonOrder,
        slug: lesson.slug,
        title: lesson.title,
        languageSource: 'en',
        contentJson: lesson.contentJson as Prisma.InputJsonValue,
        contentHash: lesson.contentHash,
        status: 'published',
      },
    });
    lessonsBySeedId.set(lesson.id, { id: saved.id, contentHash: saved.contentHash });
  }

  for (const translation of translationSeeds) {
    const lesson = lessonsBySeedId.get(translation.lessonId);
    if (!lesson) continue;
    await prisma.lessonTranslation.upsert({
      where: { lessonId_targetLang: { lessonId: lesson.id, targetLang: translation.targetLang } },
      update: {
        translatedContentJson: translation.translatedContentJson as Prisma.InputJsonValue,
        sourceContentHash: lesson.contentHash,
        provider: translation.provider,
        providerModel: translation.providerModel,
        status: 'completed',
      },
      create: {
        lessonId: lesson.id,
        targetLang: translation.targetLang,
        translatedContentJson: translation.translatedContentJson as Prisma.InputJsonValue,
        sourceContentHash: lesson.contentHash,
        provider: translation.provider,
        providerModel: translation.providerModel,
        status: 'completed',
      },
    });
  }

  const users = [
    { name: 'Joe Tech', email: 'joetech.dev.systems@gmail.com', role: 'admin' as const, progressPercent: 0, completedLessonsCount: 0, completedPhasesCount: 0, lastActiveAt: new Date() },
    { name: 'Student', email: 'student@example.com', role: 'student' as const, progressPercent: 12, completedLessonsCount: 7, completedPhasesCount: 1, lastActiveAt: new Date('2026-04-29') },
    { name: 'Sarah Connor', email: 'sarah@example.com', role: 'student' as const, progressPercent: 45, completedLessonsCount: 25, completedPhasesCount: 3, lastActiveAt: new Date('2026-04-28') },
    { name: 'John Smith', email: 'john@example.com', role: 'student' as const, progressPercent: 100, completedLessonsCount: 56, completedPhasesCount: 8, lastActiveAt: new Date('2026-04-27') },
    { name: 'Alex Johnson', email: 'alex@example.com', role: 'student' as const, progressPercent: 0, completedLessonsCount: 0, completedPhasesCount: 0, status: 'disabled' as const, lastActiveAt: new Date('2026-04-22') },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  const scores = [
    { email: 'sarah@example.com', quizSlug: 'phase-1-quiz', score: 90, attempts: 1, createdAt: new Date('2026-04-20') },
    { email: 'student@example.com', quizSlug: 'phase-1-quiz', score: 80, attempts: 2, createdAt: new Date('2026-04-28') },
    { email: 'john@example.com', quizSlug: 'phase-8-quiz', score: 95, attempts: 1, createdAt: new Date('2026-04-25') },
    { email: 'alex@example.com', quizSlug: 'phase-1-quiz', score: 40, attempts: 1, createdAt: new Date('2026-04-21') },
  ];

  await prisma.quizScore.deleteMany({});
  for (const score of scores) {
    const student = await prisma.user.findUnique({ where: { email: score.email } });
    const quiz = await prisma.quiz.findUnique({ where: { slug: score.quizSlug } });
    if (!student) continue;
    await prisma.quizScore.create({
      data: {
        studentId: student.id,
        quizId: quiz?.id,
        quizSlug: score.quizSlug,
        score: score.score,
        attempts: score.attempts,
        createdAt: score.createdAt,
      },
    });
  }

  const settings = {
    platformName: 'Green Zone Academy',
    defaultLanguage: 'en',
    passingScore: 70,
    translationMode: 'Manual / Backend',
    dataSourceMode: 'Database',
  };

  await prisma.adminSetting.upsert({
    where: { key: 'platform' },
    update: { valueJson: settings },
    create: { key: 'platform', valueJson: settings },
  });

  await prisma.adminAuditLog.create({
    data: {
      action: 'Database seeded',
      entityType: 'System',
      entityName: 'Green Zone Academy',
      details: `Seeded ${lessonSeeds.length} lessons, ${translationSeeds.length} translations, ${users.length} users.`,
    },
  });

  console.log('Green Zone Academy database seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
