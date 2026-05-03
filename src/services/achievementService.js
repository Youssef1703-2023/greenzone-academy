const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first-steps',
    title: 'First Steps',
    titleKey: 'progressPage.achievementFirstSteps',
    description: 'Start your first lesson and begin the learning path.',
    descriptionKey: 'progressPage.achievementFirstStepsDesc',
    icon: 'zap',
    evaluate: ({ completedLessons }) => completedLessons > 0,
    progress: ({ completedLessons }) => Math.min(100, completedLessons > 0 ? 100 : 0),
  },
  {
    id: 'seven-lessons',
    title: '7 Lessons Completed',
    titleKey: 'progressPage.sevenLessonsCompleted',
    description: 'Complete the first full lesson set.',
    descriptionKey: 'progressPage.achievementSevenLessonsDesc',
    icon: 'star',
    evaluate: ({ completedLessons }) => completedLessons >= 7,
    progress: ({ completedLessons }) => Math.min(100, Math.round((completedLessons / 7) * 100)),
  },
  {
    id: 'quiz-passed',
    title: 'Quiz Passed',
    titleKey: 'progressPage.quizPassed',
    description: 'Pass any phase quiz with the required score.',
    descriptionKey: 'progressPage.achievementQuizPassedDesc',
    icon: 'trophy',
    evaluate: ({ quizPassed }) => quizPassed,
    progress: ({ quizPassed, quizAverage }) => quizPassed ? 100 : Math.min(100, quizAverage || 0),
  },
  {
    id: 'first-phase',
    title: 'First Phase Completed',
    titleKey: 'progressPage.firstPhaseCompleted',
    description: 'Finish every lesson and quiz in the first phase.',
    descriptionKey: 'progressPage.achievementFirstPhaseDesc',
    icon: 'shield',
    evaluate: ({ completedPhases }) => completedPhases > 0,
    progress: ({ completedPhases }) => completedPhases > 0 ? 100 : 0,
  },
  {
    id: 'halfway',
    title: 'Halfway Defender',
    titleKey: 'progressPage.achievementHalfway',
    description: 'Reach 50% total course progress.',
    descriptionKey: 'progressPage.achievementHalfwayDesc',
    icon: 'target',
    evaluate: ({ overallProgress }) => overallProgress >= 50,
    progress: ({ overallProgress }) => Math.min(100, overallProgress * 2),
  },
  {
    id: 'consistent-learner',
    title: 'Consistent Learner',
    titleKey: 'progressPage.achievementConsistent',
    description: 'Build a visible learning streak.',
    descriptionKey: 'progressPage.achievementConsistentDesc',
    icon: 'flame',
    evaluate: ({ streak }) => streak >= 3,
    progress: ({ streak }) => Math.min(100, Math.round(((streak || 0) / 3) * 100)),
  },
];

export function buildAchievements(metrics) {
  return ACHIEVEMENT_DEFINITIONS.map((achievement) => {
    const unlocked = achievement.evaluate(metrics);
    return {
      ...achievement,
      unlocked,
      progress: unlocked ? 100 : Math.max(0, achievement.progress(metrics) || 0),
    };
  });
}

export function summarizeAchievements(achievements) {
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  return {
    unlocked,
    total: achievements.length,
    completionRate: achievements.length ? Math.round((unlocked / achievements.length) * 100) : 0,
  };
}
