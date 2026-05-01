import { Globe } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import GlossaryText from '../GlossaryText';

export default function RealWorldExample({ title, scenario, whatHappened, securityLesson }) {
  const { t } = useLanguage();

  return (
    <div className="lcb example-card">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <Globe />
        </div>
        <h2 className="lcb__section-title">{t('lesson.realWorldExample')}</h2>
      </div>

      <div className="example-card__title"><GlossaryText text={title} /></div>

      <div className="example-card__field">
        <div className="example-card__label">{t('lesson.scenario')}</div>
        <div className="example-card__value"><GlossaryText text={scenario} /></div>
      </div>

      <div className="example-card__field">
        <div className="example-card__label">{t('lesson.whatHappened')}</div>
        <div className="example-card__value"><GlossaryText text={whatHappened} /></div>
      </div>

      <div className="example-card__field">
        <div className="example-card__label">{t('lesson.securityLesson')}</div>
        <div className="example-card__value"><GlossaryText text={securityLesson} /></div>
      </div>
    </div>
  );
}
