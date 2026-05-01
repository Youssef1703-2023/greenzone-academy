import { useState, useEffect, useRef } from 'react';
import { PenTool, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { loadLessonNote, saveLessonNote } from '../../services/supabaseStudentService';
import './LessonNotes.css';

export default function LessonNotes({ lessonId, phaseId, courseSlug }) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const saveTimeoutRef = useRef(null);

  const storageKey = `gza_notes_${courseSlug}_${phaseId}_${lessonId}`;

  // Load notes on mount or when lesson changes
  useEffect(() => {
    let isActive = true;

    async function loadNotes() {
      try {
        const remoteNotes = await loadLessonNote({ courseSlug, phaseId, lessonId });
        if (!isActive) return;
        if (remoteNotes) {
          setNotes(remoteNotes);
          localStorage.setItem(storageKey, remoteNotes);
          return;
        }
      } catch {
        // Emergency offline fallback.
      }

      if (!isActive) return;
      setNotes(localStorage.getItem(storageKey) || '');
    }

    loadNotes();

    return () => {
      isActive = false;
    };
  }, [courseSlug, lessonId, phaseId, storageKey]);

  // Handle typing and auto-save
  const handleChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveLessonNote({ courseSlug, phaseId, lessonId, noteText: newNotes });
      } catch {
        // Keep notes safe locally if Supabase is unreachable.
      }
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
