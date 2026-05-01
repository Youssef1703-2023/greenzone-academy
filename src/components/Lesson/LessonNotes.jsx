import { useState, useEffect, useRef } from 'react';
import { PenTool, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './LessonNotes.css';

export default function LessonNotes({ lessonId, phaseId, courseSlug }) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const saveTimeoutRef = useRef(null);

  const storageKey = `gza_notes_${courseSlug}_${phaseId}_${lessonId}`;

  // Load notes on mount or when lesson changes
  useEffect(() => {
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      setNotes(savedNotes);
    } else {
      setNotes('');
    }
  }, [storageKey]);

  // Handle typing and auto-save
  const handleChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(storageKey, newNotes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000); // Hide "Saved!" after 2s
    }, 1000);
  };

  return (
    <div className="lesson-notes">
      <div className="lesson-notes__header">
        <PenTool size={18} />
        <h3 className="lesson-notes__title">{t('lesson.studentNotes')}</h3>
        {isSaved && (
          <div className="lesson-notes__saved-badge">
            <CheckCircle size={14} />
            <span>{t('lesson.saved')}</span>
          </div>
        )}
      </div>
      
      <textarea
        className="lesson-notes__textarea"
        placeholder={t('lesson.notesPlaceholder')}
        value={notes}
        onChange={handleChange}
      ></textarea>
      
      <div className="lesson-notes__footer">
        <span>{t('lesson.notesFooter')}</span>
      </div>
    </div>
  );
}
