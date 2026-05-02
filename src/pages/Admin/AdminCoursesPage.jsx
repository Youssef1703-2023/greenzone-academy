import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Eye, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { deleteCourse, getCourses, saveCourse } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, ConfirmModal, useAdminData } from './AdminShared';
import './AdminPages.css';

const emptyCourse = {
  slug: '',
  title: '',
  description: '',
  difficulty: 'Beginner',
  status: 'Draft',
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function CourseBuilder({ course, courses, onChange }) {
  const [mode, setMode] = useState('edit');
  const slug = course.slug || slugify(course.title);
  const checks = [
    { label: 'Title is ready', ok: Boolean(course.title?.trim()) },
    { label: 'Slug is clean', ok: Boolean(slug) && /^[a-z0-9-]+$/.test(slug) },
    { label: 'Description is useful', ok: String(course.description || '').trim().length >= 40 },
    { label: 'Difficulty selected', ok: Boolean(course.difficulty) },
    { label: 'No duplicate slug', ok: !courses.some((item) => item.id !== course.id && item.slug === slug) },
  ];
  const passed = checks.filter((check) => check.ok).length;

  function patch(nextPatch) {
    onChange({ ...course, ...nextPatch });
  }

  return (
    <section className="content-builder">
      <div className="content-builder__header">
        <div>
          <span>Course Builder</span>
          <h3>Design the course shell students will see</h3>
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
          <span>course readiness</span>
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
        <div className="content-builder-preview">
          <div className="content-builder-preview__icon"><BookOpen size={26} /></div>
          <div className="content-builder-preview__body">
            <span>{course.difficulty || 'Beginner'} course</span>
            <h2>{course.title || 'Untitled Course'}</h2>
            <p>{course.description || 'Add a strong course description so students understand the learning path.'}</p>
            <div className="content-builder-preview__meta">
              <strong>{course.phasesCount || 0}</strong> phases
              <strong>{course.lessonsCount || 0}</strong> lessons
              <strong>{course.quizzesCount || 0}</strong> quizzes
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-form-grid">
          <label>Course Title<input className="form-control" value={course.title || ''} onChange={(event) => patch({ title: event.target.value, slug: course.slug || slugify(event.target.value) })} required /></label>
          <label>Slug<input className="form-control" value={slug} onChange={(event) => patch({ slug: slugify(event.target.value) })} required /></label>
          <label>Difficulty<select className="form-control" value={course.difficulty || 'Beginner'} onChange={(event) => patch({ difficulty: event.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
          <label>Status<select className="form-control" value={course.status || 'Draft'} onChange={(event) => patch({ status: event.target.value })}><option>Published</option><option>Draft</option></select></label>
          <label className="admin-form-grid__wide">Description<textarea className="form-control" rows="5" value={course.description || ''} onChange={(event) => patch({ description: event.target.value })} /></label>
        </div>
      )}
    </section>
  );
}

export default function AdminCoursesPage() {
  const { t } = useLanguage();
  const { data: courses, loading, error, refresh } = useAdminData(getCourses, []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => courses.filter((course) => {
    const text = `${course.title} ${course.description} ${course.difficulty}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === 'All' || course.status === statusFilter);
  }), [courses, query, statusFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    await saveCourse({
      ...editing,
      title: editing.title,
      description: editing.description,
      difficulty: editing.difficulty,
      status: editing.status,
      slug: editing.slug || slugify(editing.title),
    });
    setEditing(null);
    await refresh();
  }

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader
          title={t('admin.manageCourses')}
          subtitle={t('admin.manageCoursesSubtitle')}
          actions={<button className="btn btn-primary" onClick={() => setEditing(emptyCourse)}><Plus size={18} />{t('admin.addCourse')}</button>}
        />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {error && <AdminErrorState message={error} />}

        <AdminToolbar>
          <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.searchCourses')} />
          <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">{t('admin.all')}</option>
            <option value="Published">{t('admin.published')}</option>
            <option value="Draft">{t('admin.draft')}</option>
          </select>
        </AdminToolbar>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.course')}</th>
                <th>{t('admin.difficulty')}</th>
                <th>{t('admin.phases')}</th>
                <th>{t('admin.lessons')}</th>
                <th>{t('admin.quizzes')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr key={course.id}>
                  <td className="admin-table__highlight">{course.title}</td>
                  <td>{course.difficulty}</td>
                  <td>{course.phasesCount}</td>
                  <td>{course.lessonsCount}</td>
                  <td>{course.quizzesCount}</td>
                  <td><AdminBadge status={course.status} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-table__btn" onClick={() => setViewing(course)}><Eye size={14} />{t('admin.view')}</button>
                      <button className="admin-table__btn" onClick={() => setEditing(course)}><Pencil size={14} />{t('admin.edit')}</button>
                      <button className="admin-table__btn admin-table__btn--danger" onClick={() => setDeleting(course)}><Trash2 size={14} />{t('admin.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <AdminModal wide title={editing.id ? t('admin.editCourse') : t('admin.addCourse')} onClose={() => setEditing(null)} footer={(
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>{t('common.cancel')}</button>
              <button form="course-form" type="submit" className="btn btn-primary">{t('admin.save')}</button>
            </>
          )}>
            <form id="course-form" className="admin-form-grid" onSubmit={handleSubmit}>
              <div className="admin-form-grid__wide">
                <CourseBuilder course={editing} courses={courses} onChange={setEditing} />
              </div>
            </form>
          </AdminModal>
        )}

        {viewing && (
          <AdminModal title={viewing.title} onClose={() => setViewing(null)} footer={<button className="btn btn-primary" onClick={() => setViewing(null)}>{t('admin.close')}</button>}>
            <div className="admin-detail-grid">
              <span>{t('admin.description')}</span><strong>{viewing.description}</strong>
              <span>{t('admin.phases')}</span><strong>{viewing.phasesCount}</strong>
              <span>{t('admin.lessons')}</span><strong>{viewing.lessonsCount}</strong>
              <span>{t('admin.quizzes')}</span><strong>{viewing.quizzesCount}</strong>
              <span>{t('admin.status')}</span><strong><AdminBadge status={viewing.status} /></strong>
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
              await deleteCourse(deleting.id, deleting.title);
              setDeleting(null);
              await refresh();
            }}
          />
        )}
      </main>
    </AdminLayout>
  );
}
