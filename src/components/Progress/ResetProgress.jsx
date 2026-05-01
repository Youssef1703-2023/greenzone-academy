import { useState } from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import './ResetProgress.css';

export default function ResetProgress() {
  const [showModal, setShowModal] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    // Clear all phase data
    for (let i = 1; i <= 8; i++) {
      localStorage.removeItem(`phase_data_${i}`);
    }

    // Clear course data
    localStorage.removeItem('course_data_cybersecurity-fundamentals');

    // Clear version keys so fresh defaults reload
    localStorage.removeItem('phase_data_version');
    localStorage.removeItem('course_data_version');

    // Clear any quiz/progress keys
    localStorage.removeItem('quiz_results');

    setResetDone(true);
    setTimeout(() => {
      setShowModal(false);
      setResetDone(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <>
      <button className="reset-progress__btn" onClick={() => setShowModal(true)}>
        <RotateCcw size={14} />
        Reset Demo Progress
      </button>

      {showModal && (
        <div className="reset-modal__overlay" onClick={() => !resetDone && setShowModal(false)}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
            <button className="reset-modal__close" onClick={() => setShowModal(false)}>
              <X size={18} />
            </button>

            {resetDone ? (
              <div className="reset-modal__body reset-modal__body--done">
                <div className="reset-modal__done-icon">✓</div>
                <h3 className="reset-modal__title">Progress Reset</h3>
                <p className="reset-modal__msg">Reloading with fresh data...</p>
              </div>
            ) : (
              <div className="reset-modal__body">
                <div className="reset-modal__icon">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="reset-modal__title">Reset Demo Progress</h3>
                <p className="reset-modal__msg">
                  This will clear all lesson progress, quiz scores, and phase completion.
                  Your account will not be logged out.
                </p>
                <p className="reset-modal__note">This action is for development and testing only.</p>
                <div className="reset-modal__actions">
                  <button className="btn btn-secondary reset-modal__cancel" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn reset-modal__confirm" onClick={handleReset}>
                    <RotateCcw size={14} />
                    Reset All Progress
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
