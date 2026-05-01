import { CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './PhaseRules.css';

export default function PhaseRules({ title = "Phase Completion Rules", rules }) {
  const { t } = useLanguage();
  const translatedRules = [
    t('phaseCompletion.rule1'),
    t('phaseCompletion.rule2'),
    t('phaseCompletion.rule3'),
    t('phaseCompletion.rule4'),
  ];
  const displayTitle = title === 'Phase Completion Rules' ? t('phasePage.phaseCompletionRules') : title;

  return (
    <div className="phase-rules">
      <div className="phase-rules__header">
        <Info size={17} />
        <h3 className="phase-rules__title">{displayTitle}</h3>
      </div>
      <ul className="phase-rules__list">
        {rules.map((rule, i) => (
          <li className="phase-rules__item" key={i}>
            <CheckCircle size={14} className="phase-rules__check" />
            <span>{translatedRules[i] || rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
