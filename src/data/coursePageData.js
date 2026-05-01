/*
 * Mock course data for the Course page.
 * This structure is dynamic — each course can have a different
 * number of phases, and each phase can have different lesson counts.
 * Replace with API calls when the backend is connected.
 *
 * COURSE_VERSION — bump when phase names or structure change
 * so stale localStorage is auto-cleared.
 */

const COURSE_VERSION = 2;

export const courseData = {
  id: 1,
  slug: 'cybersecurity-fundamentals',
  title: 'Cybersecurity Fundamentals',
  description:
    'A structured beginner-friendly course designed to build strong cybersecurity foundations.',
  difficulty: 'Beginner',
  totalPhases: 8,
  totalLessons: 56,
  totalQuizzes: 8,
  hasFinalExam: true,
  progress: 0,
  badges: [
    'Beginner',
    'English Content',
    'Quiz Based Progress',
  ],
  phases: [
    {
      id: 1,
      title: 'Cybersecurity Introduction',
      lessonsCount: 7,
      completedLessons: 0,
      quizRequired: true,
      quizPassed: false,
      progress: 0,
      status: 'in-progress',
      locked: false,
    },
    {
      id: 2,
      title: 'Core Security Concepts',
      lessonsCount: 7,
      completedLessons: 0,
      quizRequired: true,
      quizPassed: false,
      progress: 0,
      status: 'locked',
      locked: true,
    },
    {
      id: 3,
      title: 'Computer & OS Basics',
      lessonsCount: 7,
      completedLessons: 0,
      quizRequired: true,
      quizPassed: false,
      progress: 0,
      status: 'locked',
      locked: true,
    },
    {
      id: 4,
      title: 'Networking Fundamentals',
      lessonsCount: 7,
      completedLessons: 0,
      quizRequired: true,
      quizPassed: false,
      progress: 0,
      status: 'locked',
      locked: true,
    },
    {
      id: 5,
      title: 'Web Fundamentals',
      lessonsCount: 7,
      completedLessons: 0,
      quizRequired: true,
      quizPassed: false,
      progress: 0,
      status: 'locked',
      locked: true,
    },
    {
      id: 6,
      title: 'Threats & Attacks',
      lessonsCount: 7,
      completedLessons: 0,
      quizRequired: true,
      quizPassed: false,
      progress: 0,
      status: 'locked',
      locked: true,
    },
    {
      id: 7,
      title: 'Web Security Basics',
      lessonsCount: 7,
      completedLessons: 0,
      quizRequired: true,
      quizPassed: false,
      progress: 0,
      status: 'locked',
      locked: true,
    },
    {
      id: 8,
      title: 'Security Awareness & Final Review',
      lessonsCount: 7,
      completedLessons: 0,
      quizRequired: true,
      quizPassed: false,
      progress: 0,
      status: 'locked',
      locked: true,
    },
  ],
};

export function getCourseData(slug) {
  const storedVersion = localStorage.getItem('course_data_version');

  // Clear stale cache when course structure changes
  if (!storedVersion || Number(storedVersion) < COURSE_VERSION) {
    localStorage.removeItem(`course_data_${slug}`);
    localStorage.setItem('course_data_version', String(COURSE_VERSION));
  }

  const localData = localStorage.getItem(`course_data_${slug}`);
  if (localData) {
    return JSON.parse(localData);
  }
  return courseData;
}

export function saveCourseData(slug, data) {
  localStorage.setItem(`course_data_${slug}`, JSON.stringify(data));
}

export const completionRules = [
  'Mark lessons as completed to track your progress',
  'Finish all lessons in a phase before taking the quiz',
  'Pass the phase quiz to unlock the next phase',
  'Complete all 8 phases to unlock the final exam',
];
