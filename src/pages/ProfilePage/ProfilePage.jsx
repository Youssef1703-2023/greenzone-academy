import { useMemo } from 'react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import ProfileOverview from '../../components/Profile/ProfileOverview';
import EditProfileForm from '../../components/Profile/EditProfileForm';
import LearningSummary from '../../components/Profile/LearningSummary';
import ProgressAchievements from '../../components/Progress/ProgressAchievements';
import AccountActions from '../../components/Profile/AccountActions';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCourseData } from '../../data/coursePageData';
import { getPhaseData } from '../../data/phaseData';
import { buildAchievements } from '../../services/achievementService';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const summaryData = useMemo(() => {
    const course = getCourseData('cybersecurity-fundamentals');
    
    // Calculate stats dynamically
    let completedLessons = 0;
    let completedPhases = 0;
    let totalQuizzesTaken = 0;
    let totalQuizScore = 0;
    let currentPhaseId = 1;
    let hasPassedQuiz = false;
    
    course.phases.forEach(p => {
      const realPhaseData = getPhaseData(p.id);
      
      const mergedPhase = realPhaseData ? {
        ...p,
        completedLessons: realPhaseData.completedLessons,
        progress: realPhaseData.progress,
        status: realPhaseData.status,
        quizPassed: realPhaseData.quizPassed,
        quizScore: realPhaseData.quizScore
      } : p;

      completedLessons += mergedPhase.completedLessons;
      
      if (mergedPhase.status === 'completed') {
        completedPhases++;
        currentPhaseId = p.id + 1; // Simplistic approach to current phase
      } else if (mergedPhase.status === 'in-progress') {
        currentPhaseId = p.id;
      }
      
      if (mergedPhase.quizScore !== undefined && mergedPhase.quizScore !== null) {
        totalQuizzesTaken++;
        totalQuizScore += mergedPhase.quizScore;
        if (mergedPhase.quizScore >= 70 || mergedPhase.quizPassed) {
          hasPassedQuiz = true;
        }
      }
      
    });

    const quizAverage = totalQuizzesTaken > 0 ? Math.round(totalQuizScore / totalQuizzesTaken) : 0;
    const overallProgress = Math.round((completedLessons / course.totalLessons) * 100);

    return {
      courseTitle: course.title,
      overallProgress,
      completedLessons,
      totalLessons: course.totalLessons,
      completedPhases,
      totalPhases: course.totalPhases,
      quizAverage,
      currentPhaseId: currentPhaseId > course.totalPhases ? course.totalPhases : currentPhaseId,
      achievements: buildAchievements({
        completedLessons,
        completedPhases,
        quizPassed: hasPassedQuiz,
        quizAverage,
        overallProgress,
        streak: completedLessons > 0 ? 1 : 0,
      }),
    };
  }, []);

  return (
    <StudentLayout>
      <div className="profile-page">
        {/* Header */}
        <div className="profile-page__header">
          <span className="profile-page__badge">{t('profilePage.badge')}</span>
          <h1 className="profile-page__title">{t('profilePage.title')}</h1>
          <p className="profile-page__subtitle">{t('profilePage.subtitle')}</p>
        </div>

        <ProfileOverview user={user} />
        
        <div className="profile-page__grid">
          <div className="profile-page__left">
            <EditProfileForm />
            <AccountActions />
          </div>
          
          <div className="profile-page__right">
            <LearningSummary data={summaryData} />
            <div className="profile-page__achievements-wrap">
              {summaryData && <ProgressAchievements achievements={summaryData.achievements} />}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
