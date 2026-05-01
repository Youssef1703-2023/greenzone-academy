import { CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './CompletionRules.css';

export default function CompletionRules({ rules }) {
  const { t } = useLanguage();
  const translatedRules = [
    t('phaseCompletion.rule1'),
    t('phaseCompletion.rule2'),
    t('phaseCompletion.rule3'),
    t('phaseCompletion.rule4'),
  ];

  return (
    <div className="completion-rules">
      <div className="completion-rules__header">
        <Info size={18} />
        <h3 className="completion-rules__title">{t('coursePage.completionRules')}</h3>
      </div>
      <ul className="completion-rules__list">
        {rules.map((rule, i) => (
          <li className="completion-rules__item" key={i}>
            <CheckCircle size={15} className="completion-rules__check" />
            <span>{translatedRules[i] || rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
