import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import Breadcrumbs from '../../components/UI/Breadcrumbs/Breadcrumbs';
import PhaseHeader from '../../components/Phase/PhaseHeader';
import PhaseRules from '../../components/Phase/PhaseRules';
import LessonCard from '../../components/Phase/LessonCard';
import PhaseQuizCard from '../../components/Phase/PhaseQuizCard';
import { getPhaseData, phaseCompletionRules } from '../../data/phaseData';
import { useLanguage } from '../../context/LanguageContext';
import './PhasePage.css';

export default function PhasePage() {
  const { slug, phaseId } = useParams();
  const { t } = useLanguage();
  const phase = getPhaseData(Number(phaseId));

  // Redirect to course if phase not found
  if (!phase) {
    return <Navigate to={`/courses/${slug}`} replace />;
  }

  return (
    <StudentLayout>
      <Breadcrumbs 
        items={[
          { label: t('common.courses'), to: '/courses' },
          { label: phase.courseTitle, to: `/courses/${slug}` },
          { label: `${t('common.phase')} ${phase.id}: ${phase.title}` }
        ]} 
      />

      <PhaseHeader phase={phase} />

      {/* Two-column layout: Lessons | Rules + Quiz */}
      <div className="phase-page__grid">
        <div className="phase-page__main">
          <section className="phase-page__lessons">
            <h2 className="phase-page__section-title">{t('phasePage.lessonsTitle')}</h2>
            <div className="phase-page__lesson-list">
              {phase.lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  phaseId={phase.id}
                  courseSlug={phase.courseSlug}
                  index={index}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="phase-page__sidebar">
          <PhaseRules rules={phaseCompletionRules} />
          <PhaseQuizCard phase={phase} />
        </div>
      </div>
    </StudentLayout>
  );
}
