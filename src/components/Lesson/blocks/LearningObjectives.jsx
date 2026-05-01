import { Target, Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import GlossaryText from '../GlossaryText';

export default function LearningObjectives({ objectives }) {
  const { t } = useLanguage();

  return (
    <div className="lcb objectives">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <Target />
        </div>
        <h2 className="lcb__section-title">{t('lesson.objectives')}</h2>
      </div>
      <ul className="objectives__list">
        {objectives.map((obj, i) => (
          <li key={i} className="objectives__item">
            <span className="objectives__bullet">
              <Check size={12} />
            </span>
            <div className="objectives__text">
              <GlossaryText text={obj} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
