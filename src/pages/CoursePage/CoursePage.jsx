import { useState, useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, PlayCircle, Target } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import Breadcrumbs from '../../components/UI/Breadcrumbs/Breadcrumbs';
import CourseHeader from '../../components/Course/CourseHeader';
import CompletionRules from '../../components/Course/CompletionRules';
import PhaseCard from '../../components/Course/PhaseCard';
import { getCourseData, completionRules } from '../../data/coursePageData';
import { useLanguage } from '../../context/LanguageContext';
import { fetchStudentCourseExperience } from '../../services/supabaseStudentService';
import './CoursePage.css';

export default function CoursePage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      try {
        const liveCourse = await fetchStudentCourseExperience(slug);
        if (mounted) setCourse(liveCourse);
      } catch {
        const data = getCourseData(slug);
        if (mounted && data) setCourse(data);
      }
    }

    loadCourse();

    return () => {
      mounted = false;
    };
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
      <CourseHeader course={course} continueRoute={course.continueRoute} />

      <section className="course-continue-panel">
        <div className="course-continue-panel__icon">
          <Target size={22} />
        </div>
        <div className="course-continue-panel__body">
          <span>Smart Continue</span>
          <h2>{course.currentPhaseTitle || 'Continue your current phase'}</h2>
          <p>
            Resume from the next unlocked lesson, or jump straight to the phase quiz when all lessons are complete.
          </p>
        </div>
        <Link to={course.continueRoute || `/courses/${course.slug}/phase/1`} className="btn btn-primary course-continue-panel__btn">
          <PlayCircle size={17} />
          Continue Learning
          <ArrowRight size={17} />
        </Link>
      </section>

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
