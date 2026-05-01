import { prisma } from '../../db/prisma.js';
import { loadFrontendLessonSeeds } from '../../data/frontendLessonSeed.js';

export class CourseRepository {
  async getAdminStats() {
    if (prisma) {
      const [totalCourses, totalPhases, totalLessons, totalQuizzes, totalStudents, scores] = await Promise.all([
        prisma.course.count(),
        prisma.phase.count(),
        prisma.lesson.count(),
        prisma.quizScore.groupBy({ by: ['quizSlug'] }).then((rows) => rows.length),
        prisma.studentProgress.groupBy({ by: ['studentId'] }).then((rows) => rows.length),
        prisma.quizScore.findMany({ select: { score: true } }),
      ]);

      const averageScore = scores.length
        ? Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length)
        : null;

      return { totalCourses, totalPhases, totalLessons, totalQuizzes, totalStudents, averageScore };
    }

    const seeds = await loadFrontendLessonSeeds();
    const phaseCount = new Set(seeds.map((lesson) => lesson.phaseOrder)).size;

    return {
      totalCourses: 1,
      totalPhases: phaseCount,
      totalLessons: seeds.length,
      totalQuizzes: phaseCount,
      totalStudents: 0,
      averageScore: null,
    };
  }
}
