/*
 * Mock phase data for Phase Details page.
 * Each phase contains its own lessons array.
 * This structure supports different lesson counts per phase.
 *
 * DATA_VERSION — bump this when lesson titles, structure, or
 * defaults change so that stale localStorage is auto-cleared.
 */

const DATA_VERSION = 3;

export const defaultPhasesDetailData = {
  1: {
    id: 1,
    title: 'Cybersecurity Introduction',
    subtitle:
      'Start your foundation with the basic ideas, terms, and structure of cybersecurity.',
    courseSlug: 'cybersecurity-fundamentals',
    courseTitle: 'Cybersecurity Fundamentals',
    totalLessons: 7,
    completedLessons: 0,
    progress: 0,
    quizUnlocked: false,
    quizPassed: false,
    status: 'in-progress',
    lessons: [
      { id: 1, title: 'What Is Cybersecurity?', status: 'in-progress' },
      { id: 2, title: 'Why Cybersecurity Matters', status: 'locked' },
      { id: 3, title: 'How Cyber Attacks Happen', status: 'locked' },
      { id: 4, title: 'Hacker vs Attacker vs Defender', status: 'locked' },
      { id: 5, title: 'Ethical Hacking Meaning', status: 'locked' },
      { id: 6, title: 'Cybersecurity Careers', status: 'locked' },
      { id: 7, title: 'Ethics and Legal Rules', status: 'locked' },
    ],
    quiz: {
      title: 'Phase 1 Quiz',
      questionsCount: 5,
      passingScore: 70,
      attempts: 0,
      questions: [
        {
          id: 1,
          text: 'Placeholder question 1?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: 0
        },
        {
          id: 2,
          text: 'Placeholder question 2?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: 1
        },
        {
          id: 3,
          text: 'Placeholder question 3?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: 2
        },
        {
          id: 4,
          text: 'Placeholder question 4?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: 3
        },
        {
          id: 5,
          text: 'Placeholder question 5?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: 0
        }
      ]
    }
  },
};

export function getPhaseData(phaseId) {
  const storedVersion = localStorage.getItem('phase_data_version');

  // Clear stale cache when the data structure changes
  if (!storedVersion || Number(storedVersion) < DATA_VERSION) {
    // Remove old phase data for all phases
    for (let i = 1; i <= 8; i++) {
      localStorage.removeItem(`phase_data_${i}`);
    }
    localStorage.setItem('phase_data_version', String(DATA_VERSION));
  }

  const localData = localStorage.getItem(`phase_data_${phaseId}`);
  if (localData) {
    return JSON.parse(localData);
  }
  return defaultPhasesDetailData[phaseId] || null;
}

export function savePhaseData(phaseId, data) {
  localStorage.setItem(`phase_data_${phaseId}`, JSON.stringify(data));
}

export const phaseCompletionRules = [
  'Complete all lessons in this phase',
  'Mark each lesson as completed after studying',
  'Pass the phase quiz to unlock the next phase',
  'All lessons must be done before the quiz unlocks',
];

