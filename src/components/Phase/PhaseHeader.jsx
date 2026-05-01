import { Layers, BookOpen, ClipboardCheck, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './PhaseHeader.css';

export default function PhaseHeader({ phase }) {
  const { t } = useLanguage();
  const statusLabel = phase.status === 'in-progress'
    ? t('common.inProgress')
    : phase.status === 'completed'
      ? t('common.completed')
      : t('common.locked');

  return (
    <section className="phase-header">
      <div className="phase-header__glow"></div>

      <div className="phase-header__content">
        <div className="phase-header__top">
          <div className="phase-header__icon">
            <Layers size={28} />
          </div>
          <span className="phase-header__badge">{t('common.phase')} {phase.id}</span>
          <span className={`phase-header__status phase-header__status--${phase.status}`}>
            <Clock size={13} />
            {statusLabel}
          </span>
        </div>

        <h1 className="phase-header__title">{phase.title}</h1>
        <p className="phase-header__subtitle">{phase.subtitle}</p>

        <div className="phase-header__stats">
          <div className="phase-header__stat">
            <BookOpen size={16} />
            <span>{phase.totalLessons} {t('common.lessons')}</span>
          </div>
          <div className="phase-header__stat">
            <ClipboardCheck size={16} />
            <span>1 {t('common.quiz')}</span>
          </div>
          <div className="phase-header__stat phase-header__stat--accent">
            <span>{phase.completedLessons} / {phase.totalLessons} {t('dashboard.completed')}</span>
          </div>
        </div>

        <div className="phase-header__progress">
          <div className="phase-header__progress-info">
            <span>{t('phasePage.phaseProgress')}</span>
            <span className="phase-header__progress-value">{phase.progress}%</span>
          </div>
          <div className="phase-header__progress-bar">
            <div
              className="phase-header__progress-fill"
              style={{ width: `${phase.progress}%` }}
            >
              <div className="phase-header__progress-shine"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="phase-header__visual">
        <div className="phase-header__ring phase-header__ring--1"></div>
        <div className="phase-header__ring phase-header__ring--2"></div>
        <div className="phase-header__number-display">{phase.id}</div>
      </div>
    </section>
  );
}
