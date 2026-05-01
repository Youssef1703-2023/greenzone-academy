import { useMemo, useState } from 'react';
import { Eye, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { getScores, getStudents, resetStudentProgress, toggleStudentStatus } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, ConfirmModal, formatAdminValue, useAdminData } from './AdminShared';
import './AdminPages.css';

function progressStatus(student) {
  if (Number(student.progress) >= 100 || Number(student.completedPhases) >= 1) return 'Completed Phase 1';
  if (Number(student.progress) > 0) return 'In Progress';
  return 'Not Started';
}

export default function AdminStudentsPage() {
  const { language, t } = useLanguage();
  const { data: scores } = useAdminData(getScores, []);
  const { data: students, loading, error, refresh } = useAdminData(getStudents, []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [progressFilter, setProgressFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const filtered = useMemo(() => students.filter((student) => {
    const text = `${student.name} ${student.email}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (statusFilter === 'All' || student.status === statusFilter)
      && (progressFilter === 'All' || progressStatus(student) === progressFilter);
  }), [progressFilter, query, statusFilter, students]);

  function studentScores(student) {
    return scores.filter((score) => score.studentName === student.name);
  }

  function averageScore(student) {
    const rows = studentScores(student);
    if (!rows.length) return null;
    return Math.round(rows.reduce((sum, score) => sum + score.score, 0) / rows.length);
  }

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader title={t('admin.manageStudents')} subtitle={t('admin.manageStudentsSubtitle')} />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {error && <AdminErrorState message={error} />}

        <AdminToolbar>
          <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.searchStudents')} />
          <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">{t('admin.allStatuses')}</option>
            <option value="Active">{t('admin.active')}</option>
            <option value="Disabled">{t('admin.disabled')}</option>
          </select>
          <select className="form-control" value={progressFilter} onChange={(event) => setProgressFilter(event.target.value)}>
            <option value="All">{t('admin.allProgress')}</option>
            <option value="Not Started">{t('admin.notStarted')}</option>
            <option value="In Progress">{t('admin.inProgress')}</option>
            <option value="Completed Phase 1">{t('admin.completedPhase1')}</option>
          </select>
        </AdminToolbar>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.student')}</th>
                <th>{t('admin.email')}</th>
                <th>{t('admin.progress')}</th>
                <th>{t('admin.completedLessons')}</th>
                <th>{t('admin.completedPhases')}</th>
                <th>{t('admin.lastActive')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td className="admin-table__highlight">{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.progress}%</td>
                  <td>{student.completedLessons}</td>
                  <td>{student.completedPhases}</td>
                  <td>{formatAdminValue(student.lastActive, language)}</td>
                  <td><AdminBadge status={student.status} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-table__btn" onClick={() => setSelectedStudent(student)}><Eye size={14} />{t('admin.view')}</button>
                      <button className="admin-table__btn" onClick={async () => { await toggleStudentStatus(student); await refresh(); }}>
                        {student.status === 'Disabled' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {student.status === 'Disabled' ? t('admin.enable') : t('admin.disable')}
                      </button>
                      <button className="admin-table__btn admin-table__btn--danger" onClick={() => setResetTarget(student)}><RotateCcw size={14} />{t('admin.reset')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <AdminModal title={t('admin.studentDetails')} onClose={() => setSelectedStudent(null)} footer={<button type="button" className="btn btn-primary" onClick={() => setSelectedStudent(null)}>{t('admin.close')}</button>}>
            <div className="admin-detail-grid">
              <span>{t('admin.name')}</span><strong>{selectedStudent.name}</strong>
              <span>{t('admin.email')}</span><strong>{selectedStudent.email}</strong>
              <span>{t('admin.role')}</span><strong>{selectedStudent.role}</strong>
              <span>{t('admin.status')}</span><strong><AdminBadge status={selectedStudent.status} /></strong>
              <span>{t('admin.joinedDate')}</span><strong>{formatAdminValue(selectedStudent.joinedAt, language)}</strong>
              <span>{t('admin.overallProgress')}</span><strong>{selectedStudent.progress}%</strong>
              <span>{t('admin.completedLessons')}</span><strong>{selectedStudent.completedLessons}</strong>
              <span>{t('admin.completedPhases')}</span><strong>{selectedStudent.completedPhases}</strong>
              <span>{t('admin.quizAttempts')}</span><strong>{studentScores(selectedStudent).length}</strong>
              <span>{t('admin.averageScore')}</span><strong>{formatAdminValue(averageScore(selectedStudent), language, '%')}</strong>
              <span>{t('admin.lastActive')}</span><strong>{formatAdminValue(selectedStudent.lastActive, language)}</strong>
              <span>{t('admin.adminNotes')}</span><strong>{t('admin.notesPlaceholder')}</strong>
            </div>
          </AdminModal>
        )}

        {resetTarget && (
          <ConfirmModal
            danger
            title={t('admin.resetProgress')}
            message={t('admin.resetProgressWarning')}
            confirmLabel={t('admin.reset')}
            onCancel={() => setResetTarget(null)}
            onConfirm={async () => {
              await resetStudentProgress(resetTarget);
              setResetTarget(null);
              await refresh();
            }}
          />
        )}
      </main>
    </AdminLayout>
  );
}
