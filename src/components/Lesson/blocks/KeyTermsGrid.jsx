import { Hash } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import GlossaryText from '../GlossaryText';

export default function KeyTermsGrid({ terms }) {
  const { t } = useLanguage();

  return (
    <div className="lcb key-terms">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <Hash />
        </div>
        <h2 className="lcb__section-title">{t('lesson.keyTerms')}</h2>
      </div>
      <div className="key-terms__grid">
        {terms.map((t, i) => (
          <div key={i} className="key-terms__card">
            <div className="key-terms__term"><GlossaryText text={t.term} /></div>
            <div className="key-terms__def"><GlossaryText text={t.definition} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
