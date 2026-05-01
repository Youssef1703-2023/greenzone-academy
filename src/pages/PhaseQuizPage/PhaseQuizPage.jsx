/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-hooks/immutability */
import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import QuizHeader from '../../components/Quiz/QuizHeader';
import QuizRules from '../../components/Phase/PhaseRules';
import QuizLocked from '../../components/Quiz/QuizLocked';
import QuizIntro from '../../components/Quiz/QuizIntro';
import QuizQuestion from '../../components/Quiz/QuizQuestion';
import QuizResult from '../../components/Quiz/QuizResult';
import { getPhaseData, savePhaseData } from '../../data/phaseData';
import { getCourseData, saveCourseData } from '../../data/coursePageData';
import { saveQuizAttempt } from '../../services/supabaseStudentService';
import './PhaseQuizPage.css';

export default function PhaseQuizPage() {
  const { slug, phaseId } = useParams();
  const [phase, setPhase] = useState(null);

  // Quiz States
  const [quizStatus, setQuizStatus] = useState('locked'); // locked, ready, in-progress, passed, failed
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds

  useEffect(() => {
    let timer;
    if (quizStatus === 'in-progress' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (quizStatus === 'in-progress' && timeLeft === 0) {
      handleSubmit(); // Auto-submit when time is up
    }
    return () => clearInterval(timer);
  }, [quizStatus, timeLeft]);

  useEffect(() => {
    const data = getPhaseData(Number(phaseId));
    if (data) {
      setPhase(data);
      
      // Determine initial quiz state
      if (data.quizPassed) {
        setQuizStatus('passed');
        setScore(data.quizScore || 100);
      } else if (data.completedLessons >= data.totalLessons) {
        setQuizStatus('ready');
      } else {
        setQuizStatus('locked');
      }
    }
  }, [phaseId]);

  if (!phase) return null;

  if (phase.courseSlug !== slug) {
    return <Navigate to={`/courses/${slug}`} replace />;
  }

  const { quiz } = phase;

  const handleStartQuiz = () => {
    setQuizStatus('in-progress');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(10 * 60); // Reset timer to 10 minutes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAnswer = (index) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: index
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(calculatedScore);

    const passed = calculatedScore >= quiz.passingScore;
    setQuizStatus(passed ? 'passed' : 'failed');

    // Save result
    const updatedPhase = { ...phase };
    updatedPhase.quizPassed = passed;
    updatedPhase.quizScore = calculatedScore;
    if (!updatedPhase.quiz) updatedPhase.quiz = { ...quiz };
    updatedPhase.quiz.attempts = (updatedPhase.quiz.attempts || 0) + 1;
    
    if (passed) {
      updatedPhase.status = 'completed';
      updatedPhase.progress = 100;
    }
    
    setPhase(updatedPhase);
    savePhaseData(Number(phaseId), updatedPhase);

    // Update Course data to unlock phase 2
    if (passed) {
      const courseData = getCourseData(slug);
      const pIndex = courseData.phases.findIndex(p => p.id === Number(phaseId));
      if (pIndex !== -1) {
        courseData.phases[pIndex].status = 'completed';
        courseData.phases[pIndex].progress = 100;
        courseData.phases[pIndex].quizPassed = true;
        
        if (courseData.phases[pIndex + 1]) {
          courseData.phases[pIndex + 1].status = 'in-progress';
          courseData.phases[pIndex + 1].locked = false;
        }
        
        const completedPhases = courseData.phases.filter(p => p.status === 'completed').length;
        courseData.progress = Math.round((completedPhases / courseData.totalPhases) * 100);
        
        saveCourseData(slug, courseData);
      }
    }

    try {
      await saveQuizAttempt({
        courseSlug: slug,
        phaseId,
        score: calculatedScore,
        passed,
        selectedAnswers,
      });
    } catch {
      // Local quiz result remains as an emergency fallback when Supabase is unavailable.
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quizRules = [
    'Complete all lessons before starting',
    'Choose one answer for each question',
    `Passing score is ${quiz.passingScore}%`,
    'You can retry if you fail'
  ];

  return (
    <StudentLayout>
      <div className="phase-quiz-page">
        {/* Back Navigation */}
        <Link to={`/courses/${slug}/phase/${phaseId}`} className="phase-quiz-page__back">
          <ArrowLeft size={16} />
          Back to Phase
        </Link>

        {quizStatus === 'locked' ? (
          <QuizLocked 
            completedLessons={phase.completedLessons} 
            totalLessons={phase.totalLessons}
            courseSlug={slug}
            phaseId={phaseId}
          />
        ) : (
          <div className="phase-quiz-page__grid">
            <div className="phase-quiz-page__main">
              <QuizHeader 
                phase={phase} 
                quiz={quiz} 
                quizStatus={quizStatus} 
                score={score} 
                timeLeft={timeLeft}
              />
              
              {quizStatus === 'ready' && (
                <QuizIntro phaseId={phaseId} onStart={handleStartQuiz} />
              )}

              {quizStatus === 'in-progress' && (
                <QuizQuestion
                  question={quiz.questions[currentQuestionIndex]}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={quiz.questions.length}
                  selectedAnswer={selectedAnswers[currentQuestionIndex] ?? null}
                  onSelectAnswer={handleSelectAnswer}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onSubmit={handleSubmit}
                />
              )}

              {(quizStatus === 'passed' || quizStatus === 'failed') && (
                <QuizResult
                  score={score}
                  passingScore={quiz.passingScore}
                  isPassed={quizStatus === 'passed'}
                  courseSlug={slug}
                  phaseId={phaseId}
                  onRetry={handleStartQuiz}
                  questions={quiz.questions}
                  selectedAnswers={selectedAnswers}
                />
              )}
            </div>

            <div className="phase-quiz-page__sidebar">
              <QuizRules title="Quiz Rules" rules={quizRules} />
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
