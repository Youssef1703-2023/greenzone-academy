import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  ListChecks,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { deleteQuiz, getPhases, getQuizzes, saveQuiz } from '../../services/adminDataService';
import {
  AdminBadge,
  AdminErrorState,
  AdminModal,
  AdminPageHeader,
  AdminToolbar,
  ConfirmModal,
  formatAdminValue,
  useAdminData,
} from './AdminShared';
import './AdminPages.css';

const BLANK_OPTIONS = ['', '', '', ''];

function blankQuestion() {
  return {
    prompt: '',
    options: [...BLANK_OPTIONS],
    correctAnswerIndex: 0,
  };
}

function createDraft(quiz, phases) {
  return {
    id: quiz?.id || null,
    slug: quiz?.slug || '',
    title: quiz?.title || '',
    phaseRecordId: quiz?.phaseRecordId || phases[0]?.id || '',
    passingScore: quiz?.passingScore ?? 70,
    status: quiz?.status || 'Draft',
    questions: quiz?.questions?.length
      ? quiz.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt || question.text || '',
        options: [...question.options, ...BLANK_OPTIONS].slice(0, 4),
        correctAnswerIndex: Number(question.correctAnswerIndex || 0),
      }))
      : [blankQuestion()],
  };
}

function validateQuizDraft(draft) {
  const errors = [];
  if (!draft.title.trim()) errors.push('Quiz title is required.');
  if (!draft.phaseRecordId) errors.push('Choose a phase for this quiz.');
  if (!Number.isFinite(Number(draft.passingScore)) || Number(draft.passingScore) < 1 || Number(draft.passingScore) > 100) {
    errors.push('Passing score must be between 1 and 100.');
  }
  if (!draft.questions.length) errors.push('Add at least one question.');

  draft.questions.forEach((question, questionIndex) => {
    const number = questionIndex + 1;
    if (!question.prompt.trim()) errors.push(`Question ${number} needs a prompt.`);
    const filledOptions = question.options.filter((option) => option.trim());
    if (filledOptions.length < 2) errors.push(`Question ${number} needs at least two options.`);
    if (!question.options[question.correctAnswerIndex]?.trim()) errors.push(`Question ${number} needs a valid correct answer.`);
  });

  return errors;
}

function AdminQuizBuilder({ quiz, phases, onCancel, onSave }) {
  const [draft, setDraft] = useState(() => createDraft(quiz, phases));
  const [errors, setErrors] = useState([]);
  const [mode, setMode] = useState('build');
  const [saving, setSaving] = useState(false);

  const selectedPhase = phases.find((phase) => String(phase.id) === String(draft.phaseRecordId));
  const readyQuestions = draft.questions.filter((question) => (
    question.prompt.trim()
    && question.options.filter((option) => option.trim()).length >= 2
    && question.options[question.correctAnswerIndex]?.trim()
  )).length;

  const patchDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const patchQuestion = (index, patch) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) => (
        questionIndex === index ? { ...question, ...patch } : question
      )),
    }));
  };

  const patchOption = (questionIndex, optionIndex, value) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, index) => {
        if (index !== questionIndex) return question;
        const options = question.options.map((option, currentOptionIndex) => (
          currentOptionIndex === optionIndex ? value : option
        ));
        return { ...question, options };
      }),
    }));
  };

  const addQuestion = () => {
    setDraft((current) => ({ ...current, questions: [...current.questions, blankQuestion()] }));
  };

  const duplicateQuestion = (index) => {
    setDraft((current) => {
      const source = current.questions[index];
      const copy = {
        prompt: `${source.prompt} Copy`.trim(),
        options: [...source.options],
        correctAnswerIndex: source.correctAnswerIndex,
      };
      return {
        ...current,
        questions: [
          ...current.questions.slice(0, index + 1),
          copy,
          ...current.questions.slice(index + 1),
        ],
      };
    });
  };

  const removeQuestion = (index) => {
    setDraft((current) => ({
      ...current,
      questions: current.questions.length > 1
        ? current.questions.filter((_, questionIndex) => questionIndex !== index)
        : [blankQuestion()],
    }));
  };

  const moveQuestion = (index, direction) => {
    setDraft((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.questions.length) return current;
      const questions = [...current.questions];
      const [question] = questions.splice(index, 1);
      questions.splice(nextIndex, 0, question);
      return { ...current, questions };
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const validationErrors = validateQuizDraft(draft);
    setErrors(validationErrors);
    if (validationErrors.length) return;

    setSaving(true);
    try {
      await onSave({
        ...quiz,
        ...draft,
        phaseRecordId: draft.phaseRecordId,
        phaseId: selectedPhase?.order,
        phaseTitle: selectedPhase?.title,
        passingScore: Number(draft.passingScore),
        questions: draft.questions.map((question) => ({
          ...question,
          prompt: question.prompt.trim(),
          options: question.options.map((option) => option.trim()),
          correctAnswerIndex: Number(question.correctAnswerIndex),
        })),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form id="quiz-builder-form" className="quiz-builder" onSubmit={handleSave}>
      <div className="quiz-builder__topbar">
        <div>
          <span className="quiz-builder__eyebrow">Quiz Builder</span>
          <h3>{draft.title || 'Untitled Quiz'}</h3>
          <p>{selectedPhase?.title || 'No phase selected'} · {readyQuestions}/{draft.questions.length} ready questions</p>
        </div>
        <div className="quiz-builder__mode-switch" role="tablist" aria-label="Quiz builder mode">
          <button type="button" className={mode === 'build' ? 'active' : ''} onClick={() => setMode('build')}>
            <ListChecks size={16} /> Build
          </button>
          <button type="button" className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')}>
            <Eye size={16} /> Preview
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="quiz-builder__errors">
          {errors.map((error) => <span key={error}>{error}</span>)}
        </div>
      )}

      <div className="quiz-builder__settings">
        <label>
          <span>Quiz Title</span>
          <input className="form-control" value={draft.title} onChange={(event) => patchDraft({ title: event.target.value })} placeholder="Phase 1 Quiz" />
        </label>
        <label>
          <span>Phase</span>
          <select className="form-control" value={draft.phaseRecordId} onChange={(event) => patchDraft({ phaseRecordId: event.target.value })}>
            {phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.title}</option>)}
          </select>
        </label>
        <label>
          <span>Passing Score</span>
          <input className="form-control" type="number" min="1" max="100" value={draft.passingScore} onChange={(event) => patchDraft({ passingScore: event.target.value })} />
        </label>
        <label>
          <span>Status</span>
          <select className="form-control" value={draft.status} onChange={(event) => patchDraft({ status: event.target.value })}>
            <option>Draft</option>
            <option>Published</option>
            <option>Archived</option>
          </select>
        </label>
      </div>

      {mode === 'build' ? (
        <div className="quiz-builder__questions">
          {draft.questions.map((question, questionIndex) => (
            <article className="quiz-question-editor" key={`${question.id || 'new'}-${questionIndex}`}>
              <div className="quiz-question-editor__header">
                <div>
                  <span>Question {questionIndex + 1}</span>
                  <strong>{question.prompt || 'New question'}</strong>
                </div>
                <div className="quiz-question-editor__actions">
                  <button type="button" onClick={() => moveQuestion(questionIndex, -1)} disabled={questionIndex === 0} aria-label="Move question up"><ArrowUp size={15} /></button>
                  <button type="button" onClick={() => moveQuestion(questionIndex, 1)} disabled={questionIndex === draft.questions.length - 1} aria-label="Move question down"><ArrowDown size={15} /></button>
                  <button type="button" onClick={() => duplicateQuestion(questionIndex)} aria-label="Duplicate question"><RotateCcw size={15} /></button>
                  <button type="button" className="danger" onClick={() => removeQuestion(questionIndex)} aria-label="Delete question"><Trash2 size={15} /></button>
                </div>
              </div>

              <label className="quiz-question-editor__prompt">
                <span>Prompt</span>
                <textarea className="form-control" rows="3" value={question.prompt} onChange={(event) => patchQuestion(questionIndex, { prompt: event.target.value })} placeholder="Write the question students will answer..." />
              </label>

              <div className="quiz-question-editor__options">
                {question.options.map((option, optionIndex) => (
                  <label className="quiz-option-editor" key={optionIndex}>
                    <input
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={question.correctAnswerIndex === optionIndex}
                      onChange={() => patchQuestion(questionIndex, { correctAnswerIndex: optionIndex })}
                    />
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    <input className="form-control" value={option} onChange={(event) => patchOption(questionIndex, optionIndex, event.target.value)} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} />
                  </label>
                ))}
              </div>
            </article>
          ))}

          <button type="button" className="quiz-builder__add-question" onClick={addQuestion}>
            <Plus size={18} /> Add Question
          </button>
        </div>
      ) : (
        <div className="quiz-preview">
          <div className="quiz-preview__summary">
            <ClipboardCheck size={22} />
            <div>
              <strong>{draft.title || 'Untitled Quiz'}</strong>
              <span>{draft.questions.length} questions · Pass at {draft.passingScore}% · {draft.status}</span>
            </div>
          </div>
          {draft.questions.map((question, questionIndex) => (
            <article className="quiz-preview__question" key={questionIndex}>
              <span>Question {questionIndex + 1}</span>
              <h4>{question.prompt || 'Empty question prompt'}</h4>
              <div className="quiz-preview__options">
                {question.options.map((option, optionIndex) => (
                  <div className={question.correctAnswerIndex === optionIndex ? 'correct' : ''} key={optionIndex}>
                    {question.correctAnswerIndex === optionIndex && <CheckCircle2 size={15} />}
                    <strong>{String.fromCharCode(65 + optionIndex)}</strong>
                    {option || 'Empty option'}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="quiz-builder__footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Quiz'}</button>
      </div>
    </form>
  );
}

export default function AdminQuizzesPage() {
  const { language, t } = useLanguage();
  const { data: phases, error: phasesError } = useAdminData(getPhases, []);
  const { data: quizzes, loading, error, refresh } = useAdminData(getQuizzes, []);
  const [query, setQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [builderError, setBuilderError] = useState('');

  const filtered = useMemo(() => quizzes.filter((quiz) => {
    const text = `${quiz.title} ${quiz.phaseTitle}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (phaseFilter === 'All' || String(quiz.phaseId) === String(phaseFilter))
      && (statusFilter === 'All' || quiz.status === statusFilter);
  }), [phaseFilter, query, quizzes, statusFilter]);

  const summary = useMemo(() => ({
    total: quizzes.length,
    published: quizzes.filter((quiz) => quiz.status === 'Published').length,
    questions: quizzes.reduce((sum, quiz) => sum + Number(quiz.questionsCount || 0), 0),
    averagePassRate: formatAdminValue(
      Math.round(
        quizzes
          .map((quiz) => Number(quiz.passRate))
          .filter(Number.isFinite)
          .reduce((sum, value, _, values) => sum + (value / values.length), 0),
      ) || null,
      language,
      '%',
    ),
  }), [language, quizzes]);

  const openNewQuiz = () => {
    setBuilderError('');
    setEditing({ status: 'Draft', passingScore: 70, questions: [blankQuestion()] });
  };

  const openEditQuiz = (quiz) => {
    setBuilderError('');
    setEditing(quiz);
  };

  const handleSave = async (record) => {
    try {
      setBuilderError('');
      await saveQuiz(record);
      setEditing(null);
      await refresh();
    } catch (saveError) {
      setBuilderError(saveError?.message || 'Quiz could not be saved.');
      throw saveError;
    }
  };

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader
          title={t('admin.manageQuizzes')}
          subtitle="Create phase quizzes, manage questions, preview answers, and publish when ready."
          actions={<button className="btn btn-primary" onClick={openNewQuiz} disabled={!phases.length}><Plus size={18} />{t('admin.addQuiz')}</button>}
        />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {(error || phasesError) && <AdminErrorState message={error || phasesError} />}

        <div className="quiz-admin-summary">
          <div><span>Total Quizzes</span><strong>{summary.total}</strong></div>
          <div><span>Published</span><strong>{summary.published}</strong></div>
          <div><span>Total Questions</span><strong>{summary.questions}</strong></div>
          <div><span>Average Pass Rate</span><strong>{summary.averagePassRate}</strong></div>
        </div>

        <AdminToolbar>
          <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.searchQuizzes')} />
          <select className="form-control" value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}>
            <option value="All">{t('admin.allPhases')}</option>
            {phases.map((phase) => <option key={phase.id} value={phase.order}>{phase.title}</option>)}
          </select>
          <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">{t('admin.allStatuses')}</option>
            <option value="Published">{t('admin.published')}</option>
            <option value="Draft">{t('admin.draft')}</option>
            <option value="Archived">Archived</option>
          </select>
        </AdminToolbar>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.quiz')}</th>
                <th>{t('admin.phase')}</th>
                <th>{t('admin.questions')}</th>
                <th>{t('admin.passingScore')}</th>
                <th>{t('admin.attempts')}</th>
                <th>{t('admin.averageScore')}</th>
                <th>{t('admin.passRate')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quiz) => (
                <tr key={quiz.id}>
                  <td className="admin-table__highlight">
                    <div className="quiz-table-title">
                      <strong>{quiz.title}</strong>
                      <span>{quiz.slug}</span>
                    </div>
                  </td>
                  <td>{quiz.phaseTitle}</td>
                  <td>{quiz.questionsCount}</td>
                  <td>{quiz.passingScore}%</td>
                  <td>{quiz.attempts}</td>
                  <td>{formatAdminValue(quiz.averageScore, language, '%')}</td>
                  <td>{formatAdminValue(quiz.passRate, language, '%')}</td>
                  <td><AdminBadge status={quiz.status} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-table__btn" onClick={() => setViewing(quiz)}><Eye size={14} />Preview</button>
                      <button className="admin-table__btn" onClick={() => openEditQuiz(quiz)}><Pencil size={14} />Builder</button>
                      <button className="admin-table__btn admin-table__btn--danger" onClick={() => setDeleting(quiz)}><Trash2 size={14} />{t('admin.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <AdminModal wide title={editing.id ? 'Edit Quiz Builder' : 'New Quiz Builder'} onClose={() => setEditing(null)}>
            {builderError && <AdminErrorState message={builderError} />}
            <AdminQuizBuilder
              quiz={editing}
              phases={phases}
              onCancel={() => setEditing(null)}
              onSave={handleSave}
            />
          </AdminModal>
        )}

        {viewing && (
          <AdminModal wide title={viewing.title} onClose={() => setViewing(null)} footer={<button className="btn btn-primary" onClick={() => setViewing(null)}>{t('admin.close')}</button>}>
            <div className="admin-detail-grid">
              <div><span>{t('admin.attempts')}</span><strong>{viewing.attempts}</strong></div>
              <div><span>{t('admin.averageScore')}</span><strong>{formatAdminValue(viewing.averageScore, language, '%')}</strong></div>
              <div><span>{t('admin.passRate')}</span><strong>{formatAdminValue(viewing.passRate, language, '%')}</strong></div>
            </div>
            <div className="quiz-preview quiz-preview--compact">
              {viewing.questions.map((question, questionIndex) => (
                <article className="quiz-preview__question" key={question.id || questionIndex}>
                  <span>Question {questionIndex + 1}</span>
                  <h4>{question.prompt}</h4>
                  <div className="quiz-preview__options">
                    {question.options.map((option, optionIndex) => (
                      <div className={question.correctAnswerIndex === optionIndex ? 'correct' : ''} key={optionIndex}>
                        {question.correctAnswerIndex === optionIndex && <CheckCircle2 size={15} />}
                        <strong>{String.fromCharCode(65 + optionIndex)}</strong>
                        {option}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </AdminModal>
        )}

        {deleting && (
          <ConfirmModal
            danger
            title={t('admin.confirmDelete')}
            message={t('admin.databaseDeleteWarning')}
            confirmLabel={t('admin.delete')}
            onCancel={() => setDeleting(null)}
            onConfirm={async () => {
              await deleteQuiz(deleting.id, deleting.title);
              setDeleting(null);
              await refresh();
            }}
          />
        )}
      </main>
    </AdminLayout>
  );
}
