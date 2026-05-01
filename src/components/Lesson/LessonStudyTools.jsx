import { BookMarked, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function LessonStudyTools() {
  const { language } = useLanguage();
  const labels = language === 'ar'
    ? {
      title: 'أدوات الدراسة',
      subtitle: 'مصطلحات تفاعلية وقاموس سريع للرجوع إلى التعريفات أثناء قراءة الدرس.',
      glossary: 'القاموس',
    }
    : {
      title: 'Study Tools',
      subtitle: 'Interactive terminology and a quick glossary reference while reading the lesson.',
      glossary: 'Glossary',
    };

  return (
    <div className="lesson-study-tools">
      <div className="lesson-study-tools__copy">
        <div className="lesson-study-tools__eyebrow">
          <Languages size={14} />
          {labels.title}
        </div>
        <p>{labels.subtitle}</p>
      </div>
      <div className="lesson-study-tools__actions">
        <Link to="/glossary" className="lesson-study-tools__btn">
          <BookMarked size={16} />
          <span>{labels.glossary}</span>
        </Link>
      </div>
    </div>
  );
}
