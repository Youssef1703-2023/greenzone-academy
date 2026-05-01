import { BookOpen } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import GlossaryText from '../GlossaryText';

export default function LessonOverview({ text }) {
  const { t } = useLanguage();

  return (
    <div className="lcb lesson-overview">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap" style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--accent)' }}>
          <BookOpen />
        </div>
        <h2 className="lcb__section-title">{t('lesson.overview')}</h2>
      </div>
      <p className="lesson-overview__text" style={{ whiteSpace: 'pre-line' }}>
        <GlossaryText text={text} />
      </p>
    </div>
  );
}
