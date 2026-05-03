import { useMemo } from 'react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import QuizSummaryCards from '../../components/Quizzes/QuizSummaryCards';
import NextAvailableQuiz from '../../components/Quizzes/NextAvailableQuiz';
import QuizList from '../../components/Quizzes/QuizList';
import FinalExamCard from '../../components/Quizzes/FinalExamCard';
import { getCourseData } from '../../data/coursePageData';
import { getPhaseData } from '../../data/phaseData';
import { useLanguage } from '../../context/LanguageContext';
import './QuizzesPage.css';

export default function QuizzesPage() {
  const { t } = useLanguage();

  const quizzesData = useMemo(() => {
    const course = getCourseData('cybersecurity-fundamentals');
    
    // Enrich phases with actual local storage tracking
    const enrichedPhases = course.phases.map(p => {
      const realPhaseData = getPhaseData(p.id);
      return realPhaseData ? {
        ...p,
        completedLessons: realPhaseData.completedLessons,
        progress: realPhaseData.progress,
        status: realPhaseData.status,
        quizPassed: realPhaseData.quizPassed,
        quizScore: realPhaseData.quizScore,
        quizUnlocked: realPhaseData.quizUnlocked,
        quizAttempts: realPhaseData.quiz?.attempts || 0
      } : {
        ...p,
        quizAttempts: 0
      };
    });

    const quizzesList = enrichedPhases.map(p => {
      let qStatus = 'locked';
      if (p.quizPassed) {
        qStatus = 'passed';
      } else if (p.quizUnlocked || p.completedLessons >= (p.lessonsCount || p.totalLessons)) {
        if (p.quizScore !== undefined && p.quizScore !== null) {
          qStatus = 'failed';
        } else {
          qStatus = 'ready';
        }
      }

      let requiredRule = `Complete Phase ${p.id} lessons`;
      if (qStatus === 'failed') {
        requiredRule = `Retry the quiz to complete Phase ${p.id}`;
      } else if (qStatus === 'passed') {
        requiredRule = `Passed with ${p.quizScore || 100}%`;
      }

      return {
        id: p.id,
        title: `Phase ${p.id} Quiz`,
        phaseId: p.id,
        status: qStatus,
        score: p.quizScore !== undefined && p.quizScore !== null ? p.quizScore : null,
        attempts: p.quizAttempts || 0,
        route: `/courses/cybersecurity-fundamentals/phase/${p.id}/quiz`,
        requiredRule
      };
    });
    const passedCount = quizzesList.filter((quiz) => quiz.status === 'passed').length;
    const attemptedQuizzes = quizzesList.filter((quiz) => quiz.score !== null);
    const totalAttemptedScore = attemptedQuizzes.reduce((sum, quiz) => sum + quiz.score, 0);

    // Find next available quiz
    const nextQuiz = quizzesList.find(q => q.status === 'ready' || q.status === 'failed');
    const nextPhase = enrichedPhases.find(p => p.status === 'in-progress' || p.status === 'locked');

    return {
      totalQuizzes: 8,
      passedQuizzes: passedCount,
      averageScore: attemptedQuizzes.length > 0 ? Math.round(totalAttemptedScore / attemptedQuizzes.length) : 0,
      finalExamStatus: passedCount === 8 ? 'Ready' : 'Locked',
      quizzes: quizzesList,
      nextQuiz,
      nextPhase
    };
  }, []);

  if (!quizzesData) return null;

  return (
    <StudentLayout>
      <div className="quizzes-page">
        {/* Header */}
        <div className="quizzes-page__header">
          <span className="quizzes-page__badge">{t('quizzesPage.badge')}</span>
          <h1 className="quizzes-page__title">{t('quizzesPage.title')}</h1>
          <p className="quizzes-page__subtitle">{t('quizzesPage.subtitle')}</p>
        </div>

        <QuizSummaryCards data={quizzesData} />
        
        <NextAvailableQuiz nextQuiz={quizzesData.nextQuiz} nextPhase={quizzesData.nextPhase} />
        
        <QuizList quizzes={quizzesData.quizzes} />
        
        <FinalExamCard />
      </div>
    </StudentLayout>
  );
}
