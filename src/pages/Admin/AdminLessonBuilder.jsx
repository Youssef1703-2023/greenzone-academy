import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Copy,
  Edit3,
  Eye,
  FileText,
  HelpCircle,
  Lightbulb,
  ListPlus,
  Network,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import LessonContentRenderer from '../../components/Lesson/LessonContentRenderer';

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

const EXPLANATION_BLOCK_TYPES = [
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'heading', label: 'Heading' },
  { type: 'bullets', label: 'Bullets' },
  { type: 'note', label: 'Note' },
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

function newExplanationBlock(type = 'paragraph') {
  if (type === 'heading') return { type, text: 'New heading' };
  if (type === 'bullets') return { type, items: ['First point', 'Second point'] };
  if (type === 'note') return { type, text: 'Important note for beginners.' };
  return { type: 'paragraph', text: '' };
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
        content: [newExplanationBlock('paragraph')],
      };
  }
}

function templateSections(template) {
  if (template === 'foundation') {
    return [
      {
        ...newSection('explanation'),
        title: 'Core Explanation',
        content: [
          { type: 'paragraph', text: 'Explain the concept in plain language first, then connect it to the technical idea.' },
          { type: 'heading', text: 'Beginner Example' },
          { type: 'bullets', items: ['Asset or situation', 'Threat or problem', 'Control or safer behavior'] },
          { type: 'note', text: 'Keep the learner focused on defensive, authorized use.' },
        ],
      },
      newSection('diagram'),
      newSection('practice'),
      newSection('summary'),
    ];
  }

  if (template === 'case-study') {
    return [
      newSection('example'),
      newSection('mistakes'),
      newSection('practice'),
      newSection('summary'),
    ];
  }

  return [
    newSection('explanation'),
    newSection('quiz'),
    newSection('summary'),
  ];
}

function sectionLabel(section) {
  if (section.type === 'toolCard') return section.name || 'Tool Card';
  if (section.type === 'practice') return 'Practice';
  if (section.type === 'mistakes') return 'Common Mistakes';
  if (section.type === 'summary') return 'Summary';
  return section.title || section.type;
}

function sectionTypeLabel(type) {
  return SECTION_TYPES.find((item) => item.type === type)?.label || type;
}

function cloneSection(section) {
  return JSON.parse(JSON.stringify(section));
}

function Field({ label, children, wide = false, hint }) {
  return (
    <label className={wide ? 'lesson-builder__field lesson-builder__field--wide' : 'lesson-builder__field'}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function updateListItem(list, index, value) {
  return list.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function moveItem(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function qualityChecks(content) {
  return [
    { label: 'Title is set', ok: Boolean(content.title?.trim()) },
    { label: 'Overview is written', ok: Boolean(content.overview?.trim()) },
    { label: 'At least 3 objectives', ok: content.objectives.length >= 3 },
    { label: 'At least 3 key terms', ok: content.keyTerms.length >= 3 },
    { label: 'At least 4 lesson sections', ok: content.sections.length >= 4 },
    { label: 'Has practice or quiz', ok: content.sections.some((section) => ['practice', 'quiz'].includes(section.type)) },
    { label: 'Has lesson summary', ok: content.sections.some((section) => section.type === 'summary') },
  ];
}

function ExplanationBlockEditor({ block, index, onChange, onRemove, onMoveUp, onMoveDown }) {
  const type = block.type || 'paragraph';
  const value = type === 'bullets' ? listToLines(block.items) : block.text || '';

  return (
    <div className="lesson-builder__block">
      <div className="lesson-builder__block-header">
        <select
          value={type}
          onChange={(event) => onChange({ ...newExplanationBlock(event.target.value), ...(event.target.value === type ? block : {}) })}
        >
          {EXPLANATION_BLOCK_TYPES.map((item) => (
            <option key={item.type} value={item.type}>{item.label}</option>
          ))}
        </select>
        <div className="lesson-builder__block-actions">
          <button type="button" onClick={onMoveUp} aria-label="Move block up"><ArrowUp size={14} /></button>
          <button type="button" onClick={onMoveDown} aria-label="Move block down"><ArrowDown size={14} /></button>
          <button type="button" onClick={onRemove} aria-label="Remove block"><Trash2 size={14} /></button>
        </div>
      </div>
      <textarea
        value={value}
        placeholder={type === 'bullets' ? 'One bullet per line' : `Write ${sectionTypeLabel(type).toLowerCase()} text`}
        onChange={(event) => {
          if (type === 'bullets') {
            onChange({ ...block, type, items: linesToList(event.target.value) });
          } else {
            onChange({ ...block, type, text: event.target.value });
          }
        }}
      />
      <small>Block {index + 1}: {type === 'bullets' ? 'each line becomes a bullet' : 'rendered directly in the student lesson'}</small>
    </div>
  );
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
  return (
    <div className="lesson-builder__section-form lesson-builder__section-form--single">
      <Field label="Section title" wide><input value={section.title || ''} onChange={(event) => onChange({ ...section, title: event.target.value })} /></Field>
      <div className="lesson-builder__block-toolbar">
        {EXPLANATION_BLOCK_TYPES.map((blockType) => (
          <button
            type="button"
            key={blockType.type}
            onClick={() => onChange({ ...section, content: [...content, newExplanationBlock(blockType.type)] })}
          >
            <Plus size={14} /> {blockType.label}
          </button>
        ))}
      </div>
      {content.length === 0 && (
        <div className="lesson-builder__empty">Add a paragraph, heading, bullets, or note to build this explanation.</div>
      )}
      {content.map((block, index) => (
        <ExplanationBlockEditor
          key={`block-${index}`}
          block={block}
          index={index}
          onChange={(nextBlock) => onChange({ ...section, content: updateListItem(content, index, nextBlock) })}
          onRemove={() => onChange({ ...section, content: content.filter((_, itemIndex) => itemIndex !== index) })}
          onMoveUp={() => onChange({ ...section, content: moveItem(content, index, index - 1) })}
          onMoveDown={() => onChange({ ...section, content: moveItem(content, index, index + 1) })}
        />
      ))}
    </div>
  );
}

function LessonPreview({ content }) {
  return (
    <div className="lesson-builder-preview">
      <div className="lesson-builder-preview__chrome">
        <span>Student preview</span>
        <strong>{content.title || 'Untitled lesson'}</strong>
      </div>
      <div className="lesson-builder-preview__body">
        <LessonContentRenderer content={content} />
      </div>
    </div>
  );
}

export default function AdminLessonBuilder({ value, onChange, fallbackTitle, onPreview }) {
  const content = useMemo(() => normalizeContent(value, fallbackTitle), [fallbackTitle, value]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState('edit');
  const activeSection = content.sections[activeIndex] || null;
  const checks = qualityChecks(content);
  const passedChecks = checks.filter((check) => check.ok).length;

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
    setMode('edit');
  }

  function addTemplate(template) {
    const sections = [...content.sections, ...templateSections(template)];
    patch({ sections });
    setActiveIndex(content.sections.length);
    setMode('edit');
  }

  function removeSection(index) {
    const sections = content.sections.filter((_, itemIndex) => itemIndex !== index);
    patch({ sections });
    setActiveIndex(Math.max(0, Math.min(index, sections.length - 1)));
  }

  function duplicateSection(index) {
    const sections = [...content.sections];
    sections.splice(index + 1, 0, cloneSection(content.sections[index]));
    patch({ sections });
    setActiveIndex(index + 1);
  }

  function moveSection(index, direction) {
    const nextIndex = index + direction;
    const sections = moveItem(content.sections, index, nextIndex);
    patch({ sections });
    setActiveIndex(Math.max(0, Math.min(nextIndex, sections.length - 1)));
  }

  return (
    <section className="lesson-builder">
      <div className="lesson-builder__heading">
        <div>
          <span>Lesson Builder</span>
          <h3>Build and preview the student-facing lesson</h3>
        </div>
        <div className="lesson-builder__heading-actions">
          <div className="lesson-builder__count">{content.sections.length} sections</div>
          <div className="lesson-builder__mode-switch" role="tablist" aria-label="Lesson builder mode">
            <button type="button" className={mode === 'edit' ? 'is-active' : ''} onClick={() => setMode('edit')}><Edit3 size={14} /> Edit</button>
            <button
              type="button"
              className={mode === 'preview' ? 'is-active' : ''}
              onClick={() => {
                setMode('preview');
                onPreview?.();
              }}
            >
              <Eye size={14} /> Preview
            </button>
          </div>
        </div>
      </div>

      {mode === 'preview' ? (
        <LessonPreview content={content} />
      ) : (
        <>
          <div className="lesson-builder__quality">
            <div className="lesson-builder__quality-score">
              <Sparkles size={18} />
              <strong>{passedChecks}/{checks.length}</strong>
              <span>publish readiness</span>
            </div>
            <div className="lesson-builder__quality-list">
              {checks.map((check) => (
                <span key={check.label} className={check.ok ? 'is-ok' : 'is-warn'}>
                  {check.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {check.label}
                </span>
              ))}
            </div>
          </div>

          <div className="lesson-builder__basics">
            <Field label="Lesson title"><input value={content.title} onChange={(event) => patch({ title: event.target.value })} /></Field>
            <Field label="Credit"><input value={content.credit} onChange={(event) => patch({ credit: event.target.value })} /></Field>
            <Field label="Overview" wide hint="This appears at the top of the lesson and in the preview.">
              <textarea value={content.overview} onChange={(event) => patch({ overview: event.target.value })} />
            </Field>
            <Field label="Objectives, one per line" wide>
              <textarea value={listToLines(content.objectives)} onChange={(event) => patch({ objectives: linesToList(event.target.value) })} />
            </Field>
            <Field label="Key terms: Term: Definition" wide>
              <textarea value={keyTermsToText(content.keyTerms)} onChange={(event) => patch({ keyTerms: textToKeyTerms(event.target.value) })} />
            </Field>
          </div>

          <div className="lesson-builder__templates">
            <span>Quick starts</span>
            <button type="button" onClick={() => addTemplate('foundation')}><Sparkles size={14} /> Foundation lesson</button>
            <button type="button" onClick={() => addTemplate('case-study')}><Lightbulb size={14} /> Case study flow</button>
            <button type="button" onClick={() => addTemplate('assessment')}><HelpCircle size={14} /> Quiz + summary</button>
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
                    <span>
                      <ListPlus size={14} />
                      <b>{index + 1}</b>
                      {sectionLabel(section)}
                    </span>
                    <em>{sectionTypeLabel(section.type)}</em>
                  </button>
                ))}
              </div>
            </aside>

            <div className="lesson-builder__editor">
              <div className="lesson-builder__editor-toolbar">
                <div>
                  <span>Selected section</span>
                  <strong>{activeSection ? sectionLabel(activeSection) : 'None selected'}</strong>
                </div>
                {activeSection && (
                  <div className="lesson-builder__editor-actions">
                    <button type="button" onClick={() => moveSection(activeIndex, -1)} disabled={activeIndex === 0}><ArrowUp size={14} /></button>
                    <button type="button" onClick={() => moveSection(activeIndex, 1)} disabled={activeIndex === content.sections.length - 1}><ArrowDown size={14} /></button>
                    <button type="button" onClick={() => duplicateSection(activeIndex)}><Copy size={14} /></button>
                    <button type="button" onClick={() => removeSection(activeIndex)}><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <SectionEditor section={activeSection} onChange={(section) => patchSection(activeIndex, section)} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
