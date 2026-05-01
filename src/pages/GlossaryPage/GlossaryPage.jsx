import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Filter, Search } from 'lucide-react';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import { useLanguage } from '../../context/LanguageContext';
import {
  getGlossaryCategoryLabel,
  glossaryCategories,
  glossaryEntries,
} from '../../data/cybersecurityGlossary';
import './GlossaryPage.css';

const copy = {
  en: {
    badge: 'Course Glossary',
    title: 'Cybersecurity Glossary',
    subtitle: 'A searchable reference for the terms used in Green Zone Academy lessons.',
    search: 'Search terms, definitions, or examples',
    category: 'Category',
    example: 'Example',
    lessons: 'Used in',
    noResults: 'No glossary terms match your search.',
  },
  ar: {
    badge: 'قاموس الدورة',
    title: 'قاموس الأمن السيبراني',
    subtitle: 'مرجع قابل للبحث للمصطلحات المستخدمة داخل دروس Green Zone Academy.',
    search: 'ابحث باسم المصطلح أو التعريف أو المثال',
    category: 'التصنيف',
    example: 'مثال',
    lessons: 'يظهر في',
    noResults: 'لا توجد مصطلحات مطابقة لبحثك.',
  },
};

function getEntrySearchText(entry) {
  return [
    entry.termEn,
    entry.termAr,
    entry.definitionEn,
    entry.definitionAr,
    entry.exampleEn,
    entry.exampleAr,
    ...entry.aliases,
  ].join(' ').toLowerCase();
}

export default function GlossaryPage() {
  const { language } = useLanguage();
  const labels = copy[language] || copy.en;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return glossaryEntries.filter((entry) => {
      const matchesCategory = category === 'all' || entry.category === category;
      const matchesQuery = !normalizedQuery || getEntrySearchText(entry).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <StudentLayout>
      <main className="glossary-page">
        <section className="glossary-hero">
          <div>
            <div className="glossary-hero__badge">
              <BookMarked size={16} />
              {labels.badge}
            </div>
            <h1>{labels.title}</h1>
            <p>{labels.subtitle}</p>
          </div>
          <div className="glossary-hero__count">
            <strong>{filteredEntries.length}</strong>
            <span>{labels.category}</span>
          </div>
        </section>

        <section className="glossary-controls" aria-label={labels.category}>
          <label className="glossary-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.search}
              dir="auto"
            />
          </label>

          <div className="glossary-filters">
            <span>
              <Filter size={16} />
              {labels.category}
            </span>
            <div className="glossary-filter-list">
              {glossaryCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`glossary-filter ${category === item.id ? 'glossary-filter--active' : ''}`}
                  onClick={() => setCategory(item.id)}
                >
                  {getGlossaryCategoryLabel(item.id, language)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {filteredEntries.length === 0 ? (
          <div className="glossary-empty">{labels.noResults}</div>
        ) : (
          <section className="glossary-grid">
            {filteredEntries.map((entry) => {
              const definition = language === 'ar' ? entry.definitionAr : entry.definitionEn;
              const example = language === 'ar' ? entry.exampleAr : entry.exampleEn;

              return (
                <article key={entry.id} className="glossary-card">
                  <div className="glossary-card__topline">
                    <span>{getGlossaryCategoryLabel(entry.category, language)}</span>
                  </div>
                  <div className="glossary-card__terms">
                    <h2 dir="ltr">{entry.termEn}</h2>
                    <strong>{entry.termAr}</strong>
                  </div>
                  <p>{definition}</p>
                  <div className="glossary-card__example">
                    <span>{labels.example}</span>
                    <p>{example}</p>
                  </div>
                  <div className="glossary-card__refs">
                    <span>{labels.lessons}</span>
                    {entry.lessonRefs.map((ref) => (
                      <Link key={`${entry.id}-${ref.to}`} to={ref.to}>
                        {ref.label}
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </StudentLayout>
  );
}
