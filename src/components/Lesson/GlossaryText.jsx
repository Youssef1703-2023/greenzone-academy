import { useMemo } from 'react';
import { getGlossaryAliasEntries } from '../../data/cybersecurityGlossary';
import { useLanguage } from '../../context/LanguageContext';
import './GlossaryText.css';

const aliasEntries = getGlossaryAliasEntries();

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const glossaryPattern = `(${aliasEntries.map(({ alias }) => escapeRegExp(alias)).join('|')})`;

function findEntry(value) {
  const normalized = value.toLowerCase();
  return aliasEntries.find(({ alias }) => alias.toLowerCase() === normalized)?.entry;
}

function isWordPart(char) {
  return Boolean(char && /[A-Za-z0-9]/.test(char));
}

function canHighlight(text, index, match) {
  const hasLatin = /[A-Za-z]/.test(match);
  if (!hasLatin) return true;
  return !isWordPart(text[index - 1]) && !isWordPart(text[index + match.length]);
}

export default function GlossaryText({ text, className = '' }) {
  const { language } = useLanguage();

  const parts = useMemo(() => {
    if (!text || typeof text !== 'string') return [text];
    const glossaryRegex = new RegExp(glossaryPattern, 'giu');
    const output = [];
    let lastIndex = 0;
    let match;

    // Track which terms have already been highlighted — only glow on first occurrence
    const highlightedTermIds = new Set();

    while ((match = glossaryRegex.exec(text)) !== null) {
      const value = match[0];
      const index = match.index;
      if (!canHighlight(text, index, value)) continue;
      const entry = findEntry(value);
      if (!entry) continue;

      // Skip if this term was already highlighted once
      if (highlightedTermIds.has(entry.id)) continue;
      highlightedTermIds.add(entry.id);

      if (index > lastIndex) {
        output.push(text.slice(lastIndex, index));
      }
      output.push({ value, entry });
      lastIndex = index + value.length;
    }

    if (lastIndex < text.length) {
      output.push(text.slice(lastIndex));
    }

    return output.length ? output : [text];
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (typeof part === 'string') return part;

        const definition = language === 'ar' ? part.entry.definitionAr : part.entry.definitionEn;
        const example = language === 'ar' ? part.entry.exampleAr : part.entry.exampleEn;

        return (
          <span key={`${part.entry.id}-${index}`} className="glossary-term" tabIndex={0}>
            {part.value}
            <span className="glossary-term__panel" role="tooltip">
              <span className="glossary-term__name">
                <span dir="ltr">{part.entry.termEn}</span>
                <span>{part.entry.termAr}</span>
              </span>
              <span className="glossary-term__definition">{definition}</span>
              <span className="glossary-term__example">{example}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
