import { LayoutTemplate, List, FileText } from 'lucide-react';
import './LessonContentPlaceholder.css';

export default function LessonContentPlaceholder() {
  return (
    <div className="lesson-content-placeholder">
      <h2 className="lesson-content-placeholder__title">Lesson Content</h2>
      
      <div className="lesson-content-placeholder__section">
        <h3 className="lesson-content-placeholder__heading">
          <LayoutTemplate size={18} />
          Overview
        </h3>
        <p className="lesson-content-placeholder__text">
          Content placeholder. Real lesson content will be added later.
        </p>
      </div>

      <div className="lesson-content-placeholder__section">
        <h3 className="lesson-content-placeholder__heading">
          <List size={18} />
          Key Points
        </h3>
        <ul className="lesson-content-placeholder__list">
          <li>Content placeholder. Real lesson content will be added later.</li>
          <li>Content placeholder. Real lesson content will be added later.</li>
          <li>Content placeholder. Real lesson content will be added later.</li>
        </ul>
      </div>

      <div className="lesson-content-placeholder__section">
        <h3 className="lesson-content-placeholder__heading">
          <FileText size={18} />
          Example
        </h3>
        <div className="lesson-content-placeholder__code">
          Content placeholder. Real lesson content will be added later.
        </div>
      </div>
    </div>
  );
}
