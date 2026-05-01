import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { deleteCourse, getCourses, saveCourse } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, ConfirmModal, useAdminData } from './AdminShared';
import './AdminPages.css';

const emptyCourse = {
  title: '',
  description: '',
  difficulty: 'Beginner',
  status: 'Draft',
};

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
    const form = new FormData(event.currentTarget);
    await saveCourse({
      ...editing,
      title: form.get('title'),
      description: form.get('description'),
      difficulty: form.get('difficulty'),
      status: form.get('status'),
      slug: editing?.slug || form.get('title').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
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
          <AdminModal title={editing.id ? t('admin.editCourse') : t('admin.addCourse')} onClose={() => setEditing(null)} footer={(
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>{t('common.cancel')}</button>
              <button form="course-form" type="submit" className="btn btn-primary">{t('admin.save')}</button>
            </>
          )}>
            <form id="course-form" className="admin-form-grid" onSubmit={handleSubmit}>
              <label>{t('admin.courseTitle')}<input name="title" className="form-control" defaultValue={editing.title} required /></label>
              <label>{t('admin.difficulty')}<select name="difficulty" className="form-control" defaultValue={editing.difficulty}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
              <label>{t('admin.status')}<select name="status" className="form-control" defaultValue={editing.status}><option>Published</option><option>Draft</option></select></label>
              <label className="admin-form-grid__wide">{t('admin.description')}<textarea name="description" className="form-control" rows="4" defaultValue={editing.description} /></label>
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
