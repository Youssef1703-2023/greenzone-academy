import { ClipboardCheck, CheckCircle2, XCircle, Clock, LayoutList } from 'lucide-react';
import './QuizHeader.css';

export default function QuizHeader({ phase, quiz, quizStatus, score, timeLeft }) {
  const isPassed = quizStatus === 'passed';
  const isFailed = quizStatus === 'failed';
  const isLocked = quizStatus === 'locked';
  const isInProgress = quizStatus === 'in-progress';

  // Format timeLeft (seconds) to MM:SS
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return null;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`quiz-header ${isPassed ? 'quiz-header--passed' : isFailed ? 'quiz-header--failed' : ''}`}>
      <div className="quiz-header__top">
        <span className="quiz-header__badge">Phase {phase.id} Quiz</span>

        <span className={`quiz-header__status quiz-header__status--${quizStatus}`}>
          {isPassed && <><CheckCircle2 size={13} /> Passed</>}
          {isFailed && <><XCircle size={13} /> Failed</>}
          {isLocked && <><Clock size={13} /> Locked</>}
          {quizStatus === 'ready' && <><ClipboardCheck size={13} /> Ready</>}
          {isInProgress && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: timeLeft < 60 ? '#ff4d4d' : 'inherit' }}>
              <Clock size={13} /> {formatTime(timeLeft)}
            </span>
          )}
        </span>
      </div>

      <h1 className="quiz-header__title">{quiz.title}</h1>
      <p className="quiz-header__subtitle">Pass this quiz to complete the phase and unlock the next phase.</p>

      <div className="quiz-header__stats">
        <div className="quiz-header__stat">
          <LayoutList size={16} />
          <span>{quiz.questionsCount} Questions</span>
        </div>
        <div className="quiz-header__stat">
          <CheckCircle2 size={16} />
          <span>Passing Score: {quiz.passingScore}%</span>
        </div>
        <div className="quiz-header__stat">
          <Clock size={16} />
          <span>Attempts: {quiz.attempts}</span>
        </div>
      </div>

      {(isPassed || isFailed) && (
        <div className="quiz-header__score-board">
          <div className="quiz-header__score-label">Your Score</div>
          <div className={`quiz-header__score-value ${isPassed ? 'quiz-header__score-value--passed' : 'quiz-header__score-value--failed'}`}>
            {score}%
          </div>
        </div>
      )}
    </div>
  );
}
