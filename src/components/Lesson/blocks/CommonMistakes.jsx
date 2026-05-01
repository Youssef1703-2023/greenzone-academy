import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import GlossaryText from '../GlossaryText';

export default function CommonMistakes({ items }) {
  const { t } = useLanguage();

  return (
    <div className="lcb mistakes-card">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <AlertTriangle />
        </div>
        <h2 className="lcb__section-title">{t('lesson.commonMistakes')}</h2>
      </div>
      <div className="mistakes-card__list">
        {items.map((item, i) => (
          <div key={i} className="mistakes-card__item">
            <div className="mistakes-card__mistake">
              <XCircle size={16} />
              <GlossaryText text={item.mistake} />
            </div>
            <div className="mistakes-card__risk">
              <GlossaryText text={item.whyRisky} />
            </div>
            <div className="mistakes-card__better">
              <CheckCircle2 size={16} />
              <div className="mistakes-card__better-text">
                <GlossaryText text={item.betterPractice} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
