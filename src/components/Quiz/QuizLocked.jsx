import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import './QuizLocked.css';

export default function QuizLocked({ completedLessons, totalLessons, courseSlug, phaseId }) {
  return (
    <div className="quiz-locked">
      <div className="quiz-locked__icon-wrapper">
        <Lock size={42} className="quiz-locked__icon" />
      </div>
      <h2 className="quiz-locked__title">Quiz Locked</h2>
      <p className="quiz-locked__message">Complete all 7 lessons in this phase to unlock the Phase Quiz.</p>
      
      <div className="quiz-locked__progress">
        {completedLessons} / {totalLessons} lessons completed
      </div>

      <Link to={`/courses/${courseSlug}/phase/${phaseId}`} className="btn btn-secondary quiz-locked__btn">
        <ArrowLeft size={16} />
        Back to Phase
      </Link>
    </div>
  );
}
