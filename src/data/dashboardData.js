/*
 * Mock dashboard data for the student dashboard.
 * This file centralizes all demo data and will be replaced
 * with real API calls when the backend is connected.
 */

export const mockCourse = {
  id: 'cybersecurity-fundamentals',
  title: 'Cybersecurity Fundamentals',
  description:
    'Build a strong cybersecurity foundation through structured phases, lessons, quizzes, and progress tracking.',
  totalPhases: 8,
  totalLessons: 56,
  totalQuizzes: 8,
  difficulty: 'Beginner',
};

export const mockProgress = {
  overallProgress: 0,
  completedLessons: 0,
  totalLessons: 56,
  latestQuizScore: null,
  currentPhase: 1,
  currentPhaseTitle: 'Cybersecurity Introduction',
  currentPhaseLessons: 7,
  currentPhaseStatus: 'In Progress',
};

export const mockRecentActivity = [
  {
    id: 1,
    type: 'phase',
    text: 'Started Phase 1: Cybersecurity Introduction',
    time: 'Just now',
  },
  {
    id: 2,
    type: 'lesson',
    text: 'Started Lesson 1: What Is Cybersecurity?',
    time: 'Just now',
  },
];

export const mockQuickActions = [
  {
    id: 'continue',
    label: 'Continue Learning',
    description: 'Pick up where you left off',
    route: '/courses/cybersecurity-fundamentals',
    icon: 'play',
  },
  {
    id: 'course',
    label: 'View Course',
    description: 'Browse all phases & lessons',
    route: '/courses',
    icon: 'book',
  },
  {
    id: 'quiz',
    label: 'Take Quiz',
    description: 'Test your knowledge',
    route: '/quizzes',
    icon: 'clipboard',
  },
  {
    id: 'progress',
    label: 'View Progress',
    description: 'Track your learning stats',
    route: '/progress',
    icon: 'chart',
  },
];
