import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Languages, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { deleteLesson, getCourses, getLessons, getPhases, saveLesson } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, ConfirmModal, formatAdminValue, useAdminData } from './AdminShared';
import AdminLessonBuilder from './AdminLessonBuilder';
import './AdminPages.css';

function createLessonContent(title = '') {
  return {
    title,
    credit: 'Prepared by: JoeTech',
    overview: '',
    objectives: [],
    keyTerms: [],
    sections: [],
  };
}

export default function AdminLessonsPage() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { data: courses, error: coursesError } = useAdminData(getCourses, []);
  const { data: phases, error: phasesError } = useAdminData(getPhases, []);
  const { data: lessons, loading, error, refresh } = useAdminData(getLessons, []);
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [editing, setEditing] = useState(null);
  const [editorContent, setEditorContent] = useState(createLessonContent());
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const filtered = useMemo(() => lessons.filter((lesson) => {
    const text = `${lesson.title} ${lesson.courseTitle} ${lesson.phaseTitle}`.toLowerCase();
    const statusMatch = statusFilter === 'All'
      || lesson.status === statusFilter
      || (statusFilter === 'Missing Translation' && lesson.arabicStatus === 'Missing');
    return text.includes(query.toLowerCase())
      && (courseFilter === 'All' || lesson.courseId === courseFilter)
      && (phaseFilter === 'All' || String(lesson.phaseId) === String(phaseFilter))
      && statusMatch;
  }), [courseFilter, lessons, phaseFilter, query, statusFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    const submitAction = event.nativeEvent?.submitter?.value;
    const form = new FormData(event.currentTarget);
    const course = courses.find((item) => item.id === form.get('courseId')) || courses[0];
    const phase = phases.find((item) => item.id === form.get('phaseRecordId')) || phases[0];
    const lessonTitle = form.get('title');
    const contentJson = {
      ...editorContent,
      title: editorContent.title || lessonTitle,
    };

    await saveLesson({
      ...editing,
      courseId: course.id,
      courseTitle: course.title,
      phaseRecordId: phase?.id,
      phaseId: Number(phase?.order || form.get('phaseId') || 1),
      phaseTitle: phase?.title || `Phase ${phase?.order || form.get('phaseId')}`,
      order: Number(form.get('order')),
      title: lessonTitle,
      contentJson,
      status: submitAction === 'publish' ? 'Published' : submitAction === 'draft' ? 'Draft' : form.get('status'),
      englishStatus: form.get('englishStatus'),
      arabicStatus: form.get('arabicStatus'),
      translationSource: form.get('translationSource'),
      hashStatus: form.get('hashStatus'),
      readingTime: form.get('readingTime'),
    });
    setEditing(null);
    await refresh();
  }

  function openLessonEditor(lesson = null) {
    const draft = lesson || {
      status: 'Draft',
      englishStatus: 'Missing',
      arabicStatus: 'Missing',
      hashStatus: 'N/A',
    };
    setEditing(draft);
    setHasPreviewed(false);
    setEditorContent(draft.contentJson || createLessonContent(draft.title));
  }

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader
          title={t('admin.manageLessons')}
          subtitle={t('admin.manageLessonsSubtitle')}
          actions={<button className="btn btn-primary" onClick={() => openLessonEditor()}><Plus size={18} />{t('admin.addLesson')}</button>}
        />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {(error || coursesError || phasesError) && <AdminErrorState message={error || coursesError || phasesError} />}

        <AdminToolbar>
          <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.searchLessons')} />
          <select className="form-control" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <option value="All">{t('admin.allCourses')}</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <select className="form-control" value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}>
            <option value="All">{t('admin.allPhases')}</option>
            {phases.map((phase) => <option key={phase.id} value={phase.order}>{phase.title}</option>)}
          </select>
          <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">{t('admin.allStatuses')}</option>
            <option value="Published">{t('admin.published')}</option>
            <option value="Draft">{t('admin.draft')}</option>
            <option value="Missing Translation">{t('admin.missingTranslation')}</option>
          </select>
        </AdminToolbar>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.lesson')}</th>
                <th>{t('admin.phase')}</th>
                <th>{t('admin.order')}</th>
                <th>{t('admin.englishStatus')}</th>
                <th>{t('admin.arabicStatus')}</th>
                <th>{t('admin.readingTime')}</th>
                <th>{t('admin.completions')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lesson) => (
                <tr key={lesson.id}>
                  <td className="admin-table__highlight">{lesson.title}</td>
                  <td>{lesson.phaseTitle}</td>
                  <td>{lesson.order}</td>
                  <td><AdminBadge status={lesson.englishStatus} /></td>
                  <td><AdminBadge status={lesson.arabicStatus} /></td>
                  <td>{formatAdminValue(lesson.readingTime, language)}</td>
                  <td>{formatAdminValue(lesson.completionCount, language)}</td>
                  <td><AdminBadge status={lesson.status} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <Link className="admin-table__btn" to={lesson.route}><Eye size={14} />{t('admin.preview')}</Link>
                      <button className="admin-table__btn" onClick={() => openLessonEditor(lesson)}><Pencil size={14} />{t('admin.edit')}</button>
                      <Link className="admin-table__btn" to="/admin/translations"><Languages size={14} />{t('admin.translation')}</Link>
                      <button className="admin-table__btn admin-table__btn--danger" onClick={() => setDeleting(lesson)}><Trash2 size={14} />{t('admin.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <AdminModal wide title={editing.id ? t('admin.editLesson') : t('admin.addLesson')} onClose={() => setEditing(null)} footer={(
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>{t('common.cancel')}</button>
              <button form="lesson-form" type="submit" name="saveAction" value="draft" className="btn btn-secondary">{t('admin.draft')}</button>
              <button
                form="lesson-form"
                type="submit"
                name="saveAction"
                value="publish"
                className="btn btn-primary"
                disabled={!hasPreviewed}
                title={!hasPreviewed ? 'Open Preview before publishing' : ''}
              >
                {t('admin.published')}
              </button>
            </>
          )}>
            <form id="lesson-form" className="admin-form-grid" onSubmit={handleSubmit}>
              <label>{t('admin.course')}<select name="courseId" className="form-control" defaultValue={editing.courseId || courses[0]?.id}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
              <label>{t('admin.phase')}<select name="phaseRecordId" className="form-control" defaultValue={phases.find((phase) => Number(phase.order) === Number(editing.phaseId))?.id || phases[0]?.id}>{phases.map((phase) => <option key={phase.id} value={phase.id}>{phase.title}</option>)}</select></label>
              <label>{t('admin.phaseNumber')}<input name="phaseId" type="number" className="form-control" defaultValue={editing.phaseId || 1} required /></label>
              <label>{t('admin.order')}<input name="order" type="number" className="form-control" defaultValue={editing.order || 1} required /></label>
              <label>{t('admin.lessonTitle')}<input name="title" className="form-control" defaultValue={editing.title || ''} required /></label>
              <label>{t('admin.status')}<select name="status" className="form-control" defaultValue={editing.status || 'Draft'}><option>Published</option><option>Draft</option></select></label>
              <label>{t('admin.englishStatus')}<select name="englishStatus" className="form-control" defaultValue={editing.englishStatus || 'Missing'}><option>Ready</option><option>Missing</option></select></label>
              <label>{t('admin.arabicStatus')}<select name="arabicStatus" className="form-control" defaultValue={editing.arabicStatus || 'Missing'}><option>Ready</option><option>Missing</option><option>Stale</option></select></label>
              <label>{t('admin.translationSource')}<select name="translationSource" className="form-control" defaultValue={editing.translationSource || 'Missing'}><option>Manual</option><option>Google</option><option>Missing</option></select></label>
              <label>{t('admin.hashStatus')}<select name="hashStatus" className="form-control" defaultValue={editing.hashStatus || 'N/A'}><option>Fresh</option><option>Stale</option><option>N/A</option></select></label>
              <label>{t('admin.readingTime')}<input name="readingTime" className="form-control" defaultValue={editing.readingTime || 'N/A'} /></label>
              <div className="admin-form-grid__wide">
                <AdminLessonBuilder value={editorContent} onChange={setEditorContent} fallbackTitle={editing.title} onPreview={() => setHasPreviewed(true)} />
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
              await deleteLesson(deleting.id, deleting.title);
              setDeleting(null);
              await refresh();
            }}
          />
        )}
      </main>
    </AdminLayout>
  );
}
