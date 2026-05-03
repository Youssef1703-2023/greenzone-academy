import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, Award, AlertCircle, Check, X } from 'lucide-react';
import './QuizResult.css';

export default function QuizResult({
  score,
  passingScore,
  isPassed,
  courseSlug,
  phaseId,
  onRetry,
  questions = [],
  selectedAnswers = {},
}) {
  return (
    <div className={`quiz-result ${isPassed ? 'quiz-result--passed' : 'quiz-result--failed'}`}>
      <div className="quiz-result__icon">
        {isPassed ? <Award size={48} /> : <AlertCircle size={48} />}
      </div>
      
      <h2 className="quiz-result__title">
        {isPassed ? 'Quiz Passed!' : 'Try Again'}
      </h2>
      
      <p className="quiz-result__message">
        {isPassed 
          ? `You passed the phase quiz. Phase ${phaseId} is now completed.`
          : 'You did not reach the passing score. Review the lessons and try again.'}
      </p>

      <div className="quiz-result__score-box">
        <div className="quiz-result__score-item">
          <span>Your Score</span>
          <strong className={isPassed ? 'text-passed' : 'text-failed'}>{score}%</strong>
        </div>
        <div className="quiz-result__score-divider"></div>
        <div className="quiz-result__score-item">
          <span>Passing Score</span>
          <strong>{passingScore}%</strong>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="quiz-result__review">
          <h3 className="quiz-result__review-title">Quiz Review</h3>
          <div className="quiz-result__review-list">
            {questions.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.correctAnswerIndex;
              return (
                <div key={idx} className={`quiz-result__review-item ${isCorrect ? 'review-correct' : 'review-incorrect'}`}>
                  <p className="quiz-result__review-question">{idx + 1}. {q.text || q.prompt}</p>
                  <p className="quiz-result__review-answer">
                    <strong>Your Answer:</strong> {q.options[selectedAnswers[idx]] || 'Not answered'}
                    {isCorrect ? <Check size={14} className="text-passed" /> : <X size={14} className="text-failed" />}
                  </p>
                  {!isCorrect && (
                    <p className="quiz-result__review-correct">
                      <strong>Correct Answer:</strong> {q.options[q.correctAnswerIndex]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="quiz-result__actions">
        {isPassed ? (
          <>
            <Link to={`/courses/${courseSlug}/phase/${phaseId}`} className="btn btn-secondary quiz-result__btn">
              <ArrowLeft size={16} />
              Back to Course
            </Link>
            <Link to={`/courses/${courseSlug}/phase/${Number(phaseId) + 1}`} className="btn btn-primary quiz-result__btn">
              Continue to Phase {Number(phaseId) + 1}
              <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <Link to={`/courses/${courseSlug}/phase/${phaseId}`} className="btn btn-secondary quiz-result__btn">
              <ArrowLeft size={16} />
              Back to Phase
            </Link>
            <button onClick={onRetry} className="btn btn-primary quiz-result__btn">
              Retry Quiz
              <RotateCcw size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
