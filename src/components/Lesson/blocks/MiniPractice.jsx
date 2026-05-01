import { PenTool, Lightbulb } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import GlossaryText from '../GlossaryText';

export default function MiniPractice({ question, hint }) {
  const { t } = useLanguage();

  return (
    <div className="lcb practice-card">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <PenTool />
        </div>
        <h2 className="lcb__section-title">{t('lesson.miniPractice')}</h2>
      </div>
      <div className="practice-card__question" style={{ whiteSpace: 'pre-line' }}>
        <GlossaryText text={question} />
      </div>
      {hint && (
        <div className="practice-card__hint">
          <Lightbulb size={18} />
          <div className="practice-card__hint-text">
            <GlossaryText text={hint} />
          </div>
        </div>
      )}
    </div>
  );
}
