import { BarChart3, CheckCircle2, Award, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LearningSummary.css';

export default function LearningSummary({ data }) {
  const { t } = useLanguage();
  if (!data) return null;

  return (
    <div className="learning-summary">
      <h3 className="learning-summary__header">{t('progressPage.learningSummary')}</h3>
      
      <div className="learning-summary__course">
        <span className="learning-summary__course-label">{t('profilePage.enrolledCourse')}</span>
        <h4 className="learning-summary__course-title" dir="ltr">{data.courseTitle}</h4>
        
        <div className="learning-summary__progress-bar">
          <div 
            className="learning-summary__progress-fill"
            style={{ width: `${data.overallProgress}%` }}
          ></div>
        </div>
        <div className="learning-summary__progress-text">
          <span>{t('dashboard.overallProgress')}</span>
          <span className="learning-summary__progress-value">{data.overallProgress}%</span>
        </div>
      </div>

      <div className="learning-summary__grid">
        <div className="learning-summary__stat">
          <div className="learning-summary__stat-icon learning-summary__stat-icon--green">
            <CheckCircle2 size={16} />
          </div>
          <div className="learning-summary__stat-info">
            <span className="learning-summary__stat-label">{t('dashboard.completedLessons')}</span>
            <span className="learning-summary__stat-value">{data.completedLessons} / {data.totalLessons}</span>
          </div>
        </div>
        
        <div className="learning-summary__stat">
          <div className="learning-summary__stat-icon learning-summary__stat-icon--blue">
            <Award size={16} />
          </div>
          <div className="learning-summary__stat-info">
            <span className="learning-summary__stat-label">{t('progressPage.completedPhases')}</span>
            <span className="learning-summary__stat-value">{data.completedPhases} / {data.totalPhases}</span>
          </div>
        </div>

        <div className="learning-summary__stat">
          <div className="learning-summary__stat-icon learning-summary__stat-icon--purple">
            <BarChart3 size={16} />
          </div>
          <div className="learning-summary__stat-info">
            <span className="learning-summary__stat-label">{t('progressPage.quizAverage')}</span>
            <span className="learning-summary__stat-value">{data.quizAverage}%</span>
          </div>
        </div>

        <div className="learning-summary__stat">
          <div className="learning-summary__stat-icon learning-summary__stat-icon--yellow">
            <Zap size={16} />
          </div>
          <div className="learning-summary__stat-info">
            <span className="learning-summary__stat-label">{t('dashboard.currentPhase')}</span>
            <span className="learning-summary__stat-value">{t('common.phase')} {data.currentPhaseId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
