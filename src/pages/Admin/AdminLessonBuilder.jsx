import { useMemo, useState } from 'react';
import {
  BookOpen,
  Boxes,
  ClipboardList,
  FileText,
  HelpCircle,
  Lightbulb,
  ListPlus,
  Network,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

const SECTION_TYPES = [
  { type: 'explanation', label: 'Explanation', icon: FileText },
  { type: 'diagram', label: 'Diagram', icon: Network },
  { type: 'toolCard', label: 'Tool Card', icon: ShieldCheck },
  { type: 'example', label: 'Example', icon: Lightbulb },
  { type: 'mistakes', label: 'Mistakes', icon: Boxes },
  { type: 'practice', label: 'Practice', icon: ClipboardList },
  { type: 'quiz', label: 'Mini Quiz', icon: HelpCircle },
  { type: 'summary', label: 'Summary', icon: BookOpen },
];

function linesToList(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function keyTermsToText(value) {
  if (!Array.isArray(value)) return '';
  return value.map((item) => `${item.term || ''}: ${item.definition || ''}`).join('\n');
}

function textToKeyTerms(value) {
  return linesToList(value).map((line) => {
    const separator = line.includes(':') ? ':' : '-';
    const [term, ...definitionParts] = line.split(separator);
    return {
      term: term?.trim() || 'Term',
      definition: definitionParts.join(separator).trim() || '',
    };
  });
}

function normalizeContent(content, fallbackTitle = '') {
  return {
    title: content?.title || fallbackTitle || '',
    credit: content?.credit || 'Prepared by: JoeTech',
    overview: content?.overview || '',
    objectives: Array.isArray(content?.objectives) ? content.objectives : [],
    keyTerms: Array.isArray(content?.keyTerms) ? content.keyTerms : [],
    sections: Array.isArray(content?.sections) ? content.sections : [],
  };
}

function newSection(type) {
  switch (type) {
    case 'diagram':
      return {
        type,
        title: 'New Diagram',
        nodes: ['First idea', 'Second idea', 'Third idea'],
        centerLabel: 'Main Concept',
      };
    case 'toolCard':
      return {
        type,
        name: 'Security Concept',
        category: 'Core Concept',
        description: '',
        whyItMatters: '',
        beginnerNote: '',
      };
    case 'example':
      return {
        type,
        title: 'Real-World Example',
        scenario: '',
        whatHappened: '',
        securityLesson: '',
      };
    case 'mistakes':
      return {
        type,
        items: [
          {
            mistake: 'Common mistake',
            whyRisky: '',
            betterPractice: '',
          },
        ],
      };
    case 'practice':
      return {
        type,
        question: 'Practice task',
        hint: '',
      };
    case 'quiz':
      return {
        type,
        title: 'Check Your Understanding',
        questions: [
          {
            question: 'Question text',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswerIndex: 0,
          },
        ],
      };
    case 'summary':
      return {
        type,
        takeaways: ['Key takeaway'],
      };
    case 'explanation':
    default:
      return {
        type: 'explanation',
        title: 'New Section',
        content: [
          {
            type: 'paragraph',
            text: '',
          },
        ],
      };
  }
}

function sectionLabel(section) {
  if (section.type === 'toolCard') return section.name || 'Tool Card';
  if (section.type === 'practice') return 'Practice';
  if (section.type === 'mistakes') return 'Common Mistakes';
  if (section.type === 'summary') return 'Summary';
  return section.title || section.type;
}

function Field({ label, children, wide = false }) {
  return (
    <label className={wide ? 'lesson-builder__field lesson-builder__field--wide' : 'lesson-builder__field'}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function updateListItem(list, index, value) {
  return list.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function SectionEditor({ section, onChange }) {
  if (!section) {
    return (
      <div className="lesson-builder__empty">
        Select a section to edit it, or add a new block from the left.
      </div>
    );
  }

  if (section.type === 'diagram') {
    return (
      <div className="lesson-builder__section-form">
        <Field label="Title"><input value={section.title || ''} onChange={(event) => onChange({ ...section, title: event.target.value })} /></Field>
        <Field label="Center label"><input value={section.centerLabel || ''} onChange={(event) => onChange({ ...section, centerLabel: event.target.value })} /></Field>
        <Field label="Nodes, one per line" wide>
          <textarea value={listToLines(section.nodes)} onChange={(event) => onChange({ ...section, nodes: linesToList(event.target.value) })} />
        </Field>
      </div>
    );
  }

  if (section.type === 'toolCard') {
    return (
      <div className="lesson-builder__section-form">
        <Field label="Name"><input value={section.name || ''} onChange={(event) => onChange({ ...section, name: event.target.value })} /></Field>
        <Field label="Category"><input value={section.category || ''} onChange={(event) => onChange({ ...section, category: event.target.value })} /></Field>
        <Field label="Description" wide><textarea value={section.description || ''} onChange={(event) => onChange({ ...section, description: event.target.value })} /></Field>
        <Field label="Why it matters" wide><textarea value={section.whyItMatters || ''} onChange={(event) => onChange({ ...section, whyItMatters: event.target.value })} /></Field>
        <Field label="Beginner note" wide><textarea value={section.beginnerNote || ''} onChange={(event) => onChange({ ...section, beginnerNote: event.target.value })} /></Field>
      </div>
    );
  }

  if (section.type === 'example') {
    return (
      <div className="lesson-builder__section-form">
        <Field label="Title"><input value={section.title || ''} onChange={(event) => onChange({ ...section, title: event.target.value })} /></Field>
        <Field label="Scenario" wide><textarea value={section.scenario || ''} onChange={(event) => onChange({ ...section, scenario: event.target.value })} /></Field>
        <Field label="What happened" wide><textarea value={section.whatHappened || ''} onChange={(event) => onChange({ ...section, whatHappened: event.target.value })} /></Field>
        <Field label="Security lesson" wide><textarea value={section.securityLesson || ''} onChange={(event) => onChange({ ...section, securityLesson: event.target.value })} /></Field>
      </div>
    );
  }

  if (section.type === 'mistakes') {
    const items = Array.isArray(section.items) ? section.items : [];
    return (
      <div className="lesson-builder__section-form lesson-builder__repeat-list">
        {items.map((item, index) => (
          <div className="lesson-builder__repeat-item" key={`mistake-${index}`}>
            <div className="lesson-builder__repeat-header">
              <strong>Mistake {index + 1}</strong>
              <button type="button" onClick={() => onChange({ ...section, items: items.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={14} /></button>
            </div>
            <Field label="Mistake" wide><input value={item.mistake || ''} onChange={(event) => onChange({ ...section, items: updateListItem(items, index, { ...item, mistake: event.target.value }) })} /></Field>
            <Field label="Why risky" wide><textarea value={item.whyRisky || ''} onChange={(event) => onChange({ ...section, items: updateListItem(items, index, { ...item, whyRisky: event.target.value }) })} /></Field>
            <Field label="Better practice" wide><textarea value={item.betterPractice || ''} onChange={(event) => onChange({ ...section, items: updateListItem(items, index, { ...item, betterPractice: event.target.value }) })} /></Field>
          </div>
        ))}
        <button type="button" className="lesson-builder__mini-button" onClick={() => onChange({ ...section, items: [...items, { mistake: '', whyRisky: '', betterPractice: '' }] })}>
          <Plus size={14} /> Add mistake
        </button>
      </div>
    );
  }

  if (section.type === 'practice') {
    return (
      <div className="lesson-builder__section-form">
        <Field label="Question" wide><textarea value={section.question || ''} onChange={(event) => onChange({ ...section, question: event.target.value })} /></Field>
        <Field label="Hint" wide><textarea value={section.hint || ''} onChange={(event) => onChange({ ...section, hint: event.target.value })} /></Field>
      </div>
    );
  }

  if (section.type === 'quiz') {
    const questions = Array.isArray(section.questions) ? section.questions : [];
    return (
      <div className="lesson-builder__section-form lesson-builder__repeat-list">
        <Field label="Title" wide><input value={section.title || ''} onChange={(event) => onChange({ ...section, title: event.target.value })} /></Field>
        {questions.map((question, index) => (
          <div className="lesson-builder__repeat-item" key={`quiz-${index}`}>
            <div className="lesson-builder__repeat-header">
              <strong>Question {index + 1}</strong>
              <button type="button" onClick={() => onChange({ ...section, questions: questions.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={14} /></button>
            </div>
            <Field label="Question" wide><textarea value={question.question || ''} onChange={(event) => onChange({ ...section, questions: updateListItem(questions, index, { ...question, question: event.target.value }) })} /></Field>
            <Field label="Options, one per line" wide><textarea value={listToLines(question.options)} onChange={(event) => onChange({ ...section, questions: updateListItem(questions, index, { ...question, options: linesToList(event.target.value) }) })} /></Field>
            <Field label="Correct answer index"><input type="number" min="0" value={question.correctAnswerIndex || 0} onChange={(event) => onChange({ ...section, questions: updateListItem(questions, index, { ...question, correctAnswerIndex: Number(event.target.value) }) })} /></Field>
          </div>
        ))}
        <button type="button" className="lesson-builder__mini-button" onClick={() => onChange({ ...section, questions: [...questions, { question: '', options: ['Option A', 'Option B'], correctAnswerIndex: 0 }] })}>
          <Plus size={14} /> Add question
        </button>
      </div>
    );
  }

  if (section.type === 'summary') {
    return (
      <div className="lesson-builder__section-form">
        <Field label="Takeaways, one per line" wide>
          <textarea value={listToLines(section.takeaways)} onChange={(event) => onChange({ ...section, takeaways: linesToList(event.target.value) })} />
        </Field>
      </div>
    );
  }

  const content = Array.isArray(section.content) ? section.content : [];
  const body = content.map((item) => item.text || '').join('\n\n');
  return (
    <div className="lesson-builder__section-form">
      <Field label="Title"><input value={section.title || ''} onChange={(event) => onChange({ ...section, title: event.target.value })} /></Field>
      <Field label="Paragraphs, separated by blank lines" wide>
        <textarea
          value={body}
          onChange={(event) => onChange({
            ...section,
            content: String(event.target.value)
              .split(/\n\s*\n/g)
              .map((text) => text.trim())
              .filter(Boolean)
              .map((text) => ({ type: 'paragraph', text })),
          })}
        />
      </Field>
    </div>
  );
}

export default function AdminLessonBuilder({ value, onChange, fallbackTitle }) {
  const content = useMemo(() => normalizeContent(value, fallbackTitle), [fallbackTitle, value]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSection = content.sections[activeIndex] || null;

  function patch(nextPatch) {
    onChange({ ...content, ...nextPatch });
  }

  function patchSection(index, section) {
    const sections = content.sections.map((item, itemIndex) => (itemIndex === index ? section : item));
    patch({ sections });
  }

  function addSection(type) {
    const sections = [...content.sections, newSection(type)];
    patch({ sections });
    setActiveIndex(sections.length - 1);
  }

  function removeSection(index) {
    const sections = content.sections.filter((_, itemIndex) => itemIndex !== index);
    patch({ sections });
    setActiveIndex(Math.max(0, Math.min(index, sections.length - 1)));
  }

  return (
    <section className="lesson-builder">
      <div className="lesson-builder__heading">
        <div>
          <span>Lesson Builder</span>
          <h3>Build the student-facing lesson content</h3>
        </div>
        <div className="lesson-builder__count">{content.sections.length} sections</div>
      </div>

      <div className="lesson-builder__basics">
        <Field label="Lesson title"><input value={content.title} onChange={(event) => patch({ title: event.target.value })} /></Field>
        <Field label="Credit"><input value={content.credit} onChange={(event) => patch({ credit: event.target.value })} /></Field>
        <Field label="Overview" wide><textarea value={content.overview} onChange={(event) => patch({ overview: event.target.value })} /></Field>
        <Field label="Objectives, one per line" wide><textarea value={listToLines(content.objectives)} onChange={(event) => patch({ objectives: linesToList(event.target.value) })} /></Field>
        <Field label="Key terms: Term: Definition" wide><textarea value={keyTermsToText(content.keyTerms)} onChange={(event) => patch({ keyTerms: textToKeyTerms(event.target.value) })} /></Field>
      </div>

      <div className="lesson-builder__workspace">
        <aside className="lesson-builder__sidebar">
          <div className="lesson-builder__add-grid">
            {SECTION_TYPES.map(({ type, label, icon: Icon }) => (
              <button type="button" key={type} onClick={() => addSection(type)}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <div className="lesson-builder__section-list">
            {content.sections.map((section, index) => (
              <button
                type="button"
                key={`${section.type}-${index}`}
                className={index === activeIndex ? 'lesson-builder__section-tab lesson-builder__section-tab--active' : 'lesson-builder__section-tab'}
                onClick={() => setActiveIndex(index)}
              >
                <span><ListPlus size={14} /> {sectionLabel(section)}</span>
                <Trash2 size={14} onClick={(event) => { event.stopPropagation(); removeSection(index); }} />
              </button>
            ))}
          </div>
        </aside>

        <div className="lesson-builder__editor">
          <SectionEditor section={activeSection} onChange={(section) => patchSection(activeIndex, section)} />
        </div>
      </div>
    </section>
  );
}
