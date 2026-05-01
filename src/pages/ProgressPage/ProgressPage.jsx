import { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import OverallProgressCard from '../../components/Progress/OverallProgressCard';
import ProgressStats from '../../components/Progress/ProgressStats';
import PhaseProgressTimeline from '../../components/Progress/PhaseProgressTimeline';
import QuizPerformance from '../../components/Progress/QuizPerformance';
import ProgressAchievements from '../../components/Progress/ProgressAchievements';
import ProgressActions from '../../components/Progress/ProgressActions';
import ResetProgress from '../../components/Progress/ResetProgress';
import { getCourseData } from '../../data/coursePageData';
import { getPhaseData } from '../../data/phaseData';
import { useLanguage } from '../../context/LanguageContext';
import './ProgressPage.css';

export default function ProgressPage() {
  const [progressData, setProgressData] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Attempt to build progress from localStorage mock data to reflect user flow
    const course = getCourseData('cybersecurity-fundamentals');
    
    // Calculate stats dynamically
    let completedLessons = 0;
    let completedPhases = 0;
    let totalQuizzesTaken = 0;
    let totalQuizScore = 0;
    
    const enrichedPhases = course.phases.map(p => {
      // Pull real-time phase data from localStorage to sync with LessonPage
      const realPhaseData = getPhaseData(p.id);
      
      const mergedPhase = realPhaseData ? {
        ...p,
        completedLessons: realPhaseData.completedLessons,
        progress: realPhaseData.progress,
        status: realPhaseData.status,
        quizPassed: realPhaseData.quizPassed,
        quizScore: realPhaseData.quizScore,
        quizUnlocked: realPhaseData.quizUnlocked
      } : p;

      completedLessons += mergedPhase.completedLessons;
      
      if (mergedPhase.status === 'completed') {
        completedPhases++;
      }
      
      if (mergedPhase.quizPassed) {
        totalQuizzesTaken++;
        totalQuizScore += mergedPhase.quizScore || 100;
      }
      
      return mergedPhase;
    });

    const quizPassed = totalQuizzesTaken > 0;
    const quizAverage = totalQuizzesTaken > 0 ? Math.round(totalQuizScore / totalQuizzesTaken) : 0;
    const overallProgress = Math.round((completedLessons / course.totalLessons) * 100);

    const data = {
      courseTitle: course.title,
      overallProgress,
      completedLessons,
      totalLessons: course.totalLessons,
      completedPhases,
      totalPhases: course.totalPhases,
      quizAverage,
      streak: 3,
      phases: enrichedPhases,
      achievements: [
        { titleKey: "progressPage.firstPhaseCompleted", title: "First Phase Completed", unlocked: completedPhases > 0 },
        { titleKey: "progressPage.quizPassed", title: "Quiz Passed", unlocked: quizPassed },
        { titleKey: "progressPage.sevenLessonsCompleted", title: "7 Lessons Completed", unlocked: completedLessons >= 7 },
        { titleKey: "progressPage.learningStreakStarted", title: "Learning Streak Started", unlocked: true }
      ]
    };

    setProgressData(data);
  }, []);

  if (!progressData) return null;

  return (
    <StudentLayout>
      <div className="progress-page">
        {/* Header */}
        <div className="progress-page__header">
          <span className="progress-page__badge">{t('progressPage.badge')}</span>
          <h1 className="progress-page__title">{t('progressPage.title')}</h1>
          <p className="progress-page__subtitle">{t('progressPage.subtitle')}</p>
        </div>

        <OverallProgressCard data={progressData} />
        
        <ProgressStats data={progressData} />

        <div className="progress-page__grid">
          <div className="progress-page__main">
            <PhaseProgressTimeline phases={progressData.phases} />
          </div>
          <div className="progress-page__sidebar">
            <ProgressAchievements achievements={progressData.achievements} />
            <div className="progress-page__gap"></div>
            <ProgressActions />
          </div>
        </div>

        <div className="progress-page__gap" style={{ height: '32px' }}></div>
        <QuizPerformance phases={progressData.phases} />

        <div className="progress-page__gap" style={{ height: '24px' }}></div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ResetProgress />
        </div>
      </div>
    </StudentLayout>
  );
}
