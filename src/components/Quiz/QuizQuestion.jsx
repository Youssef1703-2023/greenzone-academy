import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import './QuizQuestion.css';

export default function QuizQuestion({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrev,
  onSubmit
}) {
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="quiz-question">
      <div className="quiz-question__header">
        <span className="quiz-question__progress">Question {currentIndex + 1} of {totalQuestions}</span>
        <div className="quiz-question__progress-bar">
          <div
            className="quiz-question__progress-fill"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      <h3 className="quiz-question__text">{question.text}</h3>

      <div className="quiz-question__options">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          return (
            <button
              key={index}
              className={`quiz-question__option ${isSelected ? 'quiz-question__option--selected' : ''}`}
              onClick={() => onSelectAnswer(index)}
            >
              <div className="quiz-question__option-box">
                {isSelected && <Check size={14} />}
              </div>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      <div className="quiz-question__footer">
        <button
          className="btn btn-secondary quiz-question__btn"
          onClick={onPrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={16} />
          Previous
        </button>

        {isLastQuestion ? (
          <button
            className="btn btn-primary quiz-question__btn"
            onClick={onSubmit}
            disabled={selectedAnswer === null}
          >
            Submit Quiz
            <Check size={16} />
          </button>
        ) : (
          <button
            className="btn btn-primary quiz-question__btn"
            onClick={onNext}
            disabled={selectedAnswer === null}
          >
            Next
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
