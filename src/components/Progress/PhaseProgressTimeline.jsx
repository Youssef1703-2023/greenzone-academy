import { CheckCircle2, PlayCircle, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './PhaseProgressTimeline.css';

export default function PhaseProgressTimeline({ phases }) {
  const { t } = useLanguage();

  return (
    <div className="phase-timeline">
      <h3 className="phase-timeline__header">{t('progressPage.phaseProgress')}</h3>

      <div className="phase-timeline__list">
        {phases.map((phase) => {
          const isCompleted = phase.status === 'completed';
          const isLocked = phase.status === 'locked';
          const isQuizReady = phase.completedLessons >= (phase.lessonsCount || phase.totalLessons) && !phase.quizPassed;
          const isInProgress = phase.status === 'in-progress' && !isQuizReady;
          const isActive = isInProgress || isQuizReady;

          return (
            <div
              key={phase.id}
              className={`phase-timeline-item ${isCompleted ? 'phase-timeline-item--completed' : ''} ${isActive ? 'phase-timeline-item--active' : ''} ${isLocked ? 'phase-timeline-item--locked' : ''} ${isQuizReady ? 'phase-timeline-item--ready' : ''}`}
            >
              <div className="phase-timeline-item__indicator">
                <div className="phase-timeline-item__dot">
                  {isCompleted && <CheckCircle2 size={14} />}
                  {isActive && <PlayCircle size={14} />}
                  {isLocked && <Lock size={12} />}
                </div>
                <div className="phase-timeline-item__line"></div>
              </div>

              <div className="phase-timeline-item__content">
                <div className="phase-timeline-item__top">
                  <span className="phase-timeline-item__phase-num">{t('common.phase')} {phase.id}</span>
                  <span className="phase-timeline-item__status-text">
                    {isCompleted ? t('common.completed') : isQuizReady ? t('phasePage.quizReady') : isInProgress ? t('common.inProgress') : t('common.locked')}
                  </span>
                </div>

                <h4 className="phase-timeline-item__title">{phase.title}</h4>

                <div className="phase-timeline-item__stats">
                  <span className="stat-label">{t('common.lessons')}:</span> {phase.completedLessons} / {phase.lessonsCount || phase.totalLessons}
                  <span className="stat-divider">•</span>
                  <span className="stat-label">{t('common.quiz')}:</span> {phase.quizPassed ? t('common.passed') : isLocked ? t('common.locked') : t('common.pending')}
                </div>

                {!isLocked && (
                  <div className="phase-timeline-item__progress-bar">
                    <div
                      className="phase-timeline-item__progress-fill"
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
