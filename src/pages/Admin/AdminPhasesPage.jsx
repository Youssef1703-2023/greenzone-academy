import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, Layers, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { deletePhase, getCourses, getPhases, savePhase } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, ConfirmModal, useAdminData } from './AdminShared';
import './AdminPages.css';

function PhaseBuilder({ phase, courses, onChange }) {
  const [mode, setMode] = useState('edit');
  const selectedCourse = courses.find((course) => course.id === phase.courseId) || courses[0];
  const checks = [
    { label: 'Course selected', ok: Boolean(selectedCourse?.id) },
    { label: 'Phase number set', ok: Number(phase.order) > 0 },
    { label: 'Title is ready', ok: Boolean(phase.title?.trim()) },
    { label: 'Description helps the learner', ok: String(phase.description || '').trim().length >= 30 },
    { label: 'Status selected', ok: Boolean(phase.status) },
  ];
  const passed = checks.filter((check) => check.ok).length;

  function patch(nextPatch) {
    onChange({ ...phase, ...nextPatch });
  }

  return (
    <section className="content-builder">
      <div className="content-builder__header">
        <div>
          <span>Phase Builder</span>
          <h3>Shape the phase sequence, preview, and publishing state</h3>
        </div>
        <div className="lesson-builder__mode-switch">
          <button type="button" className={mode === 'edit' ? 'is-active' : ''} onClick={() => setMode('edit')}><Pencil size={14} /> Edit</button>
          <button type="button" className={mode === 'preview' ? 'is-active' : ''} onClick={() => setMode('preview')}><Eye size={14} /> Preview</button>
        </div>
      </div>

      <div className="lesson-builder__quality">
        <div className="lesson-builder__quality-score">
          <Sparkles size={18} />
          <strong>{passed}/{checks.length}</strong>
          <span>phase readiness</span>
        </div>
        <div className="lesson-builder__quality-list">
          {checks.map((check) => (
            <span key={check.label} className={check.ok ? 'is-ok' : 'is-warn'}>
              <CheckCircle2 size={14} />
              {check.label}
            </span>
          ))}
        </div>
      </div>

      {mode === 'preview' ? (
        <div className="content-builder-preview content-builder-preview--phase">
          <div className="content-builder-preview__icon"><Layers size={26} /></div>
          <div className="content-builder-preview__body">
            <span>Phase {phase.order || 1} in {selectedCourse?.title || 'Course'}</span>
            <h2>{phase.title || 'Untitled Phase'}</h2>
            <p>{phase.description || 'Add a concise phase description so students know what they are about to learn.'}</p>
            <div className="content-builder-preview__meta">
              <strong>{phase.lessonsCount || 0}</strong> lessons
              <strong>{phase.quizAttached ? 'Yes' : 'No'}</strong> quiz
              <strong>{phase.status || 'Draft'}</strong> status
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-form-grid">
          <label>Course<select className="form-control" value={phase.courseId || courses[0]?.id || ''} onChange={(event) => patch({ courseId: event.target.value })}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
          <label>Phase Number<input type="number" className="form-control" value={phase.order || 1} onChange={(event) => patch({ order: Number(event.target.value) })} required /></label>
          <label>Phase Title<input className="form-control" value={phase.title || ''} onChange={(event) => patch({ title: event.target.value })} required /></label>
          <label>Status<select className="form-control" value={phase.status || 'Draft'} onChange={(event) => patch({ status: event.target.value })}><option>Published</option><option>Draft</option></select></label>
          <label>Lessons Count<input type="number" className="form-control" value={phase.lessonsCount || 0} onChange={(event) => patch({ lessonsCount: Number(event.target.value) })} /></label>
          <label>Quiz Attached<select className="form-control" value={phase.quizAttached ? 'Yes' : 'No'} onChange={(event) => patch({ quizAttached: event.target.value === 'Yes' })}><option>Yes</option><option>No</option></select></label>
          <label className="admin-form-grid__wide">Description<textarea className="form-control" rows="5" value={phase.description || ''} onChange={(event) => patch({ description: event.target.value })} /></label>
        </div>
      )}
    </section>
  );
}

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
    const course = courses.find((item) => item.id === editing.courseId) || courses[0];
    await savePhase({
      ...editing,
      courseId: course.id,
      courseTitle: course.title,
      order: Number(editing.order || 1),
      title: editing.title,
      description: editing.description,
      status: editing.status,
      lessonsCount: Number(editing.lessonsCount || 0),
      quizAttached: Boolean(editing.quizAttached),
      previewStatus: editing.status === 'Published' ? 'Unlocked' : 'Locked',
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
          actions={<button className="btn btn-primary" onClick={() => setEditing({ courseId: courses[0]?.id, status: 'Draft', quizAttached: true, previewStatus: 'Locked', lessonsCount: 0 })}><Plus size={18} />{t('admin.addPhase')}</button>}
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
          <AdminModal wide title={editing.id ? t('admin.editPhase') : t('admin.addPhase')} onClose={() => setEditing(null)} footer={(
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>{t('common.cancel')}</button>
              <button form="phase-form" type="submit" className="btn btn-primary">{t('admin.save')}</button>
            </>
          )}>
            <form id="phase-form" className="admin-form-grid" onSubmit={handleSubmit}>
              <div className="admin-form-grid__wide">
                <PhaseBuilder phase={editing} courses={courses} onChange={setEditing} />
              </div>
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
