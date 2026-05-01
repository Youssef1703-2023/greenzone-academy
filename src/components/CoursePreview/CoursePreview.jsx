import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './CoursePreview.css';

/*
 * Demo course data — this structure mirrors what would come from a backend API.
 * Each course has its own phases, lessons, quizzes, badges, and difficulty.
 * The platform does NOT enforce a fixed number of phases or lessons per course.
 */
const demoCourse = {
  id: 'cybersecurity-fundamentals',
  title: 'Cybersecurity Fundamentals',
  description:
    'A complete beginner-friendly course that helps students build strong cybersecurity basics through structured phases, lessons, quizzes, and progress tracking.',
  difficulty: 'Beginner',
  stats: {
    phases: 8,
    lessons: 56,
    quizzes: 8,
  },
  badges: [
    'Beginner Friendly',
    'Arabic Explanation',
    'English Terms',
    'Quiz Based Progress',
  ],
};

export default function CoursePreview() {
  const course = demoCourse;
  const { user } = useAuth();

  return (
    <section className="course-preview" id="course">
      <div className="course-preview__container container">
        <h2 className="section-title">
          Featured <span className="accent">Course</span>
        </h2>
        <p className="section-subtitle">
          Start your cybersecurity journey with our flagship course designed for beginners.
        </p>

        <div className="course-preview__card animate-on-scroll">
          <div className="course-preview__glow"></div>
          <div className="course-preview__content">
            <div className="course-preview__header">
              <div className="course-preview__icon">
                <Shield size={32} />
              </div>
              <div>
                <h3 className="course-preview__title">{course.title}</h3>
                <span className="course-preview__meta">
                  {course.stats.phases} Phases · {course.stats.lessons} Lessons · {course.stats.quizzes} Quizzes
                </span>
              </div>
            </div>

            <p className="course-preview__desc">{course.description}</p>

            <div className="course-preview__badges">
              {course.badges.map((badge) => (
                <span className="course-preview__badge" key={badge}>
                  {badge}
                </span>
              ))}
            </div>

            <Link
              to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/signup'}
              className="btn btn-primary course-preview__cta"
            >
              Start Learning
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="course-preview__visual">
            <div className="course-preview__ring course-preview__ring--1"></div>
            <div className="course-preview__ring course-preview__ring--2"></div>
            <div className="course-preview__shield-icon">
              <Shield size={64} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
