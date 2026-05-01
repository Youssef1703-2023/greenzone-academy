import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, PlayCircle, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LessonSidebar.css';

const statusConfig = {
  completed: { icon: CheckCircle2, className: 'lesson-sidebar-item--completed' },
  'in-progress': { icon: PlayCircle, className: 'lesson-sidebar-item--active' },
  locked: { icon: Lock, className: 'lesson-sidebar-item--locked' },
};

const arabicLessonTitles = {
  1: 'ما هو الأمن السيبراني؟',
  2: 'لماذا الأمن السيبراني مهم؟',
  3: 'كيف تحدث الهجمات السيبرانية؟',
  4: 'الهاكر والمهاجم والمدافع',
  5: 'معنى الاختراق الأخلاقي',
  6: 'مجالات العمل في الأمن السيبراني',
  7: 'القواعد القانونية والأخلاقية',
};

export default function LessonSidebar({ phase, currentLessonId, lessonTitleOverrides = {} }) {
  const { language, t } = useLanguage();

  return (
    <div className="lesson-sidebar">
      <div className="lesson-sidebar__header">
        <BookOpen size={18} />
        <h3 className="lesson-sidebar__title">{t('lesson.lessonsInPhase', { phaseId: phase.id })}</h3>
      </div>
      
      <div className="lesson-sidebar__list">
        {phase.lessons.map((lesson) => {
          const config = statusConfig[lesson.status] || statusConfig.locked;
          const StatusIcon = config.icon;
          const isCurrent = lesson.id === currentLessonId;
          const isLocked = lesson.status === 'locked';
          const route = `/courses/${phase.courseSlug}/phase/${phase.id}/lesson/${lesson.id}`;
          const displayTitle = language === 'ar'
            ? lessonTitleOverrides[lesson.id] || arabicLessonTitles[lesson.id] || lesson.title
            : lesson.title;

          const content = (
            <>
              <div className="lesson-sidebar-item__number">{lesson.id}</div>
              <div className="lesson-sidebar-item__info">
                <span className="lesson-sidebar-item__title" dir="auto">{displayTitle}</span>
              </div>
              <div className="lesson-sidebar-item__status">
                <StatusIcon size={14} />
              </div>
            </>
          );

          if (isLocked) {
            return (
              <div key={lesson.id} className={`lesson-sidebar-item ${config.className}`}>
                {content}
              </div>
            );
          }

          return (
            <Link
              key={lesson.id}
              to={route}
              className={`lesson-sidebar-item ${config.className} ${isCurrent ? 'lesson-sidebar-item--current' : ''}`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
