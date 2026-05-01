import { ClipboardCheck } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import GlossaryText from '../GlossaryText';

export default function LessonSummary({ takeaways }) {
  const { t } = useLanguage();

  return (
    <div className="lcb summary-card">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <ClipboardCheck />
        </div>
        <h2 className="lcb__section-title">{t('lesson.summary')}</h2>
      </div>
      <ul className="summary-card__list">
        {takeaways.map((item, i) => (
          <li key={i} className="summary-card__item">
            <span className="summary-card__num">{i + 1}</span>
            <div className="summary-card__text">
              <GlossaryText text={item} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
