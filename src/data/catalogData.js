/*
 * Mock courses catalog data.
 * Supports multiple courses — currently only one demo course.
 * Each course has a slug for URL routing.
 */

export const courseCatalog = [
  {
    id: 1,
    slug: 'cybersecurity-fundamentals',
    title: 'Cybersecurity Fundamentals',
    description:
      'Build a strong cybersecurity foundation through structured phases, lessons, quizzes, and progress tracking.',
    difficulty: 'Beginner',
    totalPhases: 8,
    totalLessons: 56,
    totalQuizzes: 8,
    hasFinalExam: true,
    progress: 0,
    status: 'in-progress',
    enrolled: true,
  },
];
