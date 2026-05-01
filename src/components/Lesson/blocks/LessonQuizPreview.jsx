import { CheckSquare } from 'lucide-react';
import GlossaryText from '../GlossaryText';

export default function LessonQuizPreview({ title, questions }) {
  if (!questions?.length) return null;

  return (
    <div className="lcb lesson-quiz">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <CheckSquare />
        </div>
        <h2 className="lcb__section-title"><GlossaryText text={title} /></h2>
      </div>

      <div className="lesson-quiz__list">
        {questions.map((question, index) => (
          <article className="lesson-quiz__item" key={`${question.question}-${index}`}>
            <h3 className="lesson-quiz__question">
              <span className="lesson-quiz__number">{index + 1}</span>
              <GlossaryText text={question.question} />
            </h3>
            <div className="lesson-quiz__options">
              {question.options.map((option, optionIndex) => (
                <div className="lesson-quiz__option" key={`${option}-${optionIndex}`}>
                  <span className="lesson-quiz__letter">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span><GlossaryText text={option} /></span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
