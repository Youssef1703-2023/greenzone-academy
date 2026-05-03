import { fetchBackendAdminOverview, getScores } from './adminDataService';
import { cachedQuery, clearQueryCache } from './queryCache';

const unavailable = null;

function average(values) {
  if (!values.length) return unavailable;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export async function getAdminOverviewStats() {
  return cachedQuery('admin:overview', fetchBackendAdminOverview, { ttl: 30_000 });
}

export function refreshAdminOverviewStats() {
  clearQueryCache('admin:overview');
  return getAdminOverviewStats();
}

export async function getContentStats() {
  return (await getAdminOverviewStats()).content;
}

export async function getStudentStats() {
  return (await getAdminOverviewStats()).students;
}

export async function getProgressStats() {
  return (await getAdminOverviewStats()).progress;
}

export async function getQuizStats() {
  return (await getAdminOverviewStats()).quizzes;
}

export function getQuizStatsFromRows(scores) {
  const scoreValues = scores.map((score) => Number(score.score)).filter(Number.isFinite);
  const passedAttempts = scores.filter((score) => score.status === 'Passed').length;

  return {
    totalAttempts: scores.length,
    passedAttempts,
    failedAttempts: scores.length - passedAttempts,
    averageScore: average(scoreValues),
    highestScore: scoreValues.length ? Math.max(...scoreValues) : unavailable,
    lowestScore: scoreValues.length ? Math.min(...scoreValues) : unavailable,
    passRate: scores.length ? Math.round((passedAttempts / scores.length) * 100) : unavailable,
  };
}

export async function getScorePageStats() {
  return getQuizStatsFromRows(await getScores());
}
