import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { deletePhase, getCourses, getPhases, savePhase } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, ConfirmModal, useAdminData } from './AdminShared';
import './AdminPages.css';

export default function AdminPhasesPage() {
  const { t } = useLanguage();
  const { data: courses, error: coursesError } = useAdminData(getCourses, []);
  const { data: phases, loading, error, refresh } = useAdminData(getPhases, []);
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => phases.filter((phase) => {
    const text = `${phase.title} ${phase.courseTitle}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (courseFilter === 'All' || phase.courseId === courseFilter)
      && (statusFilter === 'All' || phase.status === statusFilter);
  }), [courseFilter, phases, query, statusFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const course = courses.find((item) => item.id === form.get('courseId')) || courses[0];
    await savePhase({
      ...editing,
      courseId: course.id,
      courseTitle: course.title,
      order: Number(form.get('order')),
      title: form.get('title'),
      status: form.get('status'),
      lessonsCount: Number(form.get('lessonsCount')),
      quizAttached: form.get('quizAttached') === 'Yes',
      previewStatus: form.get('previewStatus'),
    });
    setEditing(null);
    await refresh();
  }

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader
          title={t('admin.managePhases')}
          subtitle={t('admin.managePhasesSubtitle')}
          actions={<button className="btn btn-primary" onClick={() => setEditing({ status: 'Draft', quizAttached: true, previewStatus: 'Locked' })}><Plus size={18} />{t('admin.addPhase')}</button>}
        />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {(error || coursesError) && <AdminErrorState message={error || coursesError} />}

        <AdminToolbar>
          <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.searchPhases')} />
          <select className="form-control" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <option value="All">{t('admin.allCourses')}</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
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
                <th>{t('admin.phase')}</th>
                <th>{t('admin.course')}</th>
                <th>{t('admin.order')}</th>
                <th>{t('admin.lessons')}</th>
                <th>{t('admin.quizAttached')}</th>
                <th>{t('admin.previewStatus')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((phase) => (
                <tr key={phase.id}>
                  <td className="admin-table__highlight">{phase.title}</td>
                  <td>{phase.courseTitle}</td>
                  <td>{phase.order}</td>
                  <td>{phase.lessonsCount}</td>
                  <td>{phase.quizAttached ? t('admin.yes') : t('admin.no')}</td>
                  <td>{phase.previewStatus}</td>
                  <td><AdminBadge status={phase.status} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-table__btn" onClick={() => setEditing(phase)}><Pencil size={14} />{t('admin.edit')}</button>
                      <button className="admin-table__btn admin-table__btn--danger" onClick={() => setDeleting(phase)}><Trash2 size={14} />{t('admin.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <AdminModal title={editing.id ? t('admin.editPhase') : t('admin.addPhase')} onClose={() => setEditing(null)} footer={(
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>{t('common.cancel')}</button>
              <button form="phase-form" type="submit" className="btn btn-primary">{t('admin.save')}</button>
            </>
          )}>
            <form id="phase-form" className="admin-form-grid" onSubmit={handleSubmit}>
              <label>{t('admin.course')}<select name="courseId" className="form-control" defaultValue={editing.courseId || courses[0]?.id}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
              <label>{t('admin.order')}<input name="order" type="number" className="form-control" defaultValue={editing.order || 1} required /></label>
              <label>{t('admin.phaseTitle')}<input name="title" className="form-control" defaultValue={editing.title || ''} required /></label>
              <label>{t('admin.lessons')}<input name="lessonsCount" type="number" className="form-control" defaultValue={editing.lessonsCount || 0} /></label>
              <label>{t('admin.quizAttached')}<select name="quizAttached" className="form-control" defaultValue={editing.quizAttached ? 'Yes' : 'No'}><option>Yes</option><option>No</option></select></label>
              <label>{t('admin.previewStatus')}<select name="previewStatus" className="form-control" defaultValue={editing.previewStatus || 'Locked'}><option>Unlocked</option><option>Locked</option></select></label>
              <label>{t('admin.status')}<select name="status" className="form-control" defaultValue={editing.status || 'Draft'}><option>Published</option><option>Draft</option></select></label>
            </form>
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
              await deletePhase(deleting.id, deleting.title);
              setDeleting(null);
              await refresh();
            }}
          />
        )}
      </main>
    </AdminLayout>
  );
}
