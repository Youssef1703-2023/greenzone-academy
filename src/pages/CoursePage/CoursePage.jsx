import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import Breadcrumbs from '../../components/UI/Breadcrumbs/Breadcrumbs';
import CourseHeader from '../../components/Course/CourseHeader';
import CompletionRules from '../../components/Course/CompletionRules';
import PhaseCard from '../../components/Course/PhaseCard';
import { getCourseData, completionRules } from '../../data/coursePageData';
import { useLanguage } from '../../context/LanguageContext';
import './CoursePage.css';

export default function CoursePage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    // In a real app, this would fetch the course by slug from the API
    const data = getCourseData(slug);
    if (data) {
      setCourse(data);
    }
  }, [slug]);

  if (!course) return null;

  if (slug !== course.slug) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <StudentLayout>
      <Breadcrumbs items={[
        { label: t('common.courses'), to: '/courses' },
        { label: course.title }
      ]} />
      <CourseHeader course={course} />

      <CompletionRules rules={completionRules} />

      {/* Phases Section */}
      <section className="phases-section">
        <div className="phases-section__header">
          <h2 className="phases-section__title">
            {t('coursePage.phasesTitlePrefix')} <span className="accent">{t('coursePage.phasesTitleAccent')}</span>
          </h2>
          <p className="phases-section__subtitle">
            {t('coursePage.phasesSubtitle')}
          </p>
        </div>

        <div className="phases-section__list">
          {course.phases.map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={index}
              courseSlug={course.slug}
            />
          ))}
        </div>
      </section>
    </StudentLayout>
  );
}
