import { Play } from 'lucide-react';
import './QuizIntro.css';

export default function QuizIntro({ phaseId, onStart }) {
  return (
    <div className="quiz-intro">
      <h2 className="quiz-intro__title">Ready to start Phase {phaseId} Quiz?</h2>
      <p className="quiz-intro__subtitle">This is a placeholder quiz UI. Real questions will be added later.</p>
      
      <button className="btn btn-primary quiz-intro__btn" onClick={onStart}>
        <Play size={18} fill="currentColor" />
        Start Quiz
      </button>
    </div>
  );
}
