/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import Breadcrumbs from '../../components/UI/Breadcrumbs/Breadcrumbs';
import LessonHeader from '../../components/Lesson/LessonHeader';
import LessonContentRenderer from '../../components/Lesson/LessonContentRenderer';
import LessonNotes from '../../components/Lesson/LessonNotes';
import LessonActions from '../../components/Lesson/LessonActions';
import LessonSidebar from '../../components/Lesson/LessonSidebar';
import CompletionModal from '../../components/Lesson/CompletionModal';
import { getPhaseData, savePhaseData } from '../../data/phaseData';
import { useLanguage } from '../../context/LanguageContext';
import { useLessonContent } from '../../hooks/useLessonContent';
import { saveLessonCompletion } from '../../services/supabaseStudentService';
import './LessonPage.css';

export default function LessonPage() {
  const { slug, phaseId, lessonId } = useParams();
  const [phase, setPhase] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { language, t } = useLanguage();
  const currentLessonId = Number(lessonId);
  const {
    content: lessonContent,
    isLoading: isLessonLoading,
    error: lessonError,
    fallback: isLessonFallback,
    message: lessonMessage,
  } = useLessonContent({
    courseSlug: slug,
    phaseId,
    lessonId: currentLessonId,
    language,
  });

  // Scroll to top when lesson changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonId, phaseId]);

  useEffect(() => {
    setPhase(getPhaseData(Number(phaseId)));
  }, [phaseId, slug]);

  if (!phase) {
    return null; 
  }

  if (phase.courseSlug !== slug) {
    return <Navigate to={`/courses/${slug}`} replace />;
  }

  const lessonIndex = phase.lessons.findIndex((l) => l.id === currentLessonId);
  const lesson = phase.lessons[lessonIndex];

  if (!lesson) {
    return <Navigate to={`/courses/${slug}/phase/${phaseId}`} replace />;
  }

  const isLocked = lesson.status === 'locked';
  const nextLesson = phase.lessons[lessonIndex + 1];
  const displayLesson = lessonContent?.title ? { ...lesson, title: lessonContent.title } : lesson;

  const handleMarkCompleted = async () => {
    const updatedPhase = { ...phase };
    
    // 1. Mark current lesson completed
    updatedPhase.lessons[lessonIndex].status = 'completed';
    
    // 2. Unlock next lesson if it exists
    if (nextLesson && nextLesson.status === 'locked') {
      updatedPhase.lessons[lessonIndex + 1].status = 'in-progress';
    }
    
    // 3. Update completed count and progress
    const completedCount = updatedPhase.lessons.filter(l => l.status === 'completed').length;
    updatedPhase.completedLessons = completedCount;
    updatedPhase.progress = Math.round((completedCount / updatedPhase.totalLessons) * 100);
    
    // 4. Unlock quiz if all completed
    if (completedCount === updatedPhase.totalLessons) {
      updatedPhase.quizUnlocked = true;
      if (!nextLesson) {
        setShowCompletionModal(true);
      }
    }

    setPhase(updatedPhase);
    savePhaseData(Number(phaseId), updatedPhase);
    try {
      await saveLessonCompletion({ courseSlug: slug, phaseId, lessonId: currentLessonId });
    } catch {
      // Local phase progress remains as an emergency fallback when Supabase is unavailable.
    }
  };

  return (
    <StudentLayout>
      <div className="lesson-page">
        <Breadcrumbs 
          items={[
            { label: 'Courses', to: '/courses' },
            { label: phase.courseTitle, to: `/courses/${slug}` },
            { label: `Phase ${phase.id}`, to: `/courses/${slug}/phase/${phaseId}` },
            { label: `Lesson ${lesson.id}` }
          ]} 
        />

        <div className="lesson-page__grid">
          {/* Main Content */}
          <div className="lesson-page__main">
            {isLocked ? (
              <div className="lesson-page__locked-state">
                <Lock size={48} className="lesson-page__locked-icon" />
                <h2 className="lesson-page__locked-title">{t('lesson.lockedTitle')}</h2>
                <p className="lesson-page__locked-message">{t('lesson.lockedMessage')}</p>
                <Link to={`/courses/${slug}/phase/${phaseId}`} className="btn btn-secondary lesson-page__locked-btn">
                  <ArrowLeft size={16} />
                  {t('lesson.backToPhase')}
                </Link>
              </div>
            ) : (
              <>
                <LessonHeader phase={phase} lesson={displayLesson} overview={lessonContent?.overview} />
                {isLessonLoading && (
                  <div className="lesson-page__notice">{t('lesson.loading')}</div>
                )}
                {(isLessonFallback || lessonError) && !isLessonLoading && (
                  <div className="lesson-page__notice lesson-page__notice--warning">
                    {language === 'ar' ? t('lesson.translationUnavailable') : lessonMessage || t('lesson.translationUnavailable')}
                  </div>
                )}
                {!isLessonLoading && <LessonContentRenderer content={lessonContent} />}
                <LessonNotes lessonId={lesson.id} phaseId={phaseId} courseSlug={slug} />
                <LessonActions 
                  lesson={lesson} 
                  courseSlug={slug} 
                  phaseId={phaseId} 
                  nextLessonId={nextLesson ? nextLesson.id : null}
                  onMarkCompleted={handleMarkCompleted}
                  allLessonsCompleted={phase.completedLessons === phase.totalLessons}
                />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lesson-page__sidebar">
            <LessonSidebar
              phase={phase}
              currentLessonId={currentLessonId}
              lessonTitleOverrides={lessonContent?.title ? { [currentLessonId]: lessonContent.title } : {}}
            />
          </div>
        </div>
      </div>
      <CompletionModal isOpen={showCompletionModal} courseSlug={slug} phaseId={phaseId} />
    </StudentLayout>
  );
}
