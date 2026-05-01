import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { deleteQuiz, getPhases, getQuizzes, saveQuiz } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, ConfirmModal, formatAdminValue, useAdminData } from './AdminShared';
import './AdminPages.css';

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

  const filtered = useMemo(() => quizzes.filter((quiz) => {
    const text = `${quiz.title} ${quiz.phaseTitle}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (phaseFilter === 'All' || String(quiz.phaseId) === String(phaseFilter))
      && (statusFilter === 'All' || quiz.status === statusFilter);
  }), [phaseFilter, query, quizzes, statusFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phase = phases.find((item) => String(item.id) === String(form.get('phaseId'))) || phases[0];
    await saveQuiz({
      ...editing,
      title: form.get('title'),
      phaseRecordId: phase?.id,
      phaseId: phase?.order,
      phaseTitle: phase?.title || `Phase ${form.get('phaseId')}`,
      questionsCount: Number(form.get('questionsCount')),
      passingScore: Number(form.get('passingScore')),
      status: form.get('status'),
    });
    setEditing(null);
    await refresh();
  }

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader
          title={t('admin.manageQuizzes')}
          subtitle={t('admin.manageQuizzesSubtitle')}
          actions={<button className="btn btn-primary" onClick={() => setEditing({ status: 'Draft', passingScore: 70, questionsCount: 0 })}><Plus size={18} />{t('admin.addQuiz')}</button>}
        />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {(error || phasesError) && <AdminErrorState message={error || phasesError} />}

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
                  <td className="admin-table__highlight">{quiz.title}</td>
                  <td>{quiz.phaseTitle}</td>
                  <td>{quiz.questionsCount}</td>
                  <td>{quiz.passingScore}%</td>
                  <td>{quiz.attempts}</td>
                  <td>{formatAdminValue(quiz.averageScore, language, '%')}</td>
                  <td>{formatAdminValue(quiz.passRate, language, '%')}</td>
                  <td><AdminBadge status={quiz.status} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-table__btn" onClick={() => setViewing(quiz)}><Eye size={14} />{t('admin.viewResults')}</button>
                      <button className="admin-table__btn" onClick={() => setEditing(quiz)}><Pencil size={14} />{t('admin.edit')}</button>
                      <button className="admin-table__btn admin-table__btn--danger" onClick={() => setDeleting(quiz)}><Trash2 size={14} />{t('admin.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <AdminModal title={editing.id ? t('admin.editQuiz') : t('admin.addQuiz')} onClose={() => setEditing(null)} footer={(
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>{t('common.cancel')}</button>
              <button form="quiz-form" type="submit" className="btn btn-primary">{t('admin.save')}</button>
            </>
          )}>
            <form id="quiz-form" className="admin-form-grid" onSubmit={handleSubmit}>
              <label>{t('admin.quizTitle')}<input name="title" className="form-control" defaultValue={editing.title || ''} required /></label>
              <label>{t('admin.phase')}<select name="phaseId" className="form-control" defaultValue={editing.phaseRecordId || phases[0]?.id}>{phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.title}</option>)}</select></label>
              <label>{t('admin.questions')}<input name="questionsCount" type="number" className="form-control" defaultValue={editing.questionsCount || 0} /></label>
              <label>{t('admin.passingScore')}<input name="passingScore" type="number" className="form-control" defaultValue={editing.passingScore || 70} /></label>
              <label>{t('admin.status')}<select name="status" className="form-control" defaultValue={editing.status || 'Draft'}><option>Published</option><option>Draft</option></select></label>
            </form>
          </AdminModal>
        )}

        {viewing && (
          <AdminModal title={viewing.title} onClose={() => setViewing(null)} footer={<button className="btn btn-primary" onClick={() => setViewing(null)}>{t('admin.close')}</button>}>
            <div className="admin-detail-grid">
              <span>{t('admin.attempts')}</span><strong>{viewing.attempts}</strong>
              <span>{t('admin.averageScore')}</span><strong>{formatAdminValue(viewing.averageScore, language, '%')}</strong>
              <span>{t('admin.passRate')}</span><strong>{formatAdminValue(viewing.passRate, language, '%')}</strong>
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
