import { Wrench, Lightbulb } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import GlossaryText from '../GlossaryText';

export default function ToolConceptCard({ name, category, description, whyItMatters, beginnerNote }) {
  const { t } = useLanguage();

  return (
    <div className="lcb tool-card">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <Wrench />
        </div>
        <h2 className="lcb__section-title">{t('lesson.toolConcept')}</h2>
      </div>

      <div className="tool-card__header">
        <span className="tool-card__name"><GlossaryText text={name} /></span>
        <span className="tool-card__category"><GlossaryText text={category} /></span>
      </div>

      <p className="tool-card__desc"><GlossaryText text={description} /></p>

      {whyItMatters && (
        <div className="tool-card__field">
          <div className="tool-card__label">{t('lesson.whyItMatters')}</div>
          <div className="tool-card__value"><GlossaryText text={whyItMatters} /></div>
        </div>
      )}

      {beginnerNote && (
        <div className="tool-card__beginner">
          <Lightbulb size={18} />
          <div className="tool-card__beginner-text">
            <GlossaryText text={beginnerNote} />
          </div>
        </div>
      )}
    </div>
  );
}
